import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText,
  Building2,
  Check,
  Edit3,
  PenTool,
  ReceiptIndianRupee,
  Copy,
  CheckCircle2,
  Sparkles,
  Share2,
  Calendar,
  Layers,
  Scale
} from 'lucide-react';
import { InvoiceData } from '../types';
import { formatIndianCurrency, numberToIndianRupees } from '../utils/numberToWords';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { SignatureModal } from './SignatureModal';
import confetti from 'canvas-confetti';

interface InvoiceLivePreviewProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  onDownloadPdf: () => void;
  onEditBuilder: () => void;
}

export const InvoiceLivePreview: React.FC<InvoiceLivePreviewProps> = ({
  invoiceData,
  setInvoiceData,
  onDownloadPdf,
  onEditBuilder,
}) => {
  const getDefaultZoom = () => {
    if (typeof window === 'undefined') return 100;
    if (window.innerWidth < 640) {
      const fitScale = Math.floor(((window.innerWidth - 24) / 794) * 100);
      return Math.max(Math.min(fitScale, 60), 44);
    }
    if (window.innerWidth < 880) return 80;
    return 100;
  };

  const [zoomLevel, setZoomLevel] = useState<number>(getDefaultZoom);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const taxableValue = invoiceData.items.reduce((sum, item) => sum + (item.commissionAmount || 0), 0);
  const totalQty = invoiceData.items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const gstRate = invoiceData.gstRate || 18;
  const gstAmount = Number(((taxableValue * gstRate) / 100).toFixed(2));
  const grandTotal = Number((taxableValue + gstAmount + (invoiceData.roundOff || 0)).toFixed(2));
  const amountInWords = numberToIndianRupees(grandTotal);

  const isSigned = Boolean(invoiceData.showSignature !== false && invoiceData.seller?.signatureUrl);

  const handlePrint = () => {
    generateInvoicePDF(invoiceData, true);
  };

  const handleCelebrationDownload = () => {
    confetti({
      particleCount: 75,
      spread: 55,
      origin: { y: 0.8 },
      colors: ['#0f172a', '#2563eb', '#10b981', '#6366f1'],
    });
    onDownloadPdf();
  };

  const handleCopyInvoiceNumber = async () => {
    try {
      await navigator.clipboard.writeText(invoiceData.invoiceNumber);
      setCopiedText('number');
      setTimeout(() => setCopiedText(null), 2500);
    } catch (err) {
      console.error('Failed to copy invoice number:', err);
    }
  };

  const handleCopySummary = async () => {
    try {
      const summaryText = `📄 TAX INVOICE: ${invoiceData.invoiceNumber}
📅 Date: ${invoiceData.invoiceDate}
🏢 Supplier: ${invoiceData.seller.name} (GSTIN: ${invoiceData.seller.gstin})
🏢 Recipient: ${invoiceData.buyer.name} (GSTIN: ${invoiceData.buyer.gstin})
📦 Items: ${invoiceData.items.length} lines (${totalQty.toLocaleString()} kg)
💰 Taxable Value: ₹${taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
📊 IGST (${gstRate}%): ₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
💵 Grand Total: ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

      await navigator.clipboard.writeText(summaryText);
      setCopiedText('summary');
      setTimeout(() => setCopiedText(null), 3000);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 max-w-5xl mx-auto">
      
      {/* Top Apple Liquid Glass Action Toolbar */}
      <div className="apple-glass-card p-4 sm:p-5 rounded-[28px] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Document Info Badge & Metadata */}
        <div className="flex items-start sm:items-center space-x-3.5">
          
          {/* Luminous Sapphire Liquid Glass Document Emblem */}
          <div className="relative group/emblem flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(37,99,235,0.32)] border border-white/40 backdrop-blur-xl relative overflow-hidden transition-transform duration-200 group-hover/emblem:scale-105">
              {/* Refractive Specular Glaze */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />
              <ReceiptIndianRupee className="w-6 h-6 text-white drop-shadow-xs relative z-10" strokeWidth={2.4} />
            </div>
            
            {/* Live Render State Glow Dot */}
            <span 
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs" 
              title="GST Validated Live Document"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          {/* Detailed Document Spec & Status Badges */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-sm font-black text-slate-900 tracking-tight">
                Tax Invoice Preview
              </span>
              
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold apple-glass-badge text-blue-700 shadow-2xs">
                {gstRate}% IGST Interstate
              </span>

              {/* Interactive Signature Status Pill */}
              <button
                type="button"
                onClick={() => setIsSignatureModalOpen(true)}
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer shadow-2xs active:scale-95 ${
                  isSigned 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
                title={isSigned ? 'Partner Signature Active (Click to edit)' : 'No signature attached (Click to add)'}
              >
                {isSigned ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span>Signed</span>
                  </>
                ) : (
                  <>
                    <PenTool className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    <span>Add Sign</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick interactive meta details: Click to copy Invoice No. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <button
                type="button"
                onClick={handleCopyInvoiceNumber}
                className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 hover:text-blue-700 bg-white/80 hover:bg-white px-2 py-0.5 rounded-md border border-slate-200/80 transition-colors cursor-pointer group shadow-2xs"
                title="Click to copy Invoice Number"
              >
                <span>No: {invoiceData.invoiceNumber}</span>
                {copiedText === 'number' ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                )}
              </button>

              <span className="inline-flex items-center gap-1 text-slate-600">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Date: <strong className="text-slate-800">{invoiceData.invoiceDate}</strong></span>
              </span>

              <span className="hidden sm:inline-block text-slate-400">&bull;</span>

              <span className="hidden sm:inline-flex items-center gap-1 text-slate-600">
                <span>To: <strong className="text-slate-800 truncate max-w-[140px] md:max-w-[200px]">{invoiceData.buyer.name || 'PRAJ INDUSTRIES'}</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* Center & Right: Quick Financial Preview & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 justify-between sm:justify-end">
          
          {/* Live Financial Tag */}
          <div className="hidden xl:flex flex-col items-end pr-2 border-r border-slate-200/70 mr-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grand Total</span>
            <span className="text-sm font-black text-blue-900 tracking-tight">
              {formatIndianCurrency(grandTotal)}
            </span>
          </div>

          {/* Zoom Controls Segment */}
          <div className="flex items-center space-x-1 apple-glass-segmented p-1 rounded-2xl shadow-2xs">
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 10, 50))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-colors active:scale-95 cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setZoomLevel(100)}
              className="text-xs font-bold text-slate-700 px-2 py-0.5 rounded-lg hover:bg-white/80 transition-colors min-w-[2.8rem] text-center cursor-pointer"
              title="Reset to 100%"
            >
              {zoomLevel}%
            </button>

            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 10, 150))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-colors active:scale-95 cursor-pointer"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setZoomLevel(getDefaultZoom())}
              className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-white/80 rounded-xl transition-colors active:scale-95 cursor-pointer"
              title="Fit to Window"
              aria-label="Fit to Window"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fast Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center space-x-1.5 px-3 py-2 apple-glass-btn text-slate-700 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Copy formatted invoice summary to clipboard"
            >
              {copiedText === 'summary' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 apple-glass-btn text-blue-700 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Configure Partner Signature"
            >
              <PenTool className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Signature</span>
            </button>

            <button
              type="button"
              onClick={onEditBuilder}
              className="flex items-center space-x-1.5 px-3 py-2 apple-glass-btn text-slate-700 rounded-2xl text-xs font-bold active:scale-95 cursor-pointer"
              title="Edit Invoice Details & Line Items"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden md:flex items-center space-x-1.5 px-3 py-2 apple-glass-btn text-slate-700 rounded-2xl text-xs font-bold active:scale-95 cursor-pointer"
              title="Print Tax Invoice"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleCelebrationDownload}
              className="flex items-center space-x-1.5 px-4 py-2 apple-btn-primary text-white rounded-2xl text-xs font-black active:scale-95 cursor-pointer shadow-md"
              title="Download Tax Invoice PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* A4 Sheet Container with Liquid Glass Frame */}
      <div className="w-full max-w-full overflow-x-auto pb-8 flex justify-center apple-glass-subtle p-2 sm:p-6 md:p-8 rounded-[32px]">
        <div 
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-200"
        >
          {/* Authentic High-Precision Tax Invoice Document */}
          <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-2xl p-10 font-sans border border-slate-300 rounded-sm relative flex flex-col justify-between">
            
            <div>
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
                <h1 className="text-xl font-black tracking-wider text-slate-900 uppercase">
                  GST TAX INVOICE
                </h1>
                <p className="text-[11px] font-semibold text-slate-500 tracking-wide mt-0.5">
                  (ORIGINAL FOR RECIPIENT &bull; RULE 46 OF CGST RULES, 2017)
                </p>
              </div>

              {/* Seller & Header Info */}
              <div className="text-center mb-5 pb-4 border-b border-slate-200">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {invoiceData.seller.name}
                </h2>
                <p className="text-xs text-slate-700 mt-1 max-w-lg mx-auto leading-relaxed">
                  {invoiceData.seller.address}, {invoiceData.seller.cityStateZip}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/90 rounded-md text-xs border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">State</span>
                    <span className="font-bold text-slate-900">Telangana (36)</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/90 rounded-md text-xs border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GSTIN</span>
                    <span className="font-mono font-bold text-slate-900">{invoiceData.seller.gstin}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/90 rounded-md text-xs border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PAN</span>
                    <span className="font-mono font-bold text-slate-900">{invoiceData.seller.pan}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/90 rounded-md text-xs border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone</span>
                    <span className="font-bold text-slate-900">{invoiceData.seller.phone}</span>
                  </div>
                </div>
              </div>

              {/* Buyer & Invoice Specs Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                {/* Left: Buyer Details */}
                <div className="border border-slate-300 rounded p-3 bg-slate-50/60 space-y-2">
                  <div>
                    <span className="font-extrabold text-slate-900 text-[11px] block uppercase tracking-wider">
                      Details of Receiver / Billed To:
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">
                      {invoiceData.buyer.name}
                    </h3>
                    <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                      {invoiceData.buyer.address}, {invoiceData.buyer.cityStateZip}
                    </p>
                    <p className="font-bold text-slate-900 text-xs mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>GSTIN: {invoiceData.buyer.gstin || 'N/A'}</span>
                      {invoiceData.buyer.pan && <span className="text-slate-700">PAN: {invoiceData.buyer.pan}</span>}
                    </p>
                  </div>

                  {invoiceData.buyer.placeOfSupply && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-extrabold text-slate-900 text-[10px] block uppercase tracking-wider">
                        Place of Supply / Service
                      </span>
                      <p className="text-slate-600 text-[10px] whitespace-pre-line leading-snug mt-0.5">
                        {invoiceData.buyer.placeOfSupply}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Invoice Specs Box */}
                <div className="border border-slate-300 rounded p-3 bg-slate-50/60 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">INVOICE No.:</span>
                      <span className="font-bold text-slate-900 font-mono text-xs">{invoiceData.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">Invoice Date:</span>
                      <span className="font-bold text-slate-900">{invoiceData.invoiceDate}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">Place of Supply:</span>
                      <span className="font-bold text-slate-800 text-[11px]">Maharashtra (Code: 27)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">Supply Category:</span>
                      <span className="font-bold text-slate-900 text-[11px]">
                        Inter-State (IGST {gstRate}%)
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">SAC / Service Code:</span>
                      <span className="font-bold text-slate-900 text-[11px]">998311</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Reverse Charge (RCM):</span>
                      <span className="font-bold text-slate-900 text-[11px]">No</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table with Quantity, Unit Price & Commission */}
              <div className="border border-slate-300 rounded overflow-hidden mb-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[11px]">
                      <th className="py-2.5 px-2 text-center border-r border-slate-700 w-8">#</th>
                      <th className="py-2.5 px-3 border-r border-slate-700">Description of Services & Products</th>
                      <th className="py-2.5 px-2 text-center border-r border-slate-700 w-20">HSN/SAC</th>
                      <th className="py-2.5 px-2 text-right border-r border-slate-700 w-20">Quantity</th>
                      <th className="py-2.5 px-2 text-right border-r border-slate-700 w-24">Unit Price</th>
                      <th className="py-2.5 px-2 text-right border-r border-slate-700 w-24">Comm. Rate</th>
                      <th className="py-2.5 px-3 text-right w-28">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {invoiceData.items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-2 text-center border-r border-slate-200 text-slate-500 text-[11px]">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-medium text-slate-900">
                          <span>{item.description}</span>
                          {(item.invNo || item.date) && (
                            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                              {item.invNo ? `(Inv #${item.invNo}` : ''}{item.date ? ` dt ${item.date})` : item.invNo ? ')' : ''}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center border-r border-slate-200 font-mono text-[11px] text-slate-600">
                          {item.hsnSacCode || '998311'}
                        </td>
                        <td className="py-2.5 px-2 text-right border-r border-slate-200 font-semibold text-slate-900">
                          {item.qty.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">{item.unit || 'kg'}</span>
                        </td>
                        <td className="py-2.5 px-2 text-right border-r border-slate-200 text-slate-700 font-mono text-[11px]">
                          {item.unitPrice ? `₹${item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right border-r border-slate-200 text-blue-900 font-bold font-mono text-[11px]">
                          {item.commissionRate ? `₹${item.commissionRate.toFixed(2)}/${item.unit || 'kg'}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {item.commissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    {invoiceData.items.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                          No line items added.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100/80 font-bold text-xs border-t border-slate-300">
                      <td colSpan={3} className="py-2 px-3 text-right border-r border-slate-300 text-slate-600">
                        Total Quantity Handled:
                      </td>
                      <td className="py-2 px-2 text-right border-r border-slate-300 font-bold text-slate-900">
                        {totalQty.toLocaleString()} kg
                      </td>
                      <td colSpan={2} className="py-2 px-3 text-right border-r border-slate-300 text-slate-600">
                        Total Taxable Commission:
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Tax Computation & Breakdown */}
              <div className="grid grid-cols-12 gap-4 mb-4">
                {/* Left: Bank Details */}
                <div className="col-span-7 border border-slate-300 rounded p-3 bg-slate-50/50 space-y-1.5 text-xs">
                  <span className="font-extrabold text-slate-900 text-[11px] block uppercase tracking-wider">
                    Bank Account Details for Payment:
                  </span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500">Bank Name:</span>
                      <strong className="block text-slate-900">{invoiceData.seller.bankName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Branch:</span>
                      <strong className="block text-slate-900">{invoiceData.seller.bankBranch}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Current A/C No:</span>
                      <strong className="block text-slate-900 font-mono">{invoiceData.seller.accountNo}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">RTGS/NEFT IFSC:</span>
                      <strong className="block text-slate-900 font-mono">{invoiceData.seller.ifscCode}</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 pt-1 border-t border-slate-200">
                    {invoiceData.seller.notes}
                  </p>
                </div>

                {/* Right: Tax Breakdown */}
                <div className="col-span-5 border border-slate-300 rounded p-3 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-600 font-semibold">Total Taxable Value:</span>
                    <span className="font-bold text-slate-900">
                      ₹{taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-600 font-semibold">Integrated GST ({gstRate}%):</span>
                    <span className="font-bold text-slate-900">
                      ₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {invoiceData.roundOff !== 0 && (
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-600">Round Off:</span>
                      <span className="font-bold text-slate-900">₹{invoiceData.roundOff.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 text-sm font-extrabold text-slate-900">
                    <span>Grand Total:</span>
                    <span className="text-blue-900">
                      ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount in Words */}
              <div className="p-2.5 bg-slate-100/90 rounded border border-slate-300 mb-6 text-xs">
                <span className="font-bold text-slate-700">Total Amount in Words (INR): </span>
                <span className="font-extrabold text-slate-900">{amountInWords}</span>
              </div>
            </div>

            {/* Document Footer with Signature */}
            <div className="pt-6 border-t border-slate-300">
              <div className="flex justify-between items-end">
                <div className="text-[10px] text-slate-400">
                  {/* Clean minimal footer */}
                </div>

                {/* Authorized Signatory */}
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900 block uppercase">
                    For {invoiceData.seller.name}
                  </span>

                  <div className="h-16 flex items-center justify-end my-1">
                    {invoiceData.showSignature !== false && invoiceData.seller.signatureUrl ? (
                      <img 
                        src={invoiceData.seller.signatureUrl} 
                        alt="Authorized Partner Signature" 
                        referrerPolicy="no-referrer"
                        className="h-14 max-w-[170px] object-contain"
                      />
                    ) : (
                      <div className="h-12 w-36 border border-dashed border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400">
                        Signature on file
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-900 block">
                    (Partner / Authorised Signatory)
                  </span>
                  <span className="text-[10px] text-slate-600 block">
                    {invoiceData.seller.partnerName}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Standard Bottom Navigation Bar with Apple Liquid Glass */}
      <div className="apple-glass-card p-4 rounded-[28px] flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onEditBuilder}
          className="flex items-center space-x-2 px-4 py-2.5 apple-glass-btn text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Back to Edit Line Items</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2.5 apple-glass-btn text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          <button
            type="button"
            onClick={handleCelebrationDownload}
            className="flex items-center space-x-2 px-5 py-2.5 apple-btn-primary text-white text-xs font-black rounded-2xl active:scale-[0.98] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Tax Invoice PDF ({formatIndianCurrency(grandTotal)})</span>
          </button>
        </div>
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        currentSignatureUrl={invoiceData.seller.signatureUrl}
        showSignature={invoiceData.showSignature}
        partnerName={invoiceData.seller.partnerName}
        onSaveSignature={(signatureUrl, showSig) => {
          setInvoiceData(prev => ({
            ...prev,
            showSignature: showSig,
            seller: {
              ...prev.seller,
              signatureUrl,
            }
          }));
        }}
      />

    </div>
  );
};
