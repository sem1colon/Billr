<div align="center">

  <img src="public/icon.svg" alt="Billr Logo" width="110" height="110" />

  # Billr
  ### Excel to Tax Invoice Generator

  <p align="center">
    <b>Upload a commission sheet, select the rows you need, edit the invoice, and export a GST-ready PDF in minutes.</b>
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
    <img src="https://img.shields.io/badge/xlsx-Excel_%26_CSV-3776AB?style=flat-square&logo=microsoftexcel&logoColor=white" alt="xlsx" />
    <img src="https://img.shields.io/badge/jsPDF-PDF_Export-DC2626?style=flat-square&logo=adobe-acrobat-reader&logoColor=white" alt="jsPDF" />
    <img src="https://img.shields.io/badge/PWA-iPhone_%26_Web-0284C7?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
  </p>

</div>

---

## Overview

Billr is a mobile-first invoice workflow for business users who receive commission or sales sheets in Excel or CSV format and need to turn them into a clean tax invoice quickly.

The app is designed for a practical flow:

1. Upload an Excel or CSV statement
2. Review and filter parsed rows
3. Edit the invoice details and line items if needed
4. Preview the invoice and export a PDF

This makes it especially useful for distributors, commission agents, agencies, and small businesses that work with spreadsheets instead of full accounting systems.

---

## Main workflow

```mermaid
flowchart LR
    A[Upload Excel / CSV Sheet] --> B[Review Parsed Records]
    B --> C[Filter by Customer / Invoice]
    C --> D[Edit Invoice Details]
    D --> E[Preview & Export PDF]
```

---

## Features

### Smart spreadsheet import
- Upload `.xlsx`, `.xls`, and `.csv` files directly in the browser
- Parse raw commission or sales rows into structured invoice data
- Filter records by customer or business context
- Review imported data before generating a final invoice

### Editable invoice builder
- Update buyer and seller details
- Adjust invoice number, date, terms, and line items
- Add or remove entries before final export
- Keep the process flexible for real-world corrections

### GST-ready calculations
- Calculate totals, taxes, and payable value from invoice data
- Support commission-based sales workflows and invoice styling for business use
- Keep the logic readable and user-controlled for quick edits

### PDF export and preview
- Generate a clean invoice preview in the app
- Export a PDF for sharing, printing, or record keeping
- Built for a quick business workflow without requiring a backend service

### Mobile-first, installable app
- Designed primarily for iPhone users and responsive web/mobile browsing
- Works well as an installable PWA on supported devices
- GitHub Pages friendly and usable without a backend server

---

## Tech stack

- React 19
- TypeScript
- Vite
- xlsx for Excel/CSV parsing
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
└── public/manifest.json
```

---

## License

This project is distributed under the repository license included in the project. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built for faster invoice work on mobile, desktop, and GitHub Pages.</sub>
</div>
