import { describe, expect, it } from 'vitest';
import { formatInvoiceAmount, formatInvoiceDate, formatInvoiceQuantity, getInvoicePricingMeta, toIsoDateValue } from './invoiceFormatting';

describe('invoice date values', () => {
  it('normalizes legacy dates for native date controls', () => {
    expect(toIsoDateValue('10-Aug-26')).toBe('2026-08-10');
    expect(toIsoDateValue('2026-08-10')).toBe('2026-08-10');
    expect(toIsoDateValue('31-Feb-26')).toBe('');
    expect(toIsoDateValue('2026-02-31')).toBe('');
  });

  it('keeps display formatting separate from the ISO control value', () => {
    expect(formatInvoiceDate('2026-08-10')).toBe('10 Aug 2026');
  });

  it('keeps invoice pricing metadata consistent and safe', () => {
    expect(getInvoicePricingMeta({
      id: 'item-1',
      description: 'Resin',
      hsnSacCode: '998311',
      qty: 2,
      unit: 'kg',
      unitPrice: 550,
      commissionType: 'PER_UNIT',
      commissionRate: 16.5,
      commissionAmount: 33,
    })).toBe('Unit price: ₹550.00 / kg | Commission rate: ₹16.50 / kg');
    expect(formatInvoiceAmount(Number.NaN)).toBe('₹0.00');
    expect(formatInvoiceQuantity({ id: 'item-2', description: '', hsnSacCode: '', qty: Number.NaN, unit: 'kg', commissionRate: 0, commissionAmount: Number.NaN })).toBe('-');
  });
});