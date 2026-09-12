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
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateTaxableValue(items: InvoiceItem[]): number {
  return roundCurrency(items.reduce((sum, item) => sum + (Number(item.commissionAmount) || 0), 0));
}

export function calculateInvoiceTotals(invoiceData: Pick<InvoiceData, 'items' | 'gstRate' | 'gstType' | 'roundOff'>): InvoiceTotals {
  const taxableValue = calculateTaxableValue(invoiceData.items);
  const gstAmount = roundCurrency(taxableValue * ((Number(invoiceData.gstRate) || 0) / 100));
  const isIgst = invoiceData.gstType === 'IGST';
  const igstAmount = isIgst ? gstAmount : 0;
  const cgstAmount = isIgst ? 0 : roundCurrency(gstAmount / 2);
  const sgstAmount = isIgst ? 0 : roundCurrency(gstAmount - cgstAmount);
  const roundOff = roundCurrency(Number.isFinite(Number(invoiceData.roundOff)) ? Number(invoiceData.roundOff) : 0);
  const grandTotal = roundCurrency(taxableValue + gstAmount + roundOff);

  return { taxableValue, gstAmount, cgstAmount, sgstAmount, igstAmount, roundOff, grandTotal };
}

export function gstLabel(gstType: InvoiceData['gstType'], gstRate: number): string {
  if (gstType === 'IGST') return `IGST ${gstRate}%`;
  const halfRate = roundCurrency((Number(gstRate) || 0) / 2);
  return `CGST ${halfRate}% + SGST ${halfRate}%`;
}
