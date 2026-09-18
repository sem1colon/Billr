import { InvoiceData } from '../types';
import { toIsoDateValue } from './invoiceFormatting';

export interface InvoiceValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateInvoiceForExport(invoiceData: InvoiceData): InvoiceValidationResult {
  const errors: string[] = [];
  const invoiceNumber = typeof invoiceData.invoiceNumber === 'string' ? invoiceData.invoiceNumber.trim() : '';
  const invoiceDate = typeof invoiceData.invoiceDate === 'string' ? invoiceData.invoiceDate.trim() : '';
  const sellerGstin = typeof invoiceData.seller?.gstin === 'string' ? invoiceData.seller.gstin.trim().toUpperCase() : '';
  const buyerGstin = typeof invoiceData.buyer?.gstin === 'string' ? invoiceData.buyer.gstin.trim().toUpperCase() : '';

  if (!invoiceNumber) {
    errors.push('Add an invoice number.');
  }

  if (!invoiceDate) {
    errors.push('Add an invoice date.');
  } else if (!toIsoDateValue(invoiceDate)) {
    errors.push('Enter a valid invoice date.');
  }

  if (!Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
    errors.push('Add at least one line item.');
  } else {
    invoiceData.items.forEach((item, index) => {
      const rowNumber = index + 1;
      if (!Number.isFinite(item.qty) || item.qty <= 0) {
        errors.push(`Line item ${rowNumber} must have a quantity greater than zero.`);
      }
      if (!Number.isFinite(item.commissionAmount) || item.commissionAmount < 0) {
        errors.push(`Line item ${rowNumber} must have a valid commission amount.`);
      }
      if (!Number.isFinite(item.commissionRate) || item.commissionRate < 0) {
        errors.push(`Line item ${rowNumber} must have a valid commission rate.`);
      }
      if (item.date && !toIsoDateValue(item.date)) {
        errors.push(`Line item ${rowNumber} has an invalid date.`);
      }
    });
  }

  if (!sellerGstin) {
    errors.push('Add the seller GSTIN.');
  } else if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]$/.test(sellerGstin)) {
    errors.push('Enter a valid seller GSTIN.');
  }

  if (!buyerGstin) {
    errors.push('Add the buyer GSTIN.');
  } else if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]$/.test(buyerGstin)) {
    errors.push('Enter a valid buyer GSTIN.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
