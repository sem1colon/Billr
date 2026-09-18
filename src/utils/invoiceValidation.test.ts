import { describe, expect, it } from 'vitest';
import { validateInvoiceForExport } from './invoiceValidation';
import { InvoiceData } from '../types';

const validInvoice = (overrides: Partial<InvoiceData> = {}): InvoiceData => ({
  id: 'invoice-1',
  invoiceNumber: 'MCA/2026-27/001',
  invoiceDate: '2026-09-19',
  seller: { gstin: '36ABXFM3174B1Z1' } as InvoiceData['seller'],
  buyer: { gstin: '27AAACP6090Q1ZS' } as InvoiceData['buyer'],
  items: [{
    id: 'item-1', description: 'Service', hsnSacCode: '998311', qty: 1, unit: 'kg',
    commissionRate: 10, commissionAmount: 10,
  }],
  gstRate: 18,
  gstType: 'CGST_SGST',
  roundOff: 0,
  ...overrides,
});

describe('validateInvoiceForExport', () => {
  it('accepts a complete valid invoice', () => {
    expect(validateInvoiceForExport(validInvoice()).isValid).toBe(true);
  });

  it('rejects invalid dates, GSTINs, and line item values', () => {
    const result = validateInvoiceForExport(validInvoice({
      invoiceDate: '31-Feb-26',
      seller: { gstin: 'invalid' } as InvoiceData['seller'],
      buyer: { gstin: 'invalid' } as InvoiceData['buyer'],
      items: [{
        id: 'item-1', description: 'Service', hsnSacCode: '998311', qty: 0, unit: 'kg',
        commissionRate: -1, commissionAmount: -10, date: '31-Feb-26',
      }],
    }));

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'Enter a valid invoice date.',
      'Enter a valid seller GSTIN.',
      'Enter a valid buyer GSTIN.',
      'Line item 1 must have a quantity greater than zero.',
      'Line item 1 must have a valid commission amount.',
      'Line item 1 must have a valid commission rate.',
      'Line item 1 has an invalid date.',
    ]));
  });
});