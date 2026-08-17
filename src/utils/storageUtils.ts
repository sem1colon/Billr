import { InvoiceData } from '../types';
import { initialInvoiceData, defaultSeller } from '../data/sampleData';
import { getDefaultSignatureDataUrl } from './signatureUtils';
import { ActiveTab } from '../components/HeaderNav';

const STORAGE_KEYS = {
  INVOICE_DATA: 'billr_invoice_state_v1',
  ACTIVE_TAB: 'billr_active_tab_v1',
  UI_PREFS: 'billr_ui_preferences_v1',
  LAST_SAVED_TIMESTAMP: 'billr_last_saved_time_v1',
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
 * Loads the last active navigation tab.
 */
export function loadSavedActiveTab(): ActiveTab {
  if (typeof window === 'undefined') return 'builder';
  try {
    const tab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) as ActiveTab;
    if (tab === 'builder' || tab === 'preview' || tab === 'settings') {
      return tab;
    }
  } catch (e) {
    // fallback
  }
  return 'builder';
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
 * Loads UI preferences like large text mode.
 */
export function loadSavedUiPreferences(): { isLargeText: boolean } {
  if (typeof window === 'undefined') return { isLargeText: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UI_PREFS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }
  return { isLargeText: false };
}

/**
 * Saves UI preferences.
 */
export function saveUiPreferences(prefs: { isLargeText: boolean }): void {
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
