import { InvoiceData, ActiveTab, ExcelParsedRecord } from '../types';
import { initialInvoiceData, defaultSeller } from '../data/sampleData';
import { getDefaultSignatureDataUrl } from './signatureUtils';
import { toIsoDateValue } from './invoiceFormatting';

const STORAGE_KEYS = {
  INVOICE_DATA: 'billr_invoice_state_v2',
  ACTIVE_TAB: 'billr_active_tab_v2',
  UI_PREFS: 'billr_ui_preferences_v1',
  LAST_SAVED_TIMESTAMP: 'billr_last_saved_time_v2',
  PARSED_SHEET_RECORDS: 'billr_parsed_records_v2',
  SHEET_CUSTOMER: 'billr_sheet_customer_v2',
  SAVED_SIGNATURE: 'billr_saved_signature_v1',
  WORKBOOK_STATE: 'billr_workbook_state_v1',
  INVOICE_HISTORY: 'billr_invoice_history_v1',
};

export interface InvoiceHistoryEntry {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  total: number;
  itemCount: number;
  savedAt: string;
}

export interface SavedWorkbookState {
  version: 1;
  records: ExcelParsedRecord[];
  fileName: string;
  activeSheetName: string;
  availableSheets: string[];
  selectedCustomer: string;
  searchQuery: string;
}

/**
 * Loads the user's custom saved signature or null if not set.
 */
export function loadSavedSignature(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.SAVED_SIGNATURE);
  } catch (err) {
    return null;
  }
}

/**
 * Saves the user's signature to localStorage so it remains the default for future invoices.
 */
export function saveSavedSignature(signatureUrl: string): void {
  if (typeof window === 'undefined' || !signatureUrl) return;
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_SIGNATURE, signatureUrl);
  } catch (err) {
    console.error('Failed to save signature to localStorage:', err);
  }
}

/**
 * Clears the saved signature from localStorage (reverting to official factory signature).
 */
export function clearSavedSignature(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.SAVED_SIGNATURE);
  } catch (err) {
    console.warn('Failed to clear saved signature from localStorage:', err);
  }
}

/**
 * Gets the effective default signature: either the last user-saved signature
 * or the default stylized agency signature if no user edit has occurred.
 */
export function getDefaultOrSavedSignature(): string {
  const saved = loadSavedSignature();
  if (saved && saved.trim().length > 0) {
    return saved;
  }
  return getDefaultSignatureDataUrl();
}

/**
 * Safely loads invoice data from localStorage.
 * Falls back to initialInvoiceData with default/saved signature if not found or corrupted.
 */
export function loadSavedInvoiceData(): InvoiceData {
  if (typeof window === 'undefined') {
    return initialInvoiceData;
  }

  const defaultSig = getDefaultOrSavedSignature();

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICE_DATA);
    if (!raw) {
      // First time load: ensure default/saved signature is attached
      return {
        ...initialInvoiceData,
        showSignature: true,
        seller: {
          ...initialInvoiceData.seller,
          signatureUrl: defaultSig,
        },
      };
    }

    const parsed: Partial<InvoiceData> = JSON.parse(raw);

    // Validate essential properties
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
      throw new Error('Invalid invoice data structure in localStorage');
    }

    // Merge with defaults to ensure all required fields exist
    const mergedSeller = {
      ...defaultSeller,
      ...(parsed.seller || {}),
      signatureUrl: parsed.seller?.signatureUrl || defaultSig,
    };

    // If a signature is present in the loaded invoice, remember it as the default signature
    if (mergedSeller.signatureUrl) {
      saveSavedSignature(mergedSeller.signatureUrl);
    }

    const normalizedBuyer = {
      ...initialInvoiceData.buyer,
      ...(parsed.buyer || {}),
      name: typeof parsed.buyer?.name === 'string' && parsed.buyer.name.trim()
        ? parsed.buyer.name
        : initialInvoiceData.buyer.name,
    };

    return {
      ...initialInvoiceData,
      ...parsed,
      seller: { ...mergedSeller, name: defaultSeller.name },
      buyer: normalizedBuyer,
      invoiceDate: typeof parsed.invoiceDate === 'string'
        ? (toIsoDateValue(parsed.invoiceDate) || initialInvoiceData.invoiceDate)
        : initialInvoiceData.invoiceDate,
      items: parsed.items.map(item => ({
        ...item,
        date: typeof item.date === 'string' && item.date
          ? (toIsoDateValue(item.date) || item.date)
          : item.date,
      })),
      showSignature: parsed.showSignature !== undefined ? parsed.showSignature : true,
    };
  } catch (err) {
    console.warn('Failed to load invoice state from localStorage:', err);
    return {
      ...initialInvoiceData,
      seller: {
        ...initialInvoiceData.seller,
        signatureUrl: defaultSig,
      },
    };
  }
}

export function saveWorkbookState(state: Omit<SavedWorkbookState, 'version'>): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEYS.WORKBOOK_STATE, JSON.stringify({ version: 1, ...state }));
    return true;
  } catch (err) {
    console.error('Failed to save workbook state to localStorage:', err);
    return false;
  }
}

export function loadWorkbookState(): SavedWorkbookState | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKBOOK_STATE) || 'null') as Partial<SavedWorkbookState> | null;
    if (parsed?.version !== 1 || !Array.isArray(parsed.records)) return null;
    return {
      version: 1,
      records: parsed.records,
      fileName: typeof parsed.fileName === 'string' ? parsed.fileName : '',
      activeSheetName: typeof parsed.activeSheetName === 'string' ? parsed.activeSheetName : '',
      availableSheets: Array.isArray(parsed.availableSheets) ? parsed.availableSheets.filter((value): value is string => typeof value === 'string') : [],
      selectedCustomer: typeof parsed.selectedCustomer === 'string' ? parsed.selectedCustomer : 'ALL',
      searchQuery: typeof parsed.searchQuery === 'string' ? parsed.searchQuery : '',
    };
  } catch (err) {
    console.warn('Failed to load workbook state from localStorage:', err);
    return null;
  }
}

export function clearSavedWorkbookState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.WORKBOOK_STATE);
  } catch (err) {
    console.warn('Failed to clear workbook state from localStorage:', err);
  }
}

/**
 * Saves current invoice state to localStorage.
 */
export function saveInvoiceData(data: InvoiceData): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (data.seller?.signatureUrl) {
      saveSavedSignature(data.seller.signatureUrl);
    }
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEYS.INVOICE_DATA, serialized);
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED_TIMESTAMP, new Date().toISOString());
    return true;
  } catch (err) {
    console.error('Failed to save invoice state to localStorage:', err);
    return false;
  }
}

export function hasSavedInvoiceData(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(localStorage.getItem(STORAGE_KEYS.INVOICE_DATA));
  } catch (err) {
    return false;
  }
}

/**
 * Clears saved invoice data and resets to factory sample data.
 */
export function clearSavedInvoiceData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.INVOICE_DATA);
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED_TIMESTAMP);
  } catch (err) {
    console.warn('Failed to clear invoice state from localStorage:', err);
  }
}

/**
 * Loads the active navigation tab. Always starts at 'sheet' (Step 1: Upload Sheet) on launch.
 */
export function loadSavedActiveTab(): ActiveTab {
  return 'home';
}

/**
 * Saves the active navigation tab.
 */
export function saveActiveTab(tab: ActiveTab): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tab);
  } catch (e) {
    // ignore
  }
}

/**
 * Saves cached parsed records from Excel/CSV
 */
export function saveSavedSheetRecords(records: ExcelParsedRecord[], customer: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PARSED_SHEET_RECORDS, JSON.stringify(records));
    localStorage.setItem(STORAGE_KEYS.SHEET_CUSTOMER, customer);
  } catch (e) {
    // ignore
  }
}

/**
 * Loads cached parsed records from Excel/CSV
 */
export function loadSavedSheetRecords(): { records: ExcelParsedRecord[]; customer: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARSED_SHEET_RECORDS);
    const customer = localStorage.getItem(STORAGE_KEYS.SHEET_CUSTOMER) || 'ALL';
    if (raw) {
      const records = JSON.parse(raw);
      if (Array.isArray(records) && records.length > 0) {
        return { records, customer };
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export interface UiPreferences {
  isLargeText: boolean;
}

/**
 * Loads UI preferences like large text mode.
 */
export function loadSavedUiPreferences(): UiPreferences {
  if (typeof window === 'undefined') return { isLargeText: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UI_PREFS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        isLargeText: Boolean(parsed.isLargeText),
      };
    }
  } catch (e) {
    // fallback
  }
  return { isLargeText: false };
}

/**
 * Saves UI preferences.
 */
export function saveUiPreferences(prefs: UiPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.UI_PREFS, JSON.stringify(prefs));
  } catch (e) {
    // ignore
  }
}

/**
 * Returns the timestamp when the invoice was last autosaved.
 */
export function getLastSavedTimestamp(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SAVED_TIMESTAMP);
  } catch (e) {
    return null;
  }
}

export function loadInvoiceHistory(): InvoiceHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICE_HISTORY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is InvoiceHistoryEntry => (
      entry && typeof entry.id === 'string' && typeof entry.invoiceNumber === 'string' &&
      typeof entry.invoiceDate === 'string' && typeof entry.total === 'number' &&
      typeof entry.itemCount === 'number' && typeof entry.savedAt === 'string'
    )).slice(0, 12);
  } catch (err) {
    return [];
  }
}

export function saveInvoiceHistoryEntry(entry: InvoiceHistoryEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const next = [entry, ...loadInvoiceHistory().filter(existing => existing.id !== entry.id)].slice(0, 12);
    localStorage.setItem(STORAGE_KEYS.INVOICE_HISTORY, JSON.stringify(next));
  } catch (err) {
    console.warn('Failed to save invoice history:', err);
  }
}

export function createLocalBackup(): string {
  if (typeof window === 'undefined') return '{}';
  const snapshot: Record<string, string> = {};
  Object.keys(localStorage).filter(key => key.startsWith('billr_')).forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) snapshot[key] = value;
  });
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data: snapshot }, null, 2);
}

export function clearAllBillrData(): void {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage).filter(key => key.startsWith('billr_')).forEach(key => localStorage.removeItem(key));
}
