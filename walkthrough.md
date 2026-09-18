# Walkthrough: Billr Invoice Workflow

Billr is a responsive, installable invoice workspace for turning commission or sales data into GST-ready PDF invoices. It works locally in the browser and is optimized for touch devices without limiting desktop use.

---

## Key workflows

### 1. Home dashboard
- Resume the locally saved draft or start a new invoice
- Import source data or open the reference sample
- Review recent PDF exports
- Download a JSON backup or clear locally stored Billr data

### 2. Import and review source data
- Accept `.xlsx`, `.xls`, `.csv`, `.tsv`, and `.txt` files
- Select a worksheet when a workbook contains multiple sheets
- Filter by customer or search product, invoice number, or date
- Select, add, edit, or delete rows before applying them to the invoice

### 3. Build and review the invoice
- Edit invoice identifiers, dates, buyer details, items, GST type, and rate
- Maintain seller and client profiles from the Agency Profile view
- Draw or apply a signature and toggle it on the final invoice
- Review calculated tax, round-off, total, amount in words, and validation messages
- Download or share a print-ready PDF

## Design decisions

### 4. Senior legibility and high contrast
- **Solution**: Uses restrained frosted surfaces, clear structural borders, and high-contrast typography (`#0F172A` text on a light `#F8FAFC` background).
- **Font & Input Sizing**: Enforced 16px+ text inputs to prevent iOS Safari auto-zoom while maintaining effortless legibility.

---

### 5. Retina touch signature canvas
- **High-DPI Canvas Scaling**: Configured canvas pixel density (`window.devicePixelRatio`) to render crystal-clear, smooth signatures on Retina displays.
- **Touch Scroll Isolation**: Added `touch-action: none;` and touch coordinate translation so signing with a finger never triggers page scrolling, panning, or rubber-banding.
- **Accessible Controls**: Big touch buttons for "Official Sign", "Draw Finger", "Clear", and "Save & Apply".

---

### 6. 1-tap PDF sharing
- Integrated `navigator.share` with PDF file blob attachments (`shareInvoicePDF`).
- On iPhone, tapping **"Share PDF"** brings up the native iOS Share Sheet to send the invoice directly via WhatsApp, Mail, or AirDrop.
- If sharing fails or is unavailable, Billr keeps the PDF download action available and reports the failure in the preview.

---

### 7. Invoice presentation and export reliability
- Invoice dates are formatted consistently in the preview, copied summary, and PDF.
- Line items show customer grouping plus product, source, and pricing metadata.
- The invoice clearly separates seller, recipient, bank, and authorized signatory information.
- Required fields are validated before print/PDF export, and export failures are reported without crashing the workflow.

### 8. Local-first persistence
- Invoice drafts, active navigation, UI preferences, workbook state, signatures, and export history use browser storage.
- The Home dashboard makes saved state visible and provides explicit backup and clear-data controls.

### 9. Large touch targets and responsive layouts
- Replaced dense desktop tables on mobile screens with chunky 48px+ touch cards.
- Dedicated, spaced-out **Edit**, **Copy**, and **Delete** buttons to eliminate mis-taps.
- Quick 1-tap product presets with pre-calculated commission rates.

---

## Build and code health
- **Lint & Types**: Passed `tsc --noEmit` with 0 errors.
- **Production Build**: Verified via `npm run build` with Vite.
- **Git Policy**: All changes preserved in the working tree without committing.
