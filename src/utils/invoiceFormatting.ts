import { InvoiceItem } from '../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function toIsoDateValue(value: string): string {
  const trimmed = value?.trim() || '';
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    const candidate = new Date(Date.UTC(year, month, day));
    return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month && candidate.getUTCDate() === day
      ? trimmed
      : '';
  }
  const match = trimmed.match(/^(\d{1,2})[-\s/]([A-Za-z]{3,})[-\s/](\d{2}|\d{4})$/);
  if (!match) return '';
  const month = MONTHS.findIndex(name => name.toLowerCase() === match[2].slice(0, 3).toLowerCase());
  if (month < 0) return '';
  const yearNumber = Number(match[3]);
  const year = match[3].length === 2 ? 2000 + yearNumber : yearNumber;
  const day = Number(match[1]);
  const candidate = new Date(Date.UTC(year, month, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month ||
    candidate.getUTCDate() !== day
  ) return '';
  return `${year.toString().padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatInvoiceDate(value: string): string {
  const isoValue = toIsoDateValue(value);
  if (!isoValue) return value || '';
  const parsed = new Date(`${isoValue}T00:00:00`);
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

export function getInvoicePlaceOfSupply(buyerName: string, placeOfSupply: string): string {
  const buyerIdentity = buyerName.trim().toUpperCase().replace(/\bLIMITED\b/g, 'LTD').replace(/\s+/g, ' ');
  const lines = placeOfSupply.split(/\r?\n/);
  const firstLine = lines.find(line => line.trim().length > 0)?.trim().toUpperCase().replace(/\bLIMITED\b/g, 'LTD').replace(/\s+/g, ' ');

  if (firstLine && firstLine === buyerIdentity) {
    return lines.slice(lines.findIndex(line => line.trim().length > 0) + 1).join('\n').trim();
  }

  return placeOfSupply.trim();
}

export function getInvoiceItemMeta(item: InvoiceItem): string {
  return [
    item.invNo ? `Inv. No. ${item.invNo}` : '',
    item.date ? `Date: ${formatInvoiceDate(item.date)}` : '',
  ].filter(Boolean).join(' | ');
}

export function formatInvoiceQuantity(item: InvoiceItem): string {
  return Number.isFinite(item.qty) && item.qty > 0
    ? `${item.qty.toLocaleString('en-IN')} ${item.unit || 'kg'}`
    : '-';
}

export function formatInvoiceRate(item: InvoiceItem): string {
  if (!Number.isFinite(item.commissionRate) || item.commissionRate <= 0) return '-';
  const rate = item.commissionRate.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return item.commissionType === 'PERCENTAGE' ? `${rate}%` : `₹${rate}`;
}

export function formatInvoiceAmount(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `₹${safeAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getInvoicePricingMeta(item: InvoiceItem): string {
  const unitPrice = Number.isFinite(item.unitPrice)
    ? `Unit price: ${formatInvoiceAmount(item.unitPrice as number)} / ${item.unit || 'unit'}`
    : '';
  const commissionRate = `Commission rate: ${formatInvoiceRate(item)}${item.commissionType === 'PERCENTAGE' ? '' : ` / ${item.unit || 'unit'}`}`;
  return [unitPrice, commissionRate].filter(Boolean).join(' | ');
}
