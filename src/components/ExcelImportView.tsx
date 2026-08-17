import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  AlertCircle,
  Search,
  Check,
  RotateCcw
} from 'lucide-react';
import { ExcelParsedRecord, InvoiceItem } from '../types';
import { parseExcelFile, convertParsedRecordsToInvoiceItems, exportSampleExcelWorkbook } from '../utils/excelParser';
import { formatIndianCurrency } from '../utils/numberToWords';

interface ExcelImportViewProps {
  onApplyItemsToInvoice: (items: InvoiceItem[], customerName?: string) => void;
  onNavigateToPreview: () => void;
  onNavigateToBuilder?: () => void;
}

export const ExcelImportView: React.FC<ExcelImportViewProps> = ({
  onApplyItemsToInvoice,
  onNavigateToPreview,
  onNavigateToBuilder,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRecords, setParsedRecords] = useState<ExcelParsedRecord[]>([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    setErrorMsg('');
    setIsProcessing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const result = parseExcelFile(buffer);

        if (result.records.length === 0) {
          setErrorMsg('No valid commission rows found. Ensure columns contain Product, Quantity, Unit Price or Commission.');
          setIsProcessing(false);
          return;
        }

        setParsedRecords(result.records);
        setCustomers(result.customers);
        setSelectedCustomer('ALL');
      } catch (err: any) {
        console.error('Error parsing excel:', err);
        setErrorMsg(err.message || 'Failed to parse the file. Please check format.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Error reading file.');
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
    setFileName('MCA Commission working 08.08.2026.xlsx');
    setErrorMsg('');
    
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

  const filteredRecords = parsedRecords.filter(r => {
    const matchesCustomer = selectedCustomer === 'ALL' || r.customer === selectedCustomer;
    const matchesQuery = !searchQuery || 
      r.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.invNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCustomer && matchesQuery;
  });

  const filteredTotalTaxable = filteredRecords.reduce((sum, r) => sum + (r.commAmt || 0), 0);
  const filteredTotalQty = filteredRecords.reduce((sum, r) => sum + (r.qty || 0), 0);

  const handleApplyToInvoice = () => {
    if (filteredRecords.length === 0) return;
    const items = convertParsedRecordsToInvoiceItems(parsedRecords, selectedCustomer);
    onApplyItemsToInvoice(items, selectedCustomer);
    if (onNavigateToBuilder) {
      onNavigateToBuilder();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Import Excel Working Sheet
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Upload your monthly chemical commission spreadsheet to auto-populate the invoice.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportSampleExcelWorkbook}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Blank Template</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSampleStatement}
              className="flex items-center space-x-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Sample Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors shadow-xs ${
          isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => e.target.files && e.target.files[0] && handleFileProcess(e.target.files[0])} 
          accept=".xlsx,.xls,.csv" 
          className="hidden" 
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {fileName ? fileName : 'Click to upload or drag & drop your Excel file'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports <strong>.xlsx</strong>, <strong>.xls</strong>, and <strong>.csv</strong> files
            </p>
          </div>
          {isProcessing && (
            <p className="text-xs text-blue-600 font-semibold animate-pulse">
              Processing spreadsheet...
            </p>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Parsed Data Table */}
      {parsedRecords.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900">
                Parsed Commission Data ({filteredRecords.length} items)
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Total: {formatIndianCurrency(filteredTotalTaxable)} ({filteredTotalQty.toLocaleString()} kg)
              </span>
            </div>

            {/* Filter by Customer */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ALL">All Clients ({customers.length})</option>
                {customers.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Inv # & Date</th>
                  <th className="py-2.5 px-3 text-right">Quantity (kg)</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Commission Rate</th>
                  <th className="py-2.5 px-3 text-right">Taxable Commission (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{rec.customer}</td>
                    <td className="py-2.5 px-3 text-slate-900">{rec.product}</td>
                    <td className="py-2.5 px-3 text-slate-500">{rec.invNo || '-'} {rec.date ? `(${rec.date})` : ''}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900">{rec.qty.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{rec.unitPrice ? `₹${rec.unitPrice}` : '-'}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-blue-700">₹{rec.commPerKg}/kg</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatIndianCurrency(rec.commAmt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Ready to transfer items into your GST Tax Invoice
            </span>

            <button
              type="button"
              onClick={handleApplyToInvoice}
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Apply {filteredRecords.length} Items to Tax Invoice</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
