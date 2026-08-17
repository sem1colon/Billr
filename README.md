# Billr — GST Commission & Tax Invoice Automation Engine

> **Short Description (for GitHub About / Repository Header):**  
> Modern GST tax invoice & chemical commission billing system with Excel statement parser, dual unit/percentage rates, auto-computed 18% IGST, and vector PDF generator with digital signatures.

---

## 🌟 Overview

**Billr** is a high-precision, compliant web application designed for commission agents, chemical distributors, and commercial suppliers. It streamlines monthly billing by parsing raw sales statements (Excel/CSV), extracting product sales data, calculating per-unit or percentage commissions, and generating standard, print-ready Indian GST Tax Invoices.

Pre-configured for **Murthy Chemical Agencies** (Seller, Telangana GSTIN `36ABXFM3174B1Z1`) billing to **Praj Industries Limited** (Buyer, Maharashtra GSTIN `27AAACP6090Q1ZS`), the system is also fully adaptable for any multi-state enterprise with custom HSN/SAC mappings.

---

## 🚀 Key Features

- **📊 Excel & CSV Statement Parser**:
  - Drag-and-drop support for commission statement workbooks (`.xlsx`, `.xls`, `.csv`).
  - Automatic column detection for Customer Names, Invoice Numbers, Dispatch Dates, Chemical Goods, Quantities, Unit Prices, and Commission Rates.
  - Multi-party filtering to isolate statement rows by client (e.g., Bio Agro Energy, Ravindra & Co, SNJ Sugars, Andhra Sugars, Vishwa Samudra).

- **🧮 Comprehensive Calculation Engine**:
  - **Unit Price (₹/kg)** & Turnover: Automatically derives gross trade value alongside commission.
  - **Dual Commission Modes**: Computes commission either as a fixed rate per unit (e.g., `₹16.50 / kg`) or as a percentage of unit sales price.
  - **Tax Computation**: 18% Integrated GST (IGST) calculated on commission taxable value with Indian currency formatting and auto-words conversion (Lakhs & Crores).

- **📄 Vector PDF & Print Engine**:
  - Pixel-perfect A4 portrait GST Tax Invoice layout conforming to Indian GST legal requirements.
  - Interactive live document preview with zoom and responsive formatting.
  - Auto-embedded digital/drawn partner signature and bank account transfer details.

- **🎨 Apple Liquid Glass User Experience**:
  - Translucent frosted glass containers (`backdrop-blur-2xl`) with ambient rim-lighting.
  - Standardized bottom navigation dock with clear Back and Next step transitions.
  - Senior & Accessibility mode with high-contrast text sizing.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Spreadsheet Parsing**: [SheetJS (xlsx)](https://sheetjs.com/)
- **Motion & Interactions**: [Motion](https://motion.dev/) + [Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏁 Getting Started

### Prerequisites
- Node.js `v18.0.0` or higher
- npm, pnpm, or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sem1colon/Billr.git
   cd Billr
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules for node, dist, and IDEs
├── index.html                # Single Page Application HTML root
├── package.json              # Project dependencies & scripts
├── src/
│   ├── components/           # UI Components
│   │   ├── BottomDockNav.tsx        # Standard Back/Next navigation dock
│   │   ├── BusinessSettingsView.tsx # Seller/Buyer agency profile manager
│   │   ├── ExcelImportView.tsx      # Statement spreadsheet parser view
│   │   ├── HeaderNav.tsx            # Top header bar & accessibility toggles
│   │   ├── InvoiceBuilderView.tsx   # Primary line-item invoice editor
│   │   ├── InvoiceLivePreview.tsx   # Live A4 GST preview with PDF export
│   │   ├── ItemFormModal.tsx        # Add/Edit line item modal
│   │   └── SignatureModal.tsx       # Draw & upload partner signature modal
│   ├── data/
│   │   └── sampleData.ts     # Reference agency profiles and statement items
│   ├── types.ts              # TypeScript interfaces and data models
│   ├── utils/
│   │   ├── excelParser.ts    # SheetJS statement processor & exporter
│   │   ├── numberToWords.ts  # Indian numbering system currency converter
│   │   ├── pdfGenerator.ts   # jsPDF tax invoice document builder
│   │   └── signatureUtils.ts # Base64 signature helpers
│   ├── App.tsx               # Main application container
│   ├── main.tsx              # React DOM entry point
│   └── index.css             # Tailwind CSS imports & global styles
└── tsconfig.json             # TypeScript configuration
```

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](file:///Users/sem1Colon/Documents/Billr/LICENSE) file for full details.

```text
MIT License
Copyright (c) 2026 Vamsi Kaza (sem1colon)
```
