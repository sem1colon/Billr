import * as XLSX from 'xlsx';
import { ExcelParsedRecord, InvoiceItem } from '../types';

export interface ParseResult {
  records: ExcelParsedRecord[];
  customers: string[];
  totalQty: number;
  totalCommissionAmount: number;
  sheetNames: string[];
  activeSheetName: string;
  rawHeaders: string[];
}

function stableRecordId(customer: string, invNo: string, date: string, product: string, rowIndex: number): string {
  const source = [customer, invNo, date, product, String(rowIndex)].join('|').toLowerCase();
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `record-${(hash >>> 0).toString(16)}`;
}

export function normalizeExcelDate(value: unknown): string {
  if (typeof value === 'number') {
    const parsedDate = XLSX.SSF.parse_date_code(value);
    if (parsedDate) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${parsedDate.d}-${monthNames[parsedDate.m - 1] || parsedDate.m}-${String(parsedDate.y).slice(-2)}`;
    }
  }

  const dateText = String(value ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(dateText)) {
    const timestampMatch = dateText.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (timestampMatch) {
      const [, year, month, day, hour, minute] = timestampMatch;
      const utcMinutes = Number(hour) * 60 + Number(minute);
      const indiaMinutes = utcMinutes + 331;
      const dayOffset = Math.floor(indiaMinutes / 1440);
      const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + dayOffset));
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${date.getUTCDate()}-${monthNames[date.getUTCMonth()]}-${String(date.getUTCFullYear()).slice(-2)}`;
    }
  }

  return dateText;
}

/**
 * Universal Excel & CSV file parser
 * Supports: .xlsx, .xls, .csv, .tsv, .txt
 */
export function parseExcelFile(
  fileData: ArrayBuffer | Uint8Array | string, 
  targetSheetName?: string
): ParseResult {
  let workbook: XLSX.WorkBook;

  if (typeof fileData === 'string') {
    workbook = XLSX.read(fileData, { type: 'string', raw: true });
  } else {
    workbook = XLSX.read(fileData, { type: 'array' });
  }

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('The uploaded file does not contain any readable sheets or data.');
  }

  // Default imports always use the first worksheet. Other sheets remain available
  // through the explicit sheet selector in the import view.
  const activeSheetName = targetSheetName && sheetNames.includes(targetSheetName)
    ? targetSheetName
    : sheetNames[0];

  const worksheet = workbook.Sheets[activeSheetName];
  if (!worksheet) {
    throw new Error(`Sheet "${activeSheetName}" could not be loaded.`);
  }

  // Parse raw rows (array of arrays)
  const rawRows: (string | number | null | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (rawRows.length === 0) {
    throw new Error(`The sheet "${activeSheetName}" is empty.`);
  }

  // Search for the header row
  let headerRowIndex = -1;
  let summaryMode = false;
  const colIndices = {
    customer: -1,
    invNo: -1,
    date: -1,
    product: -1,
    qty: -1,
    unitPrice: -1,
    commRate: -1,
    commAmt: -1,
  };
  const unitPriceCandidates: number[] = [];

  // Inspect first 15 rows for header row keywords
  for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
    const row = rawRows[r].map(c => String(c ?? '').trim().toLowerCase());
    
    const hasProductOrItem = row.some(c => 
      c.includes('product') || c.includes('item') || c.includes('desc') || 
      c.includes('service') || c.includes('particular') || c.includes('material')
    );
    const hasQty = row.some(c => 
      c === 'qty' || c.includes('quantity') || c.includes('weight') || c.includes('kgs') || c.includes('lot')
    );
    const hasComm = row.some(c => 
      c.includes('comm') || c.includes('rate') || c.includes('price') || c.includes('amt') || c.includes('amount') || c.includes('brokerage')
    );
    const hasCustomer = row.some(c => 
      c.includes('customer') || c.includes('client') || c.includes('buyer') || c.includes('party') || 
      c.includes('cust') || c.includes('account') || c.includes('dealer') || c.includes('company') || 
      c.includes('consignee') || c.includes('distributor') || c.includes('purchaser') || c === 'name' || 
      c.includes('party name') || c.includes('customer name') || c.includes('m/s')
    );
    const hasSummaryWorkbookSignals = !hasProductOrItem && !hasQty && hasCustomer && (
      row.some(c => c.includes('dealer margin') || c.includes('total') || c.includes('amount')) ||
      row.some(c => c.includes('margin'))
    );

    if ((hasProductOrItem && (hasQty || hasComm)) || (hasCustomer && (row.some(c => c.includes('inv') || c.includes('bill')) || hasQty)) || hasSummaryWorkbookSignals) {
      headerRowIndex = r;
      const commAmtCandidates: number[] = [];
      
      row.forEach((colName, idx) => {
        if (
          colName.includes('customer') || 
          colName.includes('client') || 
          colName.includes('buyer') || 
          colName.includes('party') || 
          colName.includes('cust') || 
          colName.includes('account') ||
          colName.includes('dealer') ||
          colName.includes('company') ||
          colName.includes('consignee') ||
          colName.includes('distributor') ||
          colName.includes('purchaser') ||
          colName === 'name' ||
          colName.includes('party name') ||
          colName.includes('customer name') ||
          colName.includes('client name') ||
          colName.includes('m/s')
        ) {
          if (colIndices.customer === -1) colIndices.customer = idx;
        } else if (colName.includes('inv') || colName.includes('bill') || colName.includes('invoice') || colName.includes('doc') || colName.includes('ref')) {
          if (colIndices.invNo === -1) colIndices.invNo = idx;
        } else if (colName.includes('date') || colName.includes('dt') || colName === 'd.o.b') {
          if (colIndices.date === -1) colIndices.date = idx;
        } else if (colName.includes('product') || colName.includes('desc') || colName.includes('particular') || colName.includes('item') || colName.includes('service') || colName.includes('material')) {
          if (colIndices.product === -1) colIndices.product = idx;
        } else if (colName === 'qty' || colName.includes('quantity') || colName.includes('weight') || colName.includes('kgs') || colName.includes('volume')) {
          if (colIndices.qty === -1) colIndices.qty = idx;
        } else if (colName.includes('sales price') || colName.includes('sale price') || colName.includes('unit price') || colName.includes('product rate') || colName.includes('basic price') || colName.includes('selling price') || colName.includes('rate/unit') || colName.includes('sales rate')) {
          unitPriceCandidates.push(idx);
          if (colIndices.unitPrice === -1) colIndices.unitPrice = idx;
        } else if (colName.includes('comm/kg') || colName.includes('comm rate') || colName.includes('rate/kg') || colName.includes('comm/unit') || colName.includes('comm %') || (colName.includes('comm') && !colName.includes('amt') && !colName.includes('amount')) || colName.includes('brokerage rate')) {
          if (colIndices.commRate === -1) colIndices.commRate = idx;
        } else if (
          colName.includes('dealer margin') ||
          colName.includes('margin') ||
          colName.includes('comm amt') ||
          colName.includes('comm amount') ||
          colName.includes('commission amt') ||
          colName.includes('commission amount') ||
          colName.includes('taxable') ||
          colName.includes('brokerage amt') ||
          colName.includes('brokerage amount')
        ) {
          commAmtCandidates.push(idx);
        } else if (
          colName.includes('amount') ||
          colName.includes('total') ||
          (colName.includes('amt') && !colName.includes('sales'))
        ) {
          commAmtCandidates.push(idx);
        }
      });

      if (commAmtCandidates.length > 0) {
        const rankedCommAmtIndex = commAmtCandidates
          .slice()
          .sort((leftIndex, rightIndex) => {
            const leftName = row[leftIndex] ?? '';
            const rightName = row[rightIndex] ?? '';
            const score = (name: string) => {
              if (name.includes('dealer margin') || name.includes('margin')) return 5;
              if (name.includes('comm amt') || name.includes('comm amount') || name.includes('commission amt') || name.includes('commission amount') || name.includes('brokerage amt')) return 4;
              if (name.includes('taxable')) return 3;
              if (name.includes('amount') || name.includes('total')) return 2;
              if (name.includes('amt')) return 1;
              return 0;
            };
            return score(rightName) - score(leftName);
          })[0];
        colIndices.commAmt = rankedCommAmtIndex;
      }

      const rawHeaderText = row.join(' ').toLowerCase();
      if (
        colIndices.customer !== -1 &&
        colIndices.commAmt !== -1 &&
        !rawHeaderText.includes('product') &&
        !rawHeaderText.includes('qty') &&
        !rawHeaderText.includes('quantity') &&
        (rawHeaderText.includes('dealer margin') || rawHeaderText.includes('total') || rawHeaderText.includes('amount') || rawHeaderText.includes('margin'))
      ) {
        summaryMode = true;
      }
      break;
    }
  }

  if (unitPriceCandidates.length > 1) {
    const numericValueCount = (columnIndex: number) => rawRows
      .slice(headerRowIndex + 1)
      .filter(row => {
        const value = row[columnIndex];
        if (value === null || value === undefined || value === '') return false;
        const parsed = typeof value === 'number'
          ? value
          : Number(String(value).replace(/[@₹$,%\s]/g, ''));
        return Number.isFinite(parsed);
      }).length;

    colIndices.unitPrice = unitPriceCandidates
      .slice()
      .sort((left, right) => numericValueCount(right) - numericValueCount(left))[0];
  }

  // Fallback if header wasn't found by strict keywords: assume first non-empty row
  if (headerRowIndex === -1) {
    headerRowIndex = 0;
    const row = rawRows[0].map(c => String(c ?? '').trim().toLowerCase());
    row.forEach((colName, idx) => {
      if (
        colName.includes('cust') || 
        colName.includes('party') || 
        colName.includes('client') || 
        colName.includes('buyer') || 
        colName.includes('account') ||
        colName.includes('dealer') ||
        colName.includes('company') ||
        colName === 'name' ||
        colName.includes('name of') ||
        colName.includes('m/s')
      ) colIndices.customer = idx;
      else if (colName.includes('inv') || colName.includes('bill')) colIndices.invNo = idx;
      else if (colName.includes('date') || colName.includes('dt')) colIndices.date = idx;
      else if (colName.includes('prod') || colName.includes('desc') || colName.includes('item')) colIndices.product = idx;
      else if (colName.includes('qty') || colName.includes('weight')) colIndices.qty = idx;
      else if (colName.includes('sales') || colName.includes('unit')) colIndices.unitPrice = idx;
      else if (colName.includes('rate') || colName.includes('comm')) colIndices.commRate = idx;
      else if (colName.includes('amt') || colName.includes('total') || colName.includes('val')) colIndices.commAmt = idx;
    });
  }

  const rawHeaders = rawRows[headerRowIndex]?.map(c => String(c ?? '').trim()) || [];
  const summaryHeaderLooksValid = colIndices.customer !== -1 && colIndices.commAmt !== -1 && colIndices.product === -1 && colIndices.qty === -1 && rawHeaders.some(header => /dealer margin|margin|amount|total/i.test(String(header)));

  if (summaryMode && rawHeaders.length > 0) {
    const dealerMarginIndex = rawHeaders.findIndex(header => /dealer margin|margin/i.test(String(header)));
    const summaryAmountIndex = rawHeaders.findIndex(header => /amount|total/i.test(String(header)));
    if (dealerMarginIndex !== -1) {
      colIndices.commAmt = dealerMarginIndex;
    } else if (summaryAmountIndex !== -1 && colIndices.commAmt === -1) {
      colIndices.commAmt = summaryAmountIndex;
    }
  }

  if (colIndices.product === -1 && !summaryMode && !summaryHeaderLooksValid) {
    throw new Error('Missing product column. Add a Product, Item, Description, or Service column and upload the file again.');
  }
  if (colIndices.qty === -1 && !summaryMode && !summaryHeaderLooksValid) {
    throw new Error('Missing quantity column. Add a Qty, Quantity, Weight, or Volume column and upload the file again.');
  }
  if (colIndices.commAmt === -1 && !summaryHeaderLooksValid) {
    throw new Error('Missing commission amount column. Add a Commission Amount, Taxable, Dealer Margin, or Brokerage Amount column and upload the file again.');
  }
  const records: ExcelParsedRecord[] = [];
  const customersSet = new Set<string>();
  let lastCustomer = '';

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    // Check if this is a "TOTAL" or header-like row
    const firstCell = String(row[0] ?? '').trim().toUpperCase();
    const secondCell = String(row[1] ?? '').trim().toUpperCase();
    if (
      firstCell.includes('TOTAL') || firstCell.includes('SUBTOTAL') || firstCell.includes('TAXABLE') ||
      secondCell.includes('TOTAL') || secondCell.includes('GRAND TOTAL')
    ) {
      continue;
    }

    let customer = colIndices.customer !== -1 ? String(row[colIndices.customer] ?? '').trim() : '';
    const invNo = colIndices.invNo !== -1 ? String(row[colIndices.invNo] ?? '').trim() : '';
    let dateVal = colIndices.date !== -1 ? normalizeExcelDate(row[colIndices.date]) : '';
    
    // Excel date numeric formatting handling

    const product = colIndices.product !== -1 ? String(row[colIndices.product] ?? '').trim() : '';
    const isSummaryRow = summaryMode && !product && colIndices.customer !== -1;

    // Clean numeric inputs
    const cleanNumber = (val: any): number => {
      if (val === null || val === undefined || val === '') return 0;
      if (typeof val === 'number') return isNaN(val) ? 0 : val;
      const str = String(val).replace(/[@₹$,\s%]/g, '').trim();
      const num = parseFloat(str);
      return isNaN(num) ? 0 : num;
    };

    const qty = colIndices.qty !== -1 ? cleanNumber(row[colIndices.qty]) : 0;
    const unitPrice = colIndices.unitPrice !== -1 ? cleanNumber(row[colIndices.unitPrice]) : 0;
    let commPerKg = colIndices.commRate !== -1 ? cleanNumber(row[colIndices.commRate]) : 0;
    let commAmt = colIndices.commAmt !== -1 ? cleanNumber(row[colIndices.commAmt]) : 0;

    if (isSummaryRow) {
      const resolvedProduct = `MCA Commission (${customer || lastCustomer || 'Customer'})`;
      const resolvedQty = qty > 0 ? qty : 1;
      const resolvedCommAmt = commAmt || 0;

      records.push({
        id: stableRecordId(customer || lastCustomer || 'General Customer', invNo, dateVal, resolvedProduct, r),
        customer: customer || lastCustomer || 'General Customer',
        invNo,
        date: dateVal,
        product: resolvedProduct,
        qty: resolvedQty,
        unitPrice,
        commPerKg: commPerKg || 0,
        commAmt: resolvedCommAmt,
        selected: true,
      });
      continue;
    }

    // Skip empty lines
    if (!product && !customer && !invNo && qty === 0 && commAmt === 0) {
      continue;
    }

    // Forward fill / propagate customer name across merged or multi-line items
    if (customer && !customer.toUpperCase().includes('TOTAL')) {
      lastCustomer = customer;
    } else if (!customer && lastCustomer && (product || qty > 0 || commAmt > 0 || invNo)) {
      customer = lastCustomer;
    }

    // Auto-calculate missing commission amount or rate
    if (commAmt === 0 && qty > 0 && commPerKg > 0) {
      commAmt = Number((qty * commPerKg).toFixed(2));
    } else if (commPerKg === 0 && qty > 0 && commAmt > 0) {
      commPerKg = Number((commAmt / qty).toFixed(4));
    }

    const resolvedCustomer = customer || lastCustomer || 'General Customer';
    if (resolvedCustomer && resolvedCustomer !== 'General Customer') {
      customersSet.add(resolvedCustomer);
    } else if (resolvedCustomer === 'General Customer' && customersSet.size === 0) {
      customersSet.add(resolvedCustomer);
    }

    records.push({
      id: stableRecordId(resolvedCustomer, invNo, dateVal, product || 'Chemical Agency Commission', r),
      customer: resolvedCustomer,
      invNo,
      date: dateVal,
      product: product || 'Chemical Agency Commission',
      qty,
      unitPrice,
      commPerKg,
      commAmt,
      selected: true,
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
    activeSheetName,
    rawHeaders,
  };
}

/**
 * Converts selected parsed records into official GST Invoice Line Items
 */
export function convertParsedRecordsToInvoiceItems(
  records: ExcelParsedRecord[], 
  selectedCustomer?: string
): InvoiceItem[] {
  const filtered = records
    .filter(r => r.selected !== false)
    .filter(r => !selectedCustomer || selectedCustomer === 'ALL' || r.customer === selectedCustomer);

  return filtered.map((r) => {
    // Include customer name in description if not already present
    const hasCustomerInProduct = r.customer && r.product.toLowerCase().includes(r.customer.toLowerCase());
    const desc = r.customer && !hasCustomerInProduct
      ? `${r.product} (${r.customer})`
      : r.product;

    const unitPriceVal = r.unitPrice || 0;
    const qtyVal = r.qty || 1;
    const productAmountVal = unitPriceVal > 0 ? Number((qtyVal * unitPriceVal).toFixed(2)) : undefined;

    return {
      id: `imported-${r.id}`,
      description: desc || 'Commission Item',
      hsnSacCode: '998311', // SAC code for Business Auxiliary / Commercial Agency services
      qty: qtyVal,
      unit: qtyVal > 1 ? 'kg' : 'Lot',
      unitPrice: unitPriceVal > 0 ? unitPriceVal : undefined,
      productAmount: productAmountVal,
      commissionType: 'PER_UNIT',
      commissionRate: r.commPerKg || 0,
      commissionAmount: r.commAmt || Number((qtyVal * (r.commPerKg || 0)).toFixed(2)),
      invNo: r.invNo,
      date: r.date,
      customer: r.customer,
    };
  });
}

/**
 * Export standard Excel workbook template with sample data (MCA Commission Working)
 */
export function exportSampleExcelWorkbook(): void {
  const data = [
    ['MURTHY CHEMICAL AGENCIES - COMMISSION WORKING SHEET'],
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
  XLSX.utils.book_append_sheet(wb, ws, 'MCA Commission');
  XLSX.writeFile(wb, 'MCA_Commission_working_08.08.2026.xlsx');
}

/**
 * Export sample CSV template
 */
export function exportSampleCsv(): void {
  const csvContent = `Customer,Inv.No,Date,Product,Qty,Unit Price,Comm/kg,Comm Amt
BIO AGRO ENERGY PVT LTD,800086408,28-Jan-26,SPIRIZYME ADV ULTI,360,550.00,16.50,5940.00
BIO AGRO ENERGY PVT LTD,800087967,6-Mar-26,SPIRIZYME ADV ULTI,3480,550.00,16.50,57420.00
BIO AGRO ENERGY PVT LTD,800089619,14-Apr-26,EFFYGREN,30,2800.00,84.00,2520.00
BIO AGRO ENERGY PVT LTD,800089619,14-Apr-26,RM-20,10,26000.00,780.00,7800.00
BIO AGRO ENERGY PVT LTD,800089619,14-Apr-26,SPIRIZYME ADV ULTI,1590,550.00,16.50,26235.00
BIO AGRO ENERGY PVT LTD,800089619,14-Apr-26,FORTIVA REVO X,375,1965.00,58.95,22106.25
BIO AGRO ENERGY PVT LTD,800089619,14-Apr-26,ALCOHOL ACTIVE DR,320,640.00,19.20,6144.00
RAVINDRA AND COMPANY LTD,800089707,17-Apr-26,EFFYMOLL+,75,2700.00,780.00,58500.00
SNJ SUGARS AND PRODUCTS LTD,800091196,4-Jun-26,EFFYGREN,350,3000.00,600.00,210000.00
THE ANDHRA SUGARS LTD,800091867,23-Jun-26,EFFYMOLL+,50,3300.00,779.00,38950.00
VISHWA SAMUDRA BIO ENERGY PVT LTD,800082526,30-Oct-25,FORTIVA REVO X,1002,1608.75,9.6525,9671.80
VISHWA SAMUDRA BIO ENERGY PVT LTD,800082526,30-Oct-25,SPIRIZYME ADV ULTI,8249,483.45,2.9007,23927.87`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'MCA_Commission_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
