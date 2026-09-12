import { InvoiceData, ActiveTab, ExcelParsedRecord } from '../types';
import { initialInvoiceData, defaultSeller } from '../data/sampleData';
import { getDefaultSignatureDataUrl } from './signatureUtils';

const STORAGE_KEYS = {
  INVOICE_DATA: 'billr_invoice_state_v2',
  ACTIVE_TAB: 'billr_active_tab_v2',
  UI_PREFS: 'billr_ui_preferences_v1',
  LAST_SAVED_TIMESTAMP: 'billr_last_saved_time_v2',
  PARSED_SHEET_RECORDS: 'billr_parsed_records_v2',
  SHEET_CUSTOMER: 'billr_sheet_customer_v2',
  SAVED_SIGNATURE: 'billr_saved_signature_v1',
};

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

    return {
      ...initialInvoiceData,
      ...parsed,
      seller: mergedSeller,
      items: parsed.items,
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
  return 'sheet';
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
