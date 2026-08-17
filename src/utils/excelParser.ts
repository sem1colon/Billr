import * as XLSX from 'xlsx';
import { ExcelParsedRecord, InvoiceItem } from '../types';

export interface ParseResult {
  records: ExcelParsedRecord[];
  customers: string[];
  totalQty: number;
  totalCommissionAmount: number;
  sheetNames: string[];
  rawHeaders: string[];
  ignoredColumns: string[];
}

export function parseExcelFile(fileData: ArrayBuffer | Uint8Array): ParseResult {
  const workbook = XLSX.read(fileData, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  
  if (sheetNames.length === 0) {
    throw new Error('The uploaded file does not contain any sheets.');
  }

  // Look for sheets named 'Working', 'Commission', 'Statement', or default to first sheet
  let activeSheetName = sheetNames[0];
  const preferredSheet = sheetNames.find(s => 
    s.toLowerCase().includes('working') || 
    s.toLowerCase().includes('commission') || 
    s.toLowerCase().includes('statement')
  );
  if (preferredSheet) {
    activeSheetName = preferredSheet;
  }

  const worksheet = workbook.Sheets[activeSheetName];
  // Parse rows as raw array of arrays
  const rawRows: (string | number | null | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (rawRows.length === 0) {
    throw new Error('The selected sheet is empty.');
  }

  // Search for the header row
  let headerRowIndex = -1;
  let colIndices = {
    customer: -1,
    invNo: -1,
    date: -1,
    product: -1,
    qty: -1,
    unitPrice: -1,
    commRate: -1,
    commAmt: -1,
  };

  const ignoredColumns: string[] = [];

  for (let r = 0; r < Math.min(rawRows.length, 12); r++) {
    const row = rawRows[r].map(c => String(c ?? '').trim().toLowerCase());
    
    // Check if this row looks like a header row
    const hasProductOrItem = row.some(c => c.includes('product') || c.includes('item') || c.includes('description') || c.includes('service') || c.includes('particular'));
    const hasQty = row.some(c => c === 'qty' || c.includes('quantity') || c.includes('weight'));
    const hasComm = row.some(c => c.includes('comm') || c.includes('rate') || c.includes('price') || c.includes('amt') || c.includes('amount'));

    if ((hasProductOrItem && (hasQty || hasComm)) || (row.includes('customer') && row.some(c => c.includes('inv')))) {
      headerRowIndex = r;
      
      row.forEach((colName, idx) => {
        if (colName.includes('customer') || colName.includes('client') || colName.includes('buyer') || colName.includes('party')) {
          colIndices.customer = idx;
        } else if (colName.includes('inv') || colName.includes('bill') || colName.includes('invoice')) {
          colIndices.invNo = idx;
        } else if (colName.includes('date') || colName.includes('dt')) {
          colIndices.date = idx;
        } else if (colName.includes('product') || colName.includes('desc') || colName.includes('particular') || colName.includes('item') || colName.includes('service')) {
          colIndices.product = idx;
        } else if (colName === 'qty' || colName.includes('quantity') || colName.includes('weight') || colName.includes('kgs')) {
          colIndices.qty = idx;
        } else if (colName.includes('sales price') || colName.includes('sale price') || colName.includes('unit price') || colName.includes('product rate') || colName.includes('basic price') || colName.includes('selling price')) {
          colIndices.unitPrice = idx;
        } else if (colName.includes('comm/kg') || colName.includes('comm rate') || colName.includes('rate/kg') || colName.includes('comm/unit') || (colName.includes('comm') && !colName.includes('amt') && !colName.includes('amount'))) {
          colIndices.commRate = idx;
        } else if (colName.includes('comm amt') || colName.includes('comm amount') || colName.includes('commission amt') || (colName.includes('amt') && !colName.includes('sales')) || colName.includes('total')) {
          if (colIndices.commAmt === -1) {
            colIndices.commAmt = idx;
          }
        }
      });
      break;
    }
  }

  // Fallback if header wasn't found by keywords: assume first non-empty row
  if (headerRowIndex === -1) {
    headerRowIndex = 0;
    const row = rawRows[0].map(c => String(c ?? '').trim().toLowerCase());
    row.forEach((colName, idx) => {
      if (colName.includes('cust')) colIndices.customer = idx;
      else if (colName.includes('inv')) colIndices.invNo = idx;
      else if (colName.includes('date')) colIndices.date = idx;
      else if (colName.includes('prod') || colName.includes('desc')) colIndices.product = idx;
      else if (colName.includes('qty')) colIndices.qty = idx;
      else if (colName.includes('sales') || colName.includes('unit')) colIndices.unitPrice = idx;
      else if (colName.includes('rate') || colName.includes('comm')) colIndices.commRate = idx;
      else if (colName.includes('amt')) colIndices.commAmt = idx;
    });
  }

  const rawHeaders = rawRows[headerRowIndex]?.map(c => String(c ?? '').trim()) || [];
  const records: ExcelParsedRecord[] = [];
  const customersSet = new Set<string>();

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    // Check if this is a "TOTAL" row
    const firstCell = String(row[0] ?? '').trim().toUpperCase();
    if (firstCell.includes('TOTAL') || firstCell.includes('SUBTOTAL') || firstCell.includes('TAXABLE')) {
      continue;
    }

    const customer = colIndices.customer !== -1 ? String(row[colIndices.customer] ?? '').trim() : 'General Customer';
    const invNo = colIndices.invNo !== -1 ? String(row[colIndices.invNo] ?? '').trim() : '';
    let dateVal = colIndices.date !== -1 ? String(row[colIndices.date] ?? '').trim() : '';
    
    // Excel date numeric formatting handling
    if (typeof row[colIndices.date] === 'number') {
      const parsedDate = XLSX.SSF.parse_date_code(row[colIndices.date] as number);
      if (parsedDate) {
        dateVal = `${parsedDate.d}-${parsedDate.m}-${parsedDate.y}`;
      }
    }

    const product = colIndices.product !== -1 ? String(row[colIndices.product] ?? '').trim() : '';
    
    // Skip completely empty product rows
    if (!product && !customer && !invNo) continue;

    const rawQty = colIndices.qty !== -1 ? String(row[colIndices.qty] ?? '').replace(/,/g, '').trim() : '0';
    const rawUnitPrice = colIndices.unitPrice !== -1 ? String(row[colIndices.unitPrice] ?? '').replace(/[@₹$,]/g, '').trim() : '0';
    const rawRate = colIndices.commRate !== -1 ? String(row[colIndices.commRate] ?? '').replace(/[@₹$,]/g, '').trim() : '0';
    const rawAmt = colIndices.commAmt !== -1 ? String(row[colIndices.commAmt] ?? '').replace(/[@₹$,]/g, '').trim() : '0';

    const qty = parseFloat(rawQty) || 0;
    const unitPrice = parseFloat(rawUnitPrice) || 0;
    let commPerKg = parseFloat(rawRate) || 0;
    let commAmt = parseFloat(rawAmt) || 0;

    // If amount is missing but qty and rate exist, compute it
    if (commAmt === 0 && qty > 0 && commPerKg > 0) {
      commAmt = Number((qty * commPerKg).toFixed(2));
    } else if (commPerKg === 0 && qty > 0 && commAmt > 0) {
      commPerKg = Number((commAmt / qty).toFixed(4));
    }

    if (customer) {
      customersSet.add(customer);
    }

    records.push({
      customer: customer || 'General Customer',
      invNo,
      date: dateVal,
      product: product || 'Commission Service',
      qty,
      unitPrice,
      commPerKg,
      commAmt,
    });
  }

  const customers = Array.from(customersSet).filter(Boolean);
  const totalQty = records.reduce((acc, r) => acc + (r.qty || 0), 0);
  const totalCommissionAmount = records.reduce((acc, r) => acc + (r.commAmt || 0), 0);

  return {
    records,
    customers,
    totalQty,
    totalCommissionAmount,
    sheetNames,
    rawHeaders,
    ignoredColumns,
  };
}

export function convertParsedRecordsToInvoiceItems(records: ExcelParsedRecord[], selectedCustomer?: string): InvoiceItem[] {
  const filtered = selectedCustomer && selectedCustomer !== 'ALL'
    ? records.filter(r => r.customer === selectedCustomer)
    : records;

  return filtered.map((r, idx) => {
    const desc = selectedCustomer === 'ALL' && r.customer
      ? `${r.product} (${r.customer})`
      : r.product;

    const unitPriceVal = r.unitPrice || 0;
    const qtyVal = r.qty || 1;
    const productAmountVal = unitPriceVal > 0 ? Number((qtyVal * unitPriceVal).toFixed(2)) : undefined;

    return {
      id: `imported-${Date.now()}-${idx}`,
      description: desc || 'Commission Item',
      hsnSacCode: '998311', // Standard Indian SAC code for Business Auxiliary / Commission agent services
      qty: qtyVal,
      unit: qtyVal > 1 ? 'kg' : 'Lot',
      unitPrice: unitPriceVal > 0 ? unitPriceVal : undefined,
      productAmount: productAmountVal,
      commissionType: 'PER_UNIT',
      commissionRate: r.commPerKg || 0,
      commissionAmount: r.commAmt || (qtyVal * (r.commPerKg || 0)),
      invNo: r.invNo,
      date: r.date,
      customer: r.customer,
    };
  });
}

export function exportSampleExcelWorkbook(): void {
  const data = [
    ['MURTHY CHEMICAL AGENCIES - COMMISSION STATEMENT'],
    ['Customer', 'Inv.No', 'Date', 'Product', 'Qty', 'Unit Price (₹)', 'Comm/kg (₹)', 'Comm Amt (₹)'],
    ['BIO AGRO ENERGY PVT LTD', '800086408', '28-Jan-26', 'SPIRIZYME ADV ULTI', 360, 550, 16.5, 5940],
    ['BIO AGRO ENERGY PVT LTD', '800087967', '6-Mar-26', 'SPIRIZYME ADV ULTI', 3480, 550, 16.5, 57420],
    ['BIO AGRO ENERGY PVT LTD', '800089619', '14-Apr-26', 'EFFYGREN', 30, 2800, 84, 2520],
    ['BIO AGRO ENERGY PVT LTD', '800089619', '14-Apr-26', 'RM-20', 10, 26000, 780, 7800],
    ['BIO AGRO ENERGY PVT LTD', '800089619', '14-Apr-26', 'SPIRIZYME ADV ULTI', 1590, 550, 16.5, 26235],
    ['BIO AGRO ENERGY PVT LTD', '800089619', '14-Apr-26', 'FORTIVA REVO X', 375, 1965, 58.95, 22106.25],
    ['BIO AGRO ENERGY PVT LTD', '800089619', '14-Apr-26', 'ALCOHOL ACTIVE DR', 320, 640, 19.2, 6144],
    ['RAVINDRA AND COMPANY LTD', '800089707', '17-Apr-26', 'EFFYMOLL+', 75, 2700, 780, 58500],
    ['SNJ SUGARS AND PRODUCTS LTD', '800091196', '4-Jun-26', 'EFFYGREN', 350, 3000, 600, 210000],
    ['THE ANDHRA SUGARS LTD', '800091867', '23-Jun-26', 'EFFYMOLL+', 50, 3300, 779, 38950],
    ['VISHWA SAMUDRA BIO ENERGY PVT LTD', '800082526', '30-Oct-25', 'FORTIVA REVO X', 1002, 1608.75, 9.6525, 9671.80],
    ['VISHWA SAMUDRA BIO ENERGY PVT LTD', '800082526', '30-Oct-25', 'SPIRIZYME ADV ULTI', 8249, 483.45, 2.9007, 23927.87],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Working');
  XLSX.writeFile(wb, 'MCA_Commission_Statement_Sample.xlsx');
}
