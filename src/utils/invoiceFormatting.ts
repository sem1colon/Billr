import { InvoiceItem } from '../types';

export function formatInvoiceDate(value: string): string {
  if (!value) return '';
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export function getInvoiceProductName(item: InvoiceItem): string {
  return item.description || 'Commission service';
}

export function getInvoiceItemMeta(item: InvoiceItem): string {
  return [
    item.invNo ? `Inv. No. ${item.invNo}` : '',
    item.date ? `Date: ${formatInvoiceDate(item.date)}` : '',
  ].filter(Boolean).join(' | ');
}

export function formatInvoiceQuantity(item: InvoiceItem): string {
  return item.qty ? `${item.qty.toLocaleString('en-IN')} ${item.unit || 'kg'}` : '-';
}

export function formatInvoiceRate(item: InvoiceItem): string {
  if (!item.commissionRate) return '-';
  const rate = item.commissionRate.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return item.commissionType === 'PERCENTAGE' ? `${rate}%` : `₹${rate}`;
}

export function formatInvoiceAmount(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}