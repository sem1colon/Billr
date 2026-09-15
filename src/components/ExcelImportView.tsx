import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Download,
  AlertCircle,
  Search,
  Check,
  Plus,
  Trash2,
  Edit3,
  Building2,
  Calendar,
  Layers,
  Scale,
  ReceiptIndianRupee,
  Sparkles,
  FileText,
  X,
  ChevronRight
} from 'lucide-react';
import { ExcelParsedRecord, InvoiceItem } from '../types';
import { parseExcelFile, convertParsedRecordsToInvoiceItems, exportSampleExcelWorkbook, exportSampleCsv } from '../utils/excelParser';
import { formatIndianCurrency } from '../utils/numberToWords';
import { loadWorkbookState, saveWorkbookState } from '../utils/storageUtils';
import { useModalAccessibility } from '../utils/useModalAccessibility';

interface ExcelImportViewProps {
  onApplyItemsToInvoice: (items: InvoiceItem[]) => void;
  onNavigateToPreview: () => void;
  onNavigateToBuilder: () => void;
}

export const ExcelImportView: React.FC<ExcelImportViewProps> = ({
  onApplyItemsToInvoice,
  onNavigateToPreview,
  onNavigateToBuilder,
}) => {
  const savedWorkbook = loadWorkbookState();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>(savedWorkbook?.fileName || '');
  const [activeSheetName, setActiveSheetName] = useState<string>(savedWorkbook?.activeSheetName || '');
  const [availableSheets, setAvailableSheets] = useState<string[]>(savedWorkbook?.availableSheets || []);
  const [parsedRecords, setParsedRecords] = useState<ExcelParsedRecord[]>(savedWorkbook?.records || []);

  const [selectedCustomer, setSelectedCustomer] = useState<string>(savedWorkbook?.selectedCustomer || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>(savedWorkbook?.searchQuery || '');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExcelParsedRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const closeRowModal = () => {
    setEditingRecord(null);
    setIsAddModalOpen(false);
  };
  const rowDialogRef = useModalAccessibility(isAddModalOpen, closeRowModal);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rawFileBufferRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    saveWorkbookState({
      records: parsedRecords,
      fileName,
      activeSheetName,
      availableSheets,
      selectedCustomer,
      searchQuery,
    });
  }, [parsedRecords, fileName, activeSheetName, availableSheets, selectedCustomer, searchQuery]);

  // Extract unique customer list
  const customers = Array.from(new Set(parsedRecords.map(r => r.customer).filter(Boolean)));

  const handleFileProcess = (file: File) => {
    setErrorMsg('');
    setIsProcessing(true);
    setFileName(file.name);

    const extension = file.name.toLowerCase().split('.').pop() || '';
    const supportedExtensions = new Set(['xlsx', 'xls', 'csv', 'tsv', 'txt']);
    if (!supportedExtensions.has(extension)) {
      setErrorMsg(`Unsupported file type .${extension || 'unknown'}. Upload an .xlsx, .xls, .csv, .tsv, or .txt workbook instead.`);
      setIsProcessing(false);
      return;
    }
    const isTextFile = ['csv', 'tsv', 'txt'].includes(extension);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (isTextFile) {
          const text = e.target?.result as string;
          const result = parseExcelFile(text);
          if (result.records.length === 0) {
            setErrorMsg('No valid commission rows found. Add data rows below the header and upload the corrected file again.');
            setIsProcessing(false);
            return;
          }
          setParsedRecords(result.records);
          setAvailableSheets(result.sheetNames);
          setActiveSheetName(result.activeSheetName);
          setSelectedCustomer('ALL');
        } else {
          const buffer = e.target?.result as ArrayBuffer;
          rawFileBufferRef.current = buffer;
          const result = parseExcelFile(buffer);
          if (result.records.length === 0) {
            setErrorMsg('No valid commission rows found. Add Product, Qty, and Commission Amount columns, then upload the corrected workbook again.');
            setIsProcessing(false);
            return;
          }
          setParsedRecords(result.records);
          setAvailableSheets(result.sheetNames);
          setActiveSheetName(result.activeSheetName);
          setSelectedCustomer('ALL');
        }
      } catch (err: any) {
        console.error('Error parsing file:', err);
        setErrorMsg(err.message || 'The file could not be read. Verify the workbook is not corrupted, then upload it again.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('The file could not be read. Check that it is available locally and upload it again.');
      setIsProcessing(false);
    };

    if (isTextFile) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSheetChange = (sheet: string) => {
    if (!rawFileBufferRef.current) return;
    try {
      setIsProcessing(true);
      const result = parseExcelFile(rawFileBufferRef.current, sheet);
      setParsedRecords(result.records);
      setActiveSheetName(sheet);
      setSelectedCustomer('ALL');
    } catch (err: any) {
      setErrorMsg(`Error loading sheet "${sheet}": ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Toggle record selection
  const handleToggleSelect = (id: string) => {
    setParsedRecords(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  // Master Select / Deselect
  const handleToggleSelectAll = (select: boolean) => {
    setParsedRecords(prev => prev.map(r => {
      const isVisible = (selectedCustomer === 'ALL' || r.customer === selectedCustomer);
      return isVisible ? { ...r, selected: select } : r;
    }));
  };

  // Delete record
  const handleDeleteRecord = (id: string) => {
    setParsedRecords(prev => prev.filter(r => r.id !== id));
  };

  // Save record edit
  const handleSaveEditRecord = (updated: ExcelParsedRecord) => {
    // Recalculate amount or rate
    let qty = Number(updated.qty) || 0;
    let rate = Number(updated.commPerKg) || 0;
    let amt = Number(updated.commAmt) || 0;
    if (qty > 0 && rate > 0) {
      amt = Number((qty * rate).toFixed(2));
    }
    const finalRec = { ...updated, qty, commPerKg: rate, commAmt: amt };

    setParsedRecords(prev => {
      const exists = prev.some(r => r.id === finalRec.id);
      if (exists) {
        return prev.map(r => r.id === finalRec.id ? finalRec : r);
      }
      return [finalRec, ...prev];
    });
    setEditingRecord(null);
    setIsAddModalOpen(false);
  };

  // Filter records based on customer tab and search
  const filteredRecords = parsedRecords.filter(r => {
    const matchesCustomer = selectedCustomer === 'ALL' || r.customer === selectedCustomer;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      r.product.toLowerCase().includes(q) ||
      r.customer.toLowerCase().includes(q) ||
      r.invNo.toLowerCase().includes(q) ||
      r.date.toLowerCase().includes(q);
    return matchesCustomer && matchesQuery;
  });

  const selectedVisibleRecords = filteredRecords.filter(r => r.selected !== false);
  const allVisibleSelected = filteredRecords.length > 0 && filteredRecords.every(r => r.selected !== false);

  // Totals for selected items
  const totalTaxable = selectedVisibleRecords.reduce((sum, r) => sum + (r.commAmt || 0), 0);
  const totalQty = selectedVisibleRecords.reduce((sum, r) => sum + (r.qty || 0), 0);
  const estimatedGst = Number(((totalTaxable * 18) / 100).toFixed(2));
  const estimatedGrandTotal = Number((totalTaxable + estimatedGst).toFixed(2));

  // Handler: Generate Invoice
  const handleGenerateInvoice = (directToPreview = false) => {
    if (selectedVisibleRecords.length === 0) {
      setErrorMsg('Select at least one transaction row before creating an invoice.');
      return;
    }
    const items = convertParsedRecordsToInvoiceItems(parsedRecords, selectedCustomer);
    onApplyItemsToInvoice(items);

    if (directToPreview) {
      onNavigateToPreview();
    } else {
      onNavigateToBuilder();
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto">

      {/* 1. Top Hero Card: File Ingestion Hub */}
      <div className="apple-glass-card rounded-[28px] p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-700 tracking-wide">
                STEP 1 &bull; DATA INGESTION
              </span>
              <span className="text-xs text-slate-400 font-medium">Auto-Parsing Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              MCA Commission Working Sheet
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Upload your MCA workbook, review commission transactions, and prepare the Praj Industries tax invoice.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportSampleExcelWorkbook}
              className="flex items-center space-x-1.5 px-3 py-2 apple-glass-btn text-slate-700 rounded-xl text-xs font-semibold active:scale-95 cursor-pointer"
              title="Download Excel template (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Sample .xlsx</span>
            </button>

            <button
              type="button"
              onClick={exportSampleCsv}
              className="flex items-center space-x-1.5 px-3 py-2 apple-glass-btn text-slate-700 rounded-xl text-xs font-semibold active:scale-95 cursor-pointer"
              title="Download CSV template (.csv)"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Sample .csv</span>
            </button>

          </div>
        </div>

        {/* Drag & Drop File Zone */}
        <div className="mt-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed p-6 sm:p-7 text-center cursor-pointer transition-all duration-200 ${isDragging
                ? 'border-blue-500 bg-blue-50/80 shadow-md scale-[1.005]'
                : 'border-slate-300/90 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-400'
              }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              id="workbook-upload"
              name="workbook"
              onChange={(e) => e.target.files && e.target.files[0] && handleFileProcess(e.target.files[0])}
              accept=".xlsx,.xls,.csv,.tsv,.txt"
              className="hidden"
            />

            <div className="max-w-md mx-auto space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {fileName ? (
                    <span className="flex items-center justify-center space-x-1.5 text-blue-700">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{fileName}</span>
                    </span>
                  ) : (
                    'Tap to choose file or drag & drop spreadsheet here'
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compatible with <strong>Excel (.xlsx, .xls)</strong> and <strong>CSV (.csv)</strong> files
                </p>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center space-x-2 text-xs text-blue-600 font-semibold pt-1">
                  <div className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  <span>Parsing records...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Multi-sheet Tabs if present */}
        {availableSheets.length > 1 && (
          <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-semibold flex-shrink-0">Sheets:</span>
            {availableSheets.map(sheet => (
              <button
                key={sheet}
                type="button"
                onClick={() => handleSheetChange(sheet)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${activeSheetName === sheet
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                {sheet}{sheet.toLowerCase() === 'sheet1' ? ' (Recommended)' : ''}
              </button>
            ))}
          </div>
        )}

        {fileName && activeSheetName && (
          <p className="mt-3 text-xs text-slate-600" role="status">
            <strong>{fileName}</strong> is using worksheet <strong>{activeSheetName}</strong>.
            {activeSheetName.toLowerCase() === 'sheet1' && ' Sheet1 contains the detailed invoice rows.'}
          </p>
        )}

        {/* Error Notice */}
        {errorMsg && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center space-x-2 text-xs font-semibold" role="alert" aria-live="assertive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 2. Executive KPI Cards (Taxable, Qty, GST, Total) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        <div className="apple-glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Selected Rows</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedVisibleRecords.length} <span className="text-xs font-semibold text-slate-400">/ {filteredRecords.length} items</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
              {selectedCustomer === 'ALL' ? 'All Clients' : selectedCustomer}
            </div>
          </div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Total Quantity</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {totalQty.toLocaleString()} <span className="text-xs font-semibold text-slate-400">kg</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Chemical volume handled
            </div>
          </div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Taxable Commission</span>
            <ReceiptIndianRupee className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight">
              {formatIndianCurrency(totalTaxable)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              + GST 18%: {formatIndianCurrency(estimatedGst)}
            </div>
          </div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between border-blue-200 bg-gradient-to-br from-white to-blue-50/50">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Payable (Inc. Tax)</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatIndianCurrency(estimatedGrandTotal)}
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
              Ready for Tax Invoice
            </div>
          </div>
        </div>

      </div>

      {/* 3. Customer Filter Segmented Pills */}
      <div className="apple-glass-card rounded-2xl p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Filter by Client / Party
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {customers.length} client{customers.length !== 1 ? 's' : ''} found in statement
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">

          {/* ALL Customers Pill */}
          <button
            type="button"
            onClick={() => setSelectedCustomer('ALL')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all cursor-pointer ${selectedCustomer === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
          >
            <span>All Clients</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${selectedCustomer === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {parsedRecords.length}
            </span>
          </button>

          {/* Individual Customers Pills */}
          {customers.map(c => {
            const customerRecords = parsedRecords.filter(r => r.customer === c);
            const customerAmt = customerRecords.reduce((sum, r) => sum + (r.commAmt || 0), 0);
            const isCurrent = selectedCustomer === c;

            return (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCustomer(c)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all cursor-pointer ${isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
              >
                <span className="truncate max-w-[160px] sm:max-w-[220px]">{c}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {customerRecords.length}
                </span>
                <span className={`text-[10px] opacity-85 hidden sm:inline ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                  ({formatIndianCurrency(customerAmt)})
                </span>
              </button>
            );
          })}

        </div>
      </div>

      {/* 4. Interactive Working Table & Card Grid */}
      <div className="apple-glass-card rounded-[28px] p-4 sm:p-6 space-y-4 shadow-xs">

        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="select-all-visible"
              checked={allVisibleSelected}
              onChange={(e) => handleToggleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="select-all-visible" className="text-xs sm:text-sm font-bold text-slate-900 cursor-pointer select-none">
              {allVisibleSelected ? 'Deselect All' : 'Select All'} ({filteredRecords.length} items)
            </label>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items, invoices..."
                className="pl-8 pr-3 py-2 apple-glass-input text-xs rounded-xl outline-none w-full sm:w-56"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Add Custom Item Button */}
            <button
              type="button"
              onClick={() => {
                setEditingRecord({
                  id: `rec-${Date.now()}`,
                  customer: selectedCustomer !== 'ALL' ? selectedCustomer : (customers[0] || 'General Customer'),
                  invNo: '',
                  date: new Date().toISOString().split('T')[0],
                  product: '',
                  qty: 1,
                  unitPrice: 0,
                  commPerKg: 0,
                  commAmt: 0,
                  selected: true,
                });
                setIsAddModalOpen(true);
              }}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-xs flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Row</span>
              <span className="inline sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Table View */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-3 px-3">Product & Details</th>
                <th className="py-3 px-3">Client / Party</th>
                <th className="py-3 px-3">Inv No & Date</th>
                <th className="py-3 px-3 text-right">Quantity (kg)</th>
                <th className="py-3 px-3 text-right">Unit Rate (₹)</th>
                <th className="py-3 px-3 text-right">Comm/kg (₹)</th>
                <th className="py-3 px-3 text-right">Taxable Commission (₹)</th>
                <th className="py-3 px-3 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 bg-white">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                      <p className="text-slate-500 font-semibold">No transactions loaded yet.</p>
                      <p className="text-[11px] text-slate-400">Upload your Excel/CSV above or click &quot;Load MCA Sample&quot; to test with reference data.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isChecked = rec.selected !== false;
                  return (
                    <tr
                      key={rec.id}
                      className={`transition-colors ${isChecked ? 'hover:bg-blue-50/40' : 'bg-slate-50/70 text-slate-400 opacity-60'}`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(rec.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {rec.product}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {rec.customer}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {rec.invNo ? (
                          <span>#{rec.invNo} {rec.date && <span className="text-[11px] text-slate-400">({rec.date})</span>}</span>
                        ) : (
                          rec.date || '-'
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-900">
                        {rec.qty.toLocaleString()} kg
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {rec.unitPrice ? `₹${rec.unitPrice.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-blue-700">
                        ₹{rec.commPerKg.toFixed(2)}/kg
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        {formatIndianCurrency(rec.commAmt)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRecord(rec);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                            title="Edit row"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile (iPhone 17e) Chunked Touch Cards View */}
        <div className="md:hidden space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs font-medium space-y-2">
              <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-500">No transactions loaded yet</p>
              <p className="text-[11px] text-slate-400">Upload an Excel/CSV file above or load sample data to test.</p>
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isChecked = rec.selected !== false;
              return (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-2xl border transition-all ${isChecked
                      ? 'bg-white border-slate-200/90 shadow-2xs'
                      : 'bg-slate-50 border-slate-200/50 opacity-60'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(rec.id)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {rec.product}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                          {rec.customer}
                        </p>
                        {rec.invNo && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Inv #{rec.invNo} {rec.date && `• ${rec.date}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-black text-slate-900">
                        {formatIndianCurrency(rec.commAmt)}
                      </div>
                      <div className="text-[10px] font-bold text-blue-700 mt-0.5">
                        @ ₹{rec.commPerKg}/kg
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      Qty: <strong className="text-slate-800">{rec.qty.toLocaleString()} kg</strong>
                      {rec.unitPrice ? ` • Basic: ₹${rec.unitPrice}` : ''}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRecord(rec);
                          setIsAddModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg text-slate-600 bg-slate-100 text-[10px] font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="px-2 py-1 rounded-lg text-red-600 bg-red-50 text-[10px] font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar: Action Trigger to Generate Invoice */}
        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Selected: <strong className="text-slate-900">{selectedVisibleRecords.length} items</strong> &bull; Total Taxable:{' '}
            <strong className="text-blue-700">{formatIndianCurrency(totalTaxable)}</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleGenerateInvoice(false)}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 apple-glass-btn text-slate-800 rounded-2xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Edit Invoice Details</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenerateInvoice(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 apple-btn-primary text-white rounded-2xl text-xs sm:text-sm font-black active:scale-95 transition-all cursor-pointer shadow-md"
            >
              <span>Generate Tax Invoice PDF</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Inline Modal for Adding / Editing a Record */}
      {isAddModalOpen && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in" role="presentation">
          <div ref={rowDialogRef} role="dialog" aria-modal="true" aria-labelledby="row-dialog-title" className="apple-glass-card rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 max-h-[92dvh] overflow-y-auto">

            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 id="row-dialog-title" className="text-sm font-bold text-slate-900">
                {editingRecord.product ? 'Edit Transaction Row' : 'Add Transaction Row'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingRecord(null);
                  setIsAddModalOpen(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Client / Party Name</label>
                <input
                  type="text"
                  value={editingRecord.customer}
                  onChange={(e) => setEditingRecord({ ...editingRecord, customer: e.target.value })}
                  placeholder="e.g. BIO AGRO ENERGY PVT LTD"
                  className="w-full px-3 py-2 apple-glass-input rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Product / Description</label>
                <input
                  type="text"
                  value={editingRecord.product}
                  onChange={(e) => setEditingRecord({ ...editingRecord, product: e.target.value })}
                  placeholder="e.g. SPIRIZYME ADV ULTI"
                  className="w-full px-3 py-2 apple-glass-input rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Invoice / Bill No</label>
                  <input
                    type="text"
                    value={editingRecord.invNo}
                    onChange={(e) => setEditingRecord({ ...editingRecord, invNo: e.target.value })}
                    placeholder="800086408"
                    className="w-full px-3 py-2 apple-glass-input rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="text"
                    value={editingRecord.date}
                    onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                    placeholder="28-Jan-26"
                    className="w-full px-3 py-2 apple-glass-input rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Qty (kg)</label>
                  <input
                    type="number"
                    value={editingRecord.qty || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, qty: parseFloat(e.target.value) || 0 })}
                    placeholder="360"
                    className="w-full px-3 py-2 apple-glass-input rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Basic Rate (₹)</label>
                  <input
                    type="number"
                    value={editingRecord.unitPrice || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, unitPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="550"
                    className="w-full px-3 py-2 apple-glass-input rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Comm/kg (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={editingRecord.commPerKg || ''}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value) || 0;
                      const amt = Number((rate * (editingRecord.qty || 0)).toFixed(2));
                      setEditingRecord({ ...editingRecord, commPerKg: rate, commAmt: amt });
                    }}
                    placeholder="16.5"
                    className="w-full px-3 py-2 apple-glass-input rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Commission Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  value={editingRecord.commAmt || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, commAmt: parseFloat(e.target.value) || 0 })}
                  placeholder="5940"
                  className="w-full px-3 py-2 apple-glass-input rounded-xl font-bold text-blue-700 outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setEditingRecord(null);
                  setIsAddModalOpen(false);
                }}
                className="px-4 py-2 apple-glass-btn text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEditRecord(editingRecord)}
                className="px-5 py-2 apple-btn-primary text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Row
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
