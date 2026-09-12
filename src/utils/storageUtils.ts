import { InvoiceData, ActiveTab } from '../types';
import { initialInvoiceData, defaultSeller } from '../data/sampleData';
import { getDefaultSignatureDataUrl } from './signatureUtils';

const STORAGE_KEYS = {
  ACTIVE_TAB: 'billr_active_tab_v2',
  UI_PREFS: 'billr_ui_preferences_v1',
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
 * Creates a fresh invoice without restoring previously entered line items.
 */
export function loadSavedInvoiceData(): InvoiceData {
  if (typeof window === 'undefined') {
    return initialInvoiceData;
  }

  const defaultSig = getDefaultOrSavedSignature();

  // Remove invoice and sheet data saved by older versions of the app.
  try {
    localStorage.removeItem('billr_invoice_state_v2');
    localStorage.removeItem('billr_last_saved_time_v2');
    localStorage.removeItem('billr_parsed_records_v2');
    localStorage.removeItem('billr_sheet_customer_v2');
  } catch (err) {
    // Ignore storage access failures; the in-memory invoice is still empty.
  }

  return {
    ...initialInvoiceData,
    items: [],
    showSignature: true,
    seller: {
      ...defaultSeller,
      signatureUrl: defaultSig,
    },
  };
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
