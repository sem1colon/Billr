import { describe, expect, it } from 'vitest';
import { calculateInvoiceTotals } from './invoiceCalculations';
import { getInvoicePdfExportData, getInvoicePdfFileName } from './pdfGenerator';
import { InvoiceData } from '../types';

const invoice = (overrides: Partial<InvoiceData> = {}): InvoiceData => ({
  id: 'test',
  invoiceNumber: 'MCA/2026-27/001',
  invoiceDate: '2026-09-12',
  seller: {} as InvoiceData['seller'],
  buyer: {} as InvoiceData['buyer'],
  items: [{
    id: 'item-1', description: 'Service', hsnSacCode: '998311', qty: 1, unit: 'Lot',
    commissionRate: 100, commissionAmount: 100,
  }],
  gstRate: 18,
  gstType: 'CGST_SGST',
  roundOff: 0,
  ...overrides,
});

describe('calculateInvoiceTotals', () => {
  it('calculates CGST and SGST exactly from the rounded GST total', () => {
    const totals = calculateInvoiceTotals(invoice({ items: [{
      id: 'item-1', description: 'Service', hsnSacCode: '998311', qty: 1, unit: 'Lot',
      commissionRate: 1, commissionAmount: 100.01,
    }] }));
    expect(totals.taxableValue).toBe(100.01);
    expect(totals.gstAmount).toBe(18);
    expect(totals.cgstAmount + totals.sgstAmount).toBe(totals.gstAmount);
    expect(totals.grandTotal).toBe(118.01);
  });

  it('supports zero GST, IGST, fractional rates, overrides, invalid and negative amounts', () => {
    expect(calculateInvoiceTotals(invoice({ gstRate: 0 })).gstAmount).toBe(0);
    const igst = calculateInvoiceTotals(invoice({ gstType: 'IGST', gstRate: 5.5, roundOff: 0.01 }));
    expect(igst.igstAmount).toBe(5.5);
    expect(igst.cgstAmount).toBe(0);
    expect(igst.sgstAmount).toBe(0);
    expect(igst.grandTotal).toBe(105.51);
    expect(calculateInvoiceTotals(invoice({ items: [{
      id: 'item-1', description: 'Service', hsnSacCode: '998311', qty: -1, unit: 'Lot',
      commissionRate: -10, commissionAmount: -500,
    }, {
      id: 'item-2', description: 'Override', hsnSacCode: '998311', qty: 2, unit: 'Lot',
      commissionRate: 1.3333, commissionAmount: 10.005,
    }] })).taxableValue).toBe(10.01);
  });
});

describe('getInvoicePdfFileName', () => {
  it.each([
    ['004/26-27', 'Invoice_MCA_2026-27_004.pdf'],
    ['MCA/2026-27/001', 'Invoice_MCA_2026-27_001.pdf'],
    ['MCA 2026/27/001', 'Invoice_MCA_2026-27_001.pdf'],
    ['', 'Invoice_MCA_2026-27_001.pdf'],
    ['发票/2026-27/abc?.pdf', 'Invoice_MCA_2026-27_001.pdf'],
  ])('normalizes %s', (input, expected) => {
    expect(getInvoicePdfFileName(input)).toBe(expected);
  });
});

describe('getInvoicePdfExportData', () => {
  it('maps the current invoice rows and totals into the PDF export snapshot', () => {
    const data = getInvoicePdfExportData(invoice({
      invoiceNumber: 'MCA/2026-27/017',
      invoiceDate: '2026-08-10',
      items: [
        { id: '1', description: 'A', hsnSacCode: '998311', qty: 5, unit: 'kg', commissionRate: 10, commissionAmount: 100 },
        { id: '2', description: 'B', hsnSacCode: '998311', qty: 7, unit: 'kg', commissionRate: 10, commissionAmount: 145 },
        { id: '3', description: 'C', hsnSacCode: '998311', qty: 5, unit: 'kg', commissionRate: 10, commissionAmount: 100 },
      ],
    }));

    expect(data.invoiceNumber).toBe('MCA/2026-27/017');
    expect(data.invoiceDate).toBe('2026-08-10');
    expect(data.items).toHaveLength(3);
    expect(data.totalQuantity).toBe(17);
    expect(data.taxableValue).toBe(345);
    expect(data.gstAmount).toBe(62.1);
    expect(data.grandTotal).toBe(407.1);
  });
});