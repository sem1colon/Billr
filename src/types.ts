export interface BusinessProfile {
  name: string;
  address: string;
  cityStateZip: string;
  partnerName: string;
  phone: string;
  email?: string;
  gstin: string;
  pan: string;
  bankName: string;
  bankBranch: string;
  accountNo: string;
  ifscCode: string;
  notes: string;
  signatureUrl?: string;
}

export interface ClientProfile {
  name: string;
  address: string;
  cityStateZip: string;
  gstin: string;
  pan?: string;
  placeOfSupply: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsnSacCode: string;
  qty: number;
  unit: string;
  unitPrice?: number; // Basic product sales price / rate per unit (e.g. ₹550.00 / kg)
  productAmount?: number; // Qty * UnitPrice (gross product total)
  commissionType?: 'PER_UNIT' | 'PERCENTAGE';
  commissionRate: number; // Commission rate per unit (e.g. ₹16.50/kg) or commission %
  commissionAmount: number; // Taxable commission value (Qty * Rate or custom override)
  invNo?: string;
  date?: string;
  customer?: string;
}

export type GstType = 'IGST' | 'CGST_SGST';

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  seller: BusinessProfile;
  buyer: ClientProfile;
  items: InvoiceItem[];
  gstRate: number; // Standard 18%
  gstType: GstType;
  roundOff: number;
  showSignature?: boolean;
}

export interface ExcelParsedRecord {
  customer: string;
  invNo: string;
  date: string;
  product: string;
  qty: number;
  unitPrice?: number; // Product sales/unit rate
  commPerKg: number; // Commission rate per kg/unit
  commAmt: number; // Commission total amount
}
