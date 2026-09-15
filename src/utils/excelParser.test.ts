import { describe, expect, it } from 'vitest';
import { convertParsedRecordsToInvoiceItems, parseExcelFile } from './excelParser';

const csv = `Customer,Invoice Number,Date,Product,Quantity,Commission Rate,Commission Amount\nAlpha,001,2026-01-01,Same Product,2,5,10\nBeta,001,2026-01-02,Same Product,3,4,12\nAlpha,002,2026-01-03,Other Product,1,7,7`;

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
