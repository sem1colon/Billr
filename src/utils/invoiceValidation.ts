import { InvoiceData } from '../types';

export interface InvoiceValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateInvoiceForExport(invoiceData: InvoiceData): InvoiceValidationResult {
  const errors: string[] = [];

  if (!invoiceData.invoiceNumber.trim()) {
    errors.push('Add an invoice number.');
  }

  if (!invoiceData.invoiceDate.trim()) {
    errors.push('Add an invoice date.');
  }

  if (invoiceData.items.length === 0) {
    errors.push('Add at least one line item.');
  }

  if (!invoiceData.seller.gstin.trim()) {
    errors.push('Add the seller GSTIN.');
  }

  if (!invoiceData.buyer.gstin.trim()) {
    errors.push('Add the buyer GSTIN.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
