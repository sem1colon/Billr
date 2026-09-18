<div align="center">

  <img src="public/icon.svg" alt="Billr Logo" width="110" height="110" />

  # Billr
  ### Commission Data to Tax Invoice Generator

  <p align="center">
    <b>Import commission data, select the rows you need, edit the invoice, and export a GST-ready PDF in minutes.</b>
  </p>

  <p align="center">
    <a href="https://sem1colon.github.io/Billr/">
      <img src="https://img.shields.io/badge/🚀_Live_Demo-sem1colon.github.io%2FBillr-2563EB?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Demo" />
    </a>
    <a href="./LICENSE">
      <img src="https://img.shields.io/badge/License-Source--Available-0F172A?style=for-the-badge" alt="License" />
    </a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/xlsx-Excel_%7C_CSV_%7C_TSV_%7C_TXT-3776AB?style=flat-square&logo=microsoftexcel&logoColor=white" alt="xlsx, CSV, TSV, and TXT" />
    <img src="https://img.shields.io/badge/jsPDF-PDF_Export-DC2626?style=flat-square&logo=adobe-acrobat-reader&logoColor=white" alt="jsPDF" />
    <img src="https://img.shields.io/badge/PWA-iPhone_%26_Web-0284C7?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
  </p>

</div>

---

## Overview

Billr is a mobile-first invoice workflow for business users who receive commission or sales data in spreadsheet or text files and need to turn it into a clean tax invoice quickly. Drafts, workbook selections, profiles, signatures, and invoice history are stored locally in the browser.

The app is designed for a practical flow:

1. Import an `.xlsx`, `.xls`, `.csv`, `.tsv`, or `.txt` statement
2. Select a worksheet, customer, and rows to include
3. Edit invoice details, line items, profiles, and signature if needed
4. Preview the invoice and export a PDF

This makes it especially useful for distributors, commission agents, agencies, and small businesses that work with spreadsheets instead of full accounting systems.

---

## Main workflow

```mermaid
flowchart LR
    A[Import Workbook or Text File] --> B[Review and Filter Records]
    B --> C[Filter by Customer / Invoice]
    C --> D[Edit Invoice Details]
    D --> E[Preview & Export PDF]
```

---

## Features

### Smart data import
- Upload `.xlsx`, `.xls`, `.csv`, `.tsv`, and `.txt` files directly in the browser
- Parse raw commission or sales rows into structured invoice data
- Switch between workbook sheets and filter records by customer or search text
- Add, edit, delete, and select individual source rows before applying them
- Review imported data before generating a final invoice

### Home dashboard and local drafts
- Resume the current draft from the Home dashboard
- Start a blank invoice or open a reference sample
- See recently exported invoices and the last local save
- Export a JSON backup or clear Billr data stored on the device

### Editable invoice builder
- Update buyer and seller details
- Adjust invoice number, date, terms, and line items
- Add or remove entries before final export
- Draw or apply a saved signature and choose whether it appears on the invoice
- Keep the process flexible for real-world corrections

### Agency and client profiles
- Maintain seller agency, partner, contact, tax, banking, and address details
- Edit buyer/client details and reset the profile to the bundled defaults
- Reuse the saved profile across invoices on the same device

### GST-ready calculations
- Calculate totals, taxes, and payable value from invoice data
- Support commission-based sales workflows and invoice styling for business use
- Keep the logic readable and user-controlled for quick edits

### PDF export and preview
- Generate a clean, print-ready invoice preview in the app
- Export a PDF for sharing, printing, or record keeping
- Share the generated PDF through the native device share sheet when supported
- Display formatted invoice dates, customer groups, pricing metadata, seller details, bank details, and signatory information
- Validate required invoice data before export and show live totals, GST, and round-off
- Show a recoverable error message when printing or sharing fails; PDF download remains available
- Built for a quick business workflow without requiring a backend service

### Mobile-first, installable app
- Designed for iPhone, tablet, desktop, and responsive web/mobile browsing
- Works well as an installable PWA on supported devices
- Works without a backend server; imported files and saved drafts remain in the browser

---

## Tech stack

- React 19
- TypeScript
- Vite
- xlsx for Excel, CSV, TSV, and TXT parsing
- jsPDF + jspdf-autotable for PDF generation
- Lucide icons and motion-based UI interactions
- Progressive Web App setup for installable mobile use

---

## Getting started

### Prerequisites
- Node.js 18 or newer
- npm

### Install

```bash
git clone https://github.com/sem1colon/Billr.git
cd Billr
npm install
```

### Run locally

```bash
npm run dev
```

Open http://localhost:3000 in the browser.

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

## Available scripts

- `npm run dev` — start the app locally
- `npm run build` — build the production bundle
- `npm run preview` — preview the built app locally
- `npm run lint` — run TypeScript validation
- `npm run deploy` — deploy the built site to GitHub Pages

---

## Project structure

```text
Billr/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/assets
├── src/
│   ├── components/
│   ├── data/
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── index.html
├── package.json
├── README.md
├── metadata.json
├── tsconfig.json
├── vite.config.ts
├── LICENSE
└── walkthrough.md
```

---

## License

This project is distributed under the repository license included in the project. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built for faster invoice work on mobile, desktop, and GitHub Pages.</sub>
</div>
