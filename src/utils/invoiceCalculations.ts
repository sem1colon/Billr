import { InvoiceData, InvoiceItem } from '../types';

export interface InvoiceTotals {
  taxableValue: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  roundOff: number;
  grandTotal: number;
}

export function roundCurrency(value: number): number {
  const safeValue = Number.isFinite(value) ? value : 0;
  return Math.round((safeValue + Number.EPSILON) * 100) / 100;
}

export function calculateTaxableValue(items: InvoiceItem[]): number {
  return roundCurrency(items.reduce((sum, item) => {
    const amount = Number(item.commissionAmount);
    return sum + (Number.isFinite(amount) && amount > 0 ? amount : 0);
  }, 0));
}

export function calculateInvoiceTotals(invoiceData: Pick<InvoiceData, 'items' | 'gstRate' | 'gstType' | 'roundOff'>): InvoiceTotals {
  const taxableValue = calculateTaxableValue(invoiceData.items);
  const gstRate = Number(invoiceData.gstRate);
  const safeGstRate = Number.isFinite(gstRate) && gstRate > 0 ? gstRate : 0;
  const gstAmount = roundCurrency(taxableValue * (safeGstRate / 100));
  const isIgst = invoiceData.gstType === 'IGST';
  const igstAmount = isIgst ? gstAmount : 0;
  const cgstAmount = isIgst ? 0 : roundCurrency(gstAmount / 2);
  const sgstAmount = isIgst ? 0 : roundCurrency(gstAmount - cgstAmount);
  const requestedRoundOff = Number(invoiceData.roundOff);
  const roundOff = roundCurrency(Number.isFinite(requestedRoundOff) ? requestedRoundOff : 0);
  const grandTotal = roundCurrency(taxableValue + gstAmount + roundOff);

  return { taxableValue, gstAmount, cgstAmount, sgstAmount, igstAmount, roundOff, grandTotal };
}

export function gstLabel(gstType: InvoiceData['gstType'], gstRate: number): string {
  if (gstType === 'IGST') return `IGST ${gstRate}%`;
  const halfRate = roundCurrency((Number(gstRate) || 0) / 2);
  return `CGST ${halfRate}% + SGST ${halfRate}%`;
}
