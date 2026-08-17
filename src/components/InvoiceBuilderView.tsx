import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  FileSpreadsheet, 
  Calendar, 
  CheckCircle2, 
  UploadCloud,
  ArrowRight,
  Download,
  AlertCircle,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  PenTool
} from 'lucide-react';
import { InvoiceData, InvoiceItem, ExcelParsedRecord } from '../types';
import { formatIndianCurrency, numberToIndianRupees } from '../utils/numberToWords';
import { parseExcelFile, convertParsedRecordsToInvoiceItems, exportSampleExcelWorkbook } from '../utils/excelParser';

interface InvoiceBuilderViewProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  onOpenAddItemModal: (item?: InvoiceItem) => void;
  onNavigateToPreview: () => void;
  onNavigateToSettings: () => void;
}

export const InvoiceBuilderView: React.FC<InvoiceBuilderViewProps> = ({
  invoiceData,
  setInvoiceData,
  onOpenAddItemModal,
  onNavigateToPreview,
  onNavigateToSettings,
}) => {
  // Mode selection: 'manual' or 'excel'
  const [entryMode, setEntryMode] = useState<'manual' | 'excel'>('manual');
  
  // Excel Sheet Parsing states
  const [isDragging, setIsDragging] = useState(false);
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [parsedRecords, setParsedRecords] = useState<ExcelParsedRecord[]>([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [excelError, setExcelError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const taxableValue = invoiceData.items.reduce((sum, item) => sum + (item.commissionAmount || 0), 0);
  const gstRate = invoiceData.gstRate || 18;
  const gstAmount = (taxableValue * gstRate) / 100;
  const grandTotal = taxableValue + gstAmount;
  const totalQtyHandled = invoiceData.items.reduce((sum, item) => sum + (item.qty || 0), 0);

  const amountInWords = numberToIndianRupees(grandTotal);

  const handleDeleteItem = (id: string) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id),
    }));
  };

  const handleDuplicateItem = (item: InvoiceItem) => {
    const duplicated: InvoiceItem = {
      ...item,
      id: `item-${Date.now()}`,
      description: `${item.description} (Copy)`,
    };
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, duplicated],
    }));
  };

  const handleClearAllItems = () => {
    if (invoiceData.items.length === 0) return;
    if (window.confirm('Are you sure you want to clear all line items?')) {
      setInvoiceData(prev => ({ ...prev, items: [] }));
    }
  };

  const handleSetTodayDate = () => {
    const today = new Date().toISOString().split('T')[0];
    setInvoiceData(prev => ({ ...prev, invoiceDate: today }));
  };

  // Excel parsing
  const handleFileProcess = (file: File) => {
    setExcelError('');
    setIsProcessing(true);
    setExcelFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const result = parseExcelFile(buffer);

        if (result.records.length === 0) {
          setExcelError('No valid commission rows found in spreadsheet.');
          setIsProcessing(false);
          return;
        }

        setParsedRecords(result.records);
        setCustomers(result.customers);
        setSelectedCustomer('ALL');
      } catch (err: any) {
        console.error('Error parsing excel:', err);
        setExcelError(err.message || 'Failed to parse Excel file.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setExcelError('Error reading file.');
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSampleStatement = () => {
    setExcelFileName('MCA Commission working 08.08.2026.xlsx');
    setExcelError('');
    
    const records: ExcelParsedRecord[] = [
      { customer: 'BIO AGRO ENERGY PVT LTD', invNo: '800086408', date: '28-Jan-26', product: 'SPIRIZYME ADV ULTI', qty: 360, unitPrice: 550, commPerKg: 16.5, commAmt: 5940 },
      { customer: 'BIO AGRO ENERGY PVT LTD', invNo: '800087967', date: '6-Mar-26', product: 'SPIRIZYME ADV ULTI', qty: 3480, unitPrice: 550, commPerKg: 16.5, commAmt: 57420 },
      { customer: 'BIO AGRO ENERGY PVT LTD', invNo: '800089619', date: '14-Apr-26', product: 'EFFYGREN', qty: 30, unitPrice: 2800, commPerKg: 84, commAmt: 2520 },
      { customer: 'BIO AGRO ENERGY PVT LTD', invNo: '800089619', date: '14-Apr-26', product: 'RM-20', qty: 10, unitPrice: 26000, commPerKg: 780, commAmt: 7800 },
      { customer: 'BIO AGRO ENERGY PVT LTD', invNo: '800089619', date: '14-Apr-26', product: 'SPIRIZYME ADV ULTI', qty: 1590, unitPrice: 550, commPerKg: 16.5, commAmt: 26235 },
      { customer: 'BIO AGRO ENERGY PVT LTD', invNo: '800089619', date: '14-Apr-26', product: 'FORTIVA REVO X', qty: 375, unitPrice: 1965, commPerKg: 58.95, commAmt: 22106.25 },
      { customer: 'BIO AGRO ENERGY PVT LTD', invNo: '800089619', date: '14-Apr-26', product: 'ALCOHOL ACTIVE DR', qty: 320, unitPrice: 640, commPerKg: 19.2, commAmt: 6144 },
      { customer: 'RAVINDRA AND COMPANY LTD', invNo: '800089707', date: '17-Apr-26', product: 'EFFYMOLL+', qty: 75, unitPrice: 2700, commPerKg: 780, commAmt: 58500 },
      { customer: 'SNJ SUGARS AND PRODUCTS LTD', invNo: '800091196', date: '4-Jun-26', product: 'EFFYGREN', qty: 350, unitPrice: 3000, commPerKg: 600, commAmt: 210000 },
      { customer: 'THE ANDHRA SUGARS LTD', invNo: '800091867', date: '23-Jun-26', product: 'EFFYMOLL+', qty: 50, unitPrice: 3300, commPerKg: 779, commAmt: 38950 },
      { customer: 'VISHWA SAMUDRA BIO ENERGY PVT LTD', invNo: '800082526', date: '30-Oct-25', product: 'FORTIVA REVO X', qty: 1002, unitPrice: 1608.75, commPerKg: 9.6525, commAmt: 9671.80 },
      { customer: 'VISHWA SAMUDRA BIO ENERGY PVT LTD', invNo: '800082526', date: '30-Oct-25', product: 'SPIRIZYME ADV ULTI', qty: 8249, unitPrice: 483.45, commPerKg: 2.9007, commAmt: 23927.87 },
    ];

    setParsedRecords(records);
    setCustomers([
      'BIO AGRO ENERGY PVT LTD',
      'RAVINDRA AND COMPANY LTD',
      'SNJ SUGARS AND PRODUCTS LTD',
      'THE ANDHRA SUGARS LTD',
      'VISHWA SAMUDRA BIO ENERGY PVT LTD',
    ]);
    setSelectedCustomer('ALL');
  };

  const filteredExcelRecords = parsedRecords.filter(r => {
    const matchesCustomer = selectedCustomer === 'ALL' || r.customer === selectedCustomer;
    const matchesQuery = !searchQuery || 
      r.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.invNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCustomer && matchesQuery;
  });

  const filteredExcelTotalTaxable = filteredExcelRecords.reduce((sum, r) => sum + (r.commAmt || 0), 0);
  const filteredExcelTotalQty = filteredExcelRecords.reduce((sum, r) => sum + (r.qty || 0), 0);

  const handleApplyExcelToInvoice = () => {
    if (filteredExcelRecords.length === 0) return;
    const newItems = convertParsedRecordsToInvoiceItems(parsedRecords, selectedCustomer);
    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
    }));
    setUploadFeedback(`Applied ${newItems.length} line items to your Tax Invoice.`);
    setTimeout(() => setUploadFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. Hero Overview & Metric Card */}
      <div className="apple-glass-card rounded-3xl p-5 sm:p-7 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50/80 border border-blue-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Tax Invoice Generator
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
              {invoiceData.seller.name || invoiceData.seller.tradeName || 'Murthy Chemical Agencies'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              GST Tax Invoice &bull; Billed to <strong className="text-slate-800">{invoiceData.buyer.name || 'Praj Industries Limited'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 apple-glass-subtle p-3.5 rounded-2xl self-start md:self-auto shadow-2xs">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Total Invoice Value</span>
              <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {formatIndianCurrency(grandTotal)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200/80" />
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Active Items</span>
              <span className="text-xs sm:text-sm font-bold text-blue-700">
                {invoiceData.items.length} items ({totalQtyHandled.toLocaleString()} kg)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Basic Invoice Details */}
      <div className="apple-glass-card rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">1</span>
            Invoice Details
          </h2>
          <button
            type="button"
            onClick={handleSetTodayDate}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 apple-glass-btn px-2.5 py-1 rounded-xl active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Set Today</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Invoice Date
            </label>
            <input
              type="date"
              value={invoiceData.invoiceDate}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceData.invoiceNumber}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              placeholder="e.g. MCA/2026-27/001"
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">From (Seller)</span>
            <div className="p-2.5 apple-glass-subtle rounded-xl flex items-center justify-between">
              <div className="truncate pr-2">
                <span className="text-xs font-bold text-slate-900 block truncate">{invoiceData.seller.name || 'Murthy Chemical Agencies'}</span>
                <span className="text-[10px] text-slate-500 font-mono">GSTIN: {invoiceData.seller.gstin}</span>
              </div>
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 px-2 py-0.5 apple-glass-btn rounded-lg flex-shrink-0"
              >
                Edit
              </button>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">To (Buyer)</span>
            <div className="p-2.5 apple-glass-subtle rounded-xl flex items-center justify-between">
              <div className="truncate pr-2">
                <span className="text-xs font-bold text-slate-900 block truncate">{invoiceData.buyer.name || 'Praj Industries Limited'}</span>
                <span className="text-[10px] text-slate-500 font-mono">GSTIN: {invoiceData.buyer.gstin || 'N/A'}</span>
              </div>
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 px-2 py-0.5 apple-glass-btn rounded-lg flex-shrink-0"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Clubbed Line Items Creator: Choose Manual Entry or Upload Excel */}
      <div className="apple-glass-card rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">2</span>
              Add Line Items
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Type items manually or upload a monthly Excel statement.
            </p>
          </div>

          {/* Clean Segmented Mode Selector */}
          <div className="flex items-center apple-glass-subtle p-1 rounded-2xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setEntryMode('manual')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                entryMode === 'manual'
                  ? 'bg-white text-blue-700 shadow-sm font-bold scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Enter Manually</span>
            </button>

            <button
              type="button"
              onClick={() => setEntryMode('excel')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                entryMode === 'excel'
                  ? 'bg-white text-blue-700 shadow-sm font-bold scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Upload Excel</span>
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(Optional)</span>
            </button>
          </div>
        </div>

        {uploadFeedback && (
          <div className="p-3.5 bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 rounded-2xl flex items-center space-x-2 text-xs font-semibold shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{uploadFeedback}</span>
          </div>
        )}

        {/* Mode A: Manual Entry */}
        {entryMode === 'manual' && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 apple-glass-subtle p-4 sm:p-5 rounded-2xl">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Manual Line Item Form
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specify description, quantity (kg), customer invoice reference, and commission rate.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenAddItemModal()}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 apple-btn-primary text-white font-bold text-xs rounded-2xl flex-shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Line Item</span>
              </button>
            </div>

            {/* Quick Chemical Presets */}
            <div className="pt-1">
              <span className="text-xs font-semibold text-slate-600 block mb-2.5">
                Quick Preset Items (Click to add standard item):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { name: 'SPIRIZYME ADV ULTI', price: 550, comm: 16.50, desc: 'Enzymes (₹16.50/kg)' },
                  { name: 'FORTIVA REVO X', price: 1965, comm: 58.95, desc: 'Specialty Chemical (₹58.95/kg)' },
                  { name: 'EFFYGREN', price: 2800, comm: 84.00, desc: 'Enzyme Formulation (₹84.00/kg)' },
                  { name: 'EFFYMOLL+', price: 2700, comm: 780.00, desc: 'Processing Chemical (₹780.00/kg)' },
                ].map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => onOpenAddItemModal({
                      id: `item-${Date.now()}`,
                      description: p.name,
                      hsnSacCode: '998311',
                      qty: 1000,
                      unit: 'kg',
                      unitPrice: p.price,
                      productAmount: 1000 * p.price,
                      commissionType: 'PER_UNIT',
                      commissionRate: p.comm,
                      commissionAmount: 1000 * p.comm,
                    })}
                    className="text-left p-3.5 apple-glass-card rounded-2xl hover:border-blue-300 transition-all group active:scale-[0.98]"
                  >
                    <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700 truncate">
                      + {p.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {p.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mode B: Excel Upload */}
        {entryMode === 'excel' && (
          <div className="space-y-4 pt-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => e.target.files && e.target.files[0] && handleFileProcess(e.target.files[0])} 
              accept=".xlsx,.xls,.csv" 
              className="hidden" 
            />

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                isDragging ? 'border-blue-500 bg-blue-50/70' : 'border-slate-300/80 hover:border-blue-400 apple-glass-subtle'
              }`}
            >
              <div className="max-w-md mx-auto space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs border border-blue-100">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {excelFileName ? excelFileName : 'Click to select or drag & drop monthly commission sheet'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports <strong>.xlsx</strong>, <strong>.xls</strong>, and <strong>.csv</strong> spreadsheets
                  </p>
                </div>
                {isProcessing && (
                  <p className="text-xs text-blue-600 font-semibold animate-pulse">
                    Extracting volume and rates...
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportSampleExcelWorkbook}
                  className="flex items-center space-x-1.5 px-3 py-1.5 apple-glass-btn text-slate-700 rounded-xl text-xs font-semibold active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download Blank Template</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadSampleStatement}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200/80 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load MCA Sample Working</span>
                </button>
              </div>

              {parsedRecords.length > 0 && (
                <button
                  type="button"
                  onClick={handleApplyExcelToInvoice}
                  className="flex items-center space-x-2 px-4 py-2 apple-btn-primary text-white font-bold text-xs rounded-2xl active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Transfer {filteredExcelRecords.length} Items into Invoice</span>
                </button>
              )}
            </div>

            {excelError && (
              <div className="p-3.5 bg-red-50/90 border border-red-200/80 text-red-700 rounded-2xl flex items-center space-x-2 text-xs shadow-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{excelError}</span>
              </div>
            )}

            {/* Parsed Spreadsheet Table */}
            {parsedRecords.length > 0 && (
              <div className="apple-glass-card rounded-2xl overflow-hidden mt-3">
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">
                      Parsed Rows ({filteredExcelRecords.length})
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Subtotal: {formatIndianCurrency(filteredExcelTotalTaxable)} ({filteredExcelTotalQty.toLocaleString()} kg)
                    </span>
                  </div>

                  {/* Customer Filter */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="px-2.5 py-1 apple-glass-input text-slate-800 text-xs font-medium rounded-xl outline-none"
                    >
                      <option value="ALL">All Clients ({customers.length})</option>
                      {customers.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <div className="relative">
                      <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search item..."
                        className="pl-7 pr-2.5 py-1 apple-glass-input text-xs rounded-xl outline-none w-28 sm:w-36"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Client</th>
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3">Inv #</th>
                        <th className="py-2 px-3 text-right">Quantity (kg)</th>
                        <th className="py-2 px-3 text-right">Unit Rate (₹)</th>
                        <th className="py-2 px-3 text-right">Commission Rate</th>
                        <th className="py-2 px-3 text-right">Taxable Commission (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredExcelRecords.map((rec, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-1.5 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-medium text-slate-800">{rec.customer}</td>
                          <td className="py-1.5 px-3 text-slate-900 font-semibold">{rec.product}</td>
                          <td className="py-1.5 px-3 text-slate-500">{rec.invNo || '-'}</td>
                          <td className="py-1.5 px-3 text-right font-medium text-slate-900">{rec.qty.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-right text-slate-600">{rec.unitPrice ? `₹${rec.unitPrice}` : '-'}</td>
                          <td className="py-1.5 px-3 text-right font-medium text-blue-700">₹{rec.commPerKg}/kg</td>
                          <td className="py-1.5 px-3 text-right font-bold text-slate-900">{formatIndianCurrency(rec.commAmt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Active Invoice Line Items: Responsive Mobile Cards + Desktop Table */}
      <div className="apple-glass-card rounded-3xl p-5 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">3</span>
              Invoice Items ({invoiceData.items.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Taxable: {formatIndianCurrency(taxableValue)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {invoiceData.items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllItems}
                className="px-2.5 py-1 text-slate-500 hover:text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50/50 transition-colors"
              >
                Clear All
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenAddItemModal()}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-50/90 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl border border-blue-200/80 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {invoiceData.items.length === 0 ? (
          <div className="py-10 text-center text-slate-500 space-y-2">
            <p className="text-xs font-semibold">No line items in this invoice yet.</p>
            <p className="text-xs text-slate-400">
              Use "Enter Manually" above or "Upload Excel" to populate items.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View: Clean Card Items (< 640px) */}
            <div className="sm:hidden space-y-3">
              {invoiceData.items.map((item, idx) => (
                <div key={item.id} className="apple-glass-subtle rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">ITEM #{idx + 1}</span>
                      <h4 className="text-xs font-bold text-slate-900">{item.description}</h4>
                      {(item.invNo || item.date) && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.invNo ? `Inv #${item.invNo}` : ''} {item.date ? `• ${item.date}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Commission</span>
                      <span className="text-xs font-black text-blue-700">
                        {formatIndianCurrency(item.commissionAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Quantity</span>
                      <span className="font-semibold text-slate-800">{item.qty.toLocaleString()} {item.unit || 'kg'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Unit Price</span>
                      <span className="font-semibold text-slate-800">{item.unitPrice ? `₹${item.unitPrice.toLocaleString('en-IN')}` : '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Rate</span>
                      <span className="font-semibold text-blue-700">{item.commissionRate ? `₹${item.commissionRate.toFixed(2)}/kg` : '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-200/40">
                    <button
                      type="button"
                      onClick={() => onOpenAddItemModal(item)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateItem(item)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet View: Full Table (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200/70">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Description & Reference</th>
                    <th className="py-2.5 px-2 text-center">HSN/SAC</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit Price (₹)</th>
                    <th className="py-2.5 px-3 text-right">Commission Rate</th>
                    <th className="py-2.5 px-3 text-right">Taxable Commission (₹)</th>
                    <th className="py-2.5 px-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/40">
                  {invoiceData.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.description}</div>
                        {(item.invNo || item.date) && (
                          <div className="text-[11px] text-slate-500">
                            {item.invNo ? `Inv #${item.invNo}` : ''} {item.date ? `• ${item.date}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-slate-600">
                        {item.hsnSacCode || '998311'}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-900">
                        {item.qty.toLocaleString()} {item.unit || 'kg'}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {item.unitPrice ? `₹${item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-blue-700">
                        {item.commissionRate ? `₹${item.commissionRate.toFixed(2)}/${item.unit || 'kg'}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatIndianCurrency(item.commissionAmount)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => onOpenAddItemModal(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100/70 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateItem(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100/70 rounded-lg transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* 5. Summary & Tax Calculation Card */}
      <div className="apple-glass-card rounded-3xl p-5 sm:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Amount in Words
            </h4>
            <div className="p-4 apple-glass-subtle rounded-2xl">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                {amountInWords}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Integrated GST (IGST {invoiceData.gstRate || 18}%) applicable on taxable commission value.
            </p>
          </div>

          <div className="lg:col-span-5 apple-glass-subtle rounded-2xl p-5 space-y-4">
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Total Taxable Value:</span>
                <span className="font-semibold text-slate-900">{formatIndianCurrency(taxableValue)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Integrated GST (18%):</span>
                <span className="font-semibold text-slate-800">{formatIndianCurrency(gstAmount)}</span>
              </div>
              <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900">Total Invoice Amount:</span>
                <span className="font-black text-blue-700 text-base">{formatIndianCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToPreview}
              className="w-full flex items-center justify-center space-x-2 py-3 apple-btn-primary text-white font-bold text-xs rounded-2xl active:scale-95 transition-all"
            >
              <span>Proceed to Preview & Print</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
