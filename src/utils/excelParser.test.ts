import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { convertParsedRecordsToInvoiceItems, normalizeExcelDate, parseExcelFile } from './excelParser';

const csv = `Customer,Invoice Number,Date,Product,Quantity,Commission Rate,Commission Amount\nAlpha,001,2026-01-01,Same Product,2,5,10\nBeta,001,2026-01-02,Same Product,3,4,12\nAlpha,002,2026-01-03,Other Product,1,7,7`;

const summaryWorkbookCsv = `Customer,Person,Amount,Dealer Margin,Total
RAVINDRA AND COMPANY,,45000,13500,58500
BIO AGRO ENERGY LTD,,70000,14000,84000`;

describe('workbook parsing and invoice transfer', () => {
  it('parses valid workbook-shaped CSV data and groups source customers', () => {
    const result = parseExcelFile(csv);
    expect(result.records).toHaveLength(3);
    expect(result.customers).toEqual(['Alpha', 'Beta']);
    expect(result.records[0]).toMatchObject({ customer: 'Alpha', invNo: '001', qty: 2, commAmt: 10 });
  });

  it('preserves two customers, same products, and same invoice numbers as separate invoice rows', () => {
    const result = parseExcelFile(csv);
    const items = convertParsedRecordsToInvoiceItems(result.records, 'ALL');
    expect(items).toHaveLength(3);
    expect(new Set(items.map(item => item.customer))).toEqual(new Set(['Alpha', 'Beta']));
    expect(items[0].id).not.toBe(items[1].id);
    expect(items[0].description).toContain('Alpha');
    expect(items[1].description).toContain('Beta');
  });

  it('prevents duplicate source rows when the same parsed records are transferred twice', () => {
    const result = parseExcelFile(csv);
    const first = convertParsedRecordsToInvoiceItems(result.records);
    const second = convertParsedRecordsToInvoiceItems(result.records);
    const ids = new Set(first.map(item => item.id));
    const newItems = second.filter(item => !ids.has(item.id));
    expect(newItems).toHaveLength(0);
  });

  it('handles MCA summary-style workbooks that use dealer margin instead of product/quantity columns', () => {
    const result = parseExcelFile(summaryWorkbookCsv);
    expect(result.records).toHaveLength(2);
    expect(result.records[0]).toMatchObject({ customer: 'RAVINDRA AND COMPANY', qty: 1, commAmt: 13500 });
    const items = convertParsedRecordsToInvoiceItems(result.records, 'ALL');
    expect(items).toHaveLength(2);
    expect(items[0].commissionAmount).toBe(13500);
    expect(items[0].description).toContain('MCA Commission');
  });

  it('selects the populated column when a workbook repeats the Sales Price header', () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['SALES COMMISSION STATEMENT'],
      ['Customer', 'Inv.No', 'Date', 'Product', 'Qty', 'Comm/kg', 'Comm Amt', 'Sales Price', 'Sales Price'],
      ['Alpha', '1001', 46050, 'Product A', 2, 5, 10, '', 250],
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const result = parseExcelFile(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }));
    const items = convertParsedRecordsToInvoiceItems(result.records);

    expect(items[0]).toMatchObject({ unitPrice: 250, productAmount: 500 });
  });

  it('normalizes ISO workbook timestamps to the India invoice date', () => {
    expect(normalizeExcelDate('2026-01-27T18:29:50.000Z')).toBe('28-Jan-26');
  });

  it.each([
    ['Customer,Invoice,Date,Quantity,Commission Amount\nAlpha,1,2026-01-01,2,10', 'Missing product column'],
    ['Customer,Invoice,Date,Product,Commission Amount\nAlpha,1,2026-01-01,Product,10', 'Missing quantity column'],
    ['Customer,Invoice,Date,Product,Quantity\nAlpha,1,2026-01-01,Product,2', 'Missing commission amount column'],
  ])('reports %s', (input, message) => {
    expect(() => parseExcelFile(input)).toThrow(message);
  });

  it('reports empty worksheets', () => {
    expect(() => parseExcelFile('')).toThrow(/does not contain any readable sheets|empty/i);
  });
});
