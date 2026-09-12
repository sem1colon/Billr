import { InvoiceData, ActiveTab, ExcelParsedRecord } from '../types';
import { initialInvoiceData, defaultSeller } from '../data/sampleData';
import { getDefaultSignatureDataUrl } from './signatureUtils';

const STORAGE_KEYS = {
  INVOICE_DATA: 'billr_invoice_state_v1',
  ACTIVE_TAB: 'billr_active_tab_v1',
  UI_PREFS: 'billr_ui_preferences_v1',
  LAST_SAVED_TIMESTAMP: 'billr_last_saved_time_v1',
  PARSED_SHEET_RECORDS: 'billr_parsed_records_v1',
  SHEET_CUSTOMER: 'billr_sheet_customer_v1',
};

/**
 * Safely loads invoice data from localStorage.
 * Falls back to initialInvoiceData with default signature if not found or corrupted.
 */
export function loadSavedInvoiceData(): InvoiceData {
  if (typeof window === 'undefined') {
    return initialInvoiceData;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICE_DATA);
    if (!raw) {
      // First time load: ensure default signature is attached
      const defaultSig = getDefaultSignatureDataUrl();
      return {
        ...initialInvoiceData,
        showSignature: true,
        seller: {
          ...initialInvoiceData.seller,
          signatureUrl: initialInvoiceData.seller.signatureUrl || defaultSig,
        },
      };
    }

    const parsed: Partial<InvoiceData> = JSON.parse(raw);

    // Validate essential properties
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
      throw new Error('Invalid invoice data structure in localStorage');
    }

    // Merge with defaults to ensure all required fields exist
    const defaultSig = getDefaultSignatureDataUrl();
    const mergedSeller = {
      ...defaultSeller,
      ...(parsed.seller || {}),
      signatureUrl: parsed.seller?.signatureUrl || defaultSig,
    };

    return {
      ...initialInvoiceData,
      ...parsed,
      seller: mergedSeller,
      items: parsed.items,
      showSignature: parsed.showSignature !== undefined ? parsed.showSignature : true,
    };
  } catch (err) {
    console.warn('Failed to load invoice state from localStorage:', err);
    return initialInvoiceData;
  }
}

/**
 * Saves current invoice state to localStorage.
 */
export function saveInvoiceData(data: InvoiceData): boolean {
  if (typeof window === 'undefined') return false;

  try {
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
 * Loads the last active navigation tab. Defaults to 'sheet' for the upload-first workflow.
 */
export function loadSavedActiveTab(): ActiveTab {
  if (typeof window === 'undefined') return 'sheet';
  try {
    const tab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) as ActiveTab;
    if (tab === 'sheet' || tab === 'builder' || tab === 'preview' || tab === 'settings') {
      return tab;
    }
  } catch (e) {
    // fallback
  }
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
