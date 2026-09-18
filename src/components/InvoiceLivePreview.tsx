import { calculateInvoiceTotals, gstLabel } from '../utils/invoiceCalculations';
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
  Share2,
  Calendar,
  Layers,
  Scale
} from 'lucide-react';
import { InvoiceData, InvoiceItem } from '../types';
import { formatIndianCurrency, numberToIndianRupees } from '../utils/numberToWords';
import { validateInvoiceForExport } from '../utils/invoiceValidation';
import {
  formatInvoiceAmount,
  formatInvoiceDate,
  formatInvoiceQuantity,
  getInvoicePricingMeta,
  getInvoiceItemMeta,
  getInvoiceProductName,
  getInvoicePlaceOfSupply,
} from '../utils/invoiceFormatting';
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
  const [isSharing, setIsSharing] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { taxableValue, gstAmount, grandTotal, roundOff } = calculateInvoiceTotals(invoiceData);
  const totalQty = invoiceData.items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const gstRate = invoiceData.gstRate || 0;
  const amountInWords = numberToIndianRupees(grandTotal);

  const isSigned = Boolean(invoiceData.showSignature !== false && invoiceData.seller?.signatureUrl);

  const handlePrint = async () => {
    const validation = validateInvoiceForExport(invoiceData);
    if (!validation.isValid) {
      setExportError(validation.errors[0]);
      return;
    }
    try {
      const { generateInvoicePDF } = await import('../utils/pdfGenerator');
      await generateInvoicePDF(invoiceData, true);
    } catch (error) {
      console.error('Print export failed:', error);
      setExportError('PDF export failed. Please try again.');
    }
  };

  const handleNativeShare = async () => {
    const validation = validateInvoiceForExport(invoiceData);
    if (!validation.isValid) {
      setExportError(validation.errors[0]);
      return;
    }
    setIsSharing(true);
    try {
      const { shareInvoicePDF } = await import('../utils/pdfGenerator');
      await shareInvoicePDF(invoiceData);
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#0f172a', '#2563eb', '#10b981'],
      });
    } catch (err) {
      console.error('Share failed:', err);
      setExportError('PDF sharing failed. The download button is still available.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCelebrationDownload = () => {
    setExportError(null);
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
📅 Date: ${formatInvoiceDate(invoiceData.invoiceDate)}
🏢 Supplier: ${invoiceData.seller.name} (GSTIN: ${invoiceData.seller.gstin})
🏢 Recipient: ${invoiceData.buyer.name} (GSTIN: ${invoiceData.buyer.gstin})
📦 Items: ${invoiceData.items.length} lines (${totalQty.toLocaleString()} kg)
💰 Taxable Value: ₹${taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
📊 ${gstLabel(invoiceData.gstType, gstRate)}: ₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-xs"
              title="Live invoice preview"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          {/* Detailed Document Spec & Status Badges */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-sm font-black text-slate-900 tracking-tight">
                Review & share invoice
              </span>
              
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold apple-glass-badge text-blue-700 shadow-2xs">
                {gstLabel(invoiceData.gstType, gstRate)}
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
                <span>Date: <strong className="text-slate-800">{formatInvoiceDate(invoiceData.invoiceDate)}</strong></span>
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={isSharing}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
              title="Share PDF via WhatsApp / AirDrop / Mail"
            >
              <Share2 className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Share PDF</span>
                <span className="sm:hidden">Share</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 apple-glass-btn text-blue-700 rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
              title="Configure Partner Signature"
            >
              <PenTool className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Signature</span>
            </button>

            <button
              type="button"
              onClick={onEditBuilder}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 apple-glass-btn text-slate-700 rounded-2xl text-xs sm:text-sm font-bold active:scale-95 cursor-pointer"
              title="Edit Invoice Details & Line Items"
            >
              <Edit3 className="w-4 h-4 text-slate-600" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden md:flex items-center space-x-1.5 px-3.5 py-2.5 apple-glass-btn text-slate-700 rounded-2xl text-xs sm:text-sm font-bold active:scale-95 cursor-pointer"
              title="Print Tax Invoice"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleCelebrationDownload}
              className="hidden sm:flex items-center space-x-2 px-4 sm:px-5 py-2.5 apple-btn-primary text-white rounded-2xl text-xs sm:text-sm font-black active:scale-95 cursor-pointer shadow-md"
              title="Download Tax Invoice PDF"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {exportError && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs font-semibold text-amber-900" role="alert">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
          <span>{exportError} Update the invoice details, then try again.</span>
        </div>
      )}

      {/* A4 Sheet Container with Liquid Glass Frame */}
      <div className="w-full max-w-full overflow-x-auto pb-8 flex justify-center apple-glass-subtle p-2 sm:p-6 md:p-8 rounded-[32px]">
        <div 
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-200"
        >
          {/* Authentic High-Precision Tax Invoice Document Matching Reference Exactly */}
          <div className="invoice-document w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-2xl p-6 border-2 border-slate-900 rounded-none relative flex flex-col justify-between [font-family:Arial,Helvetica,sans-serif] [font-variant-numeric:tabular-nums]">
            
            <div>
              {/* 1. Top Shaded Header Banner */}
              <div className="bg-[#0f172a] border border-slate-900 py-2 text-center">
                <h1 className="text-sm font-black tracking-widest text-white uppercase">
                  TAX INVOICE
                </h1>
              </div>

              {/* 2. Seller Agency Banner */}
              <div className="border-x border-b border-slate-900 bg-slate-50 px-3 py-3 text-center">
                <h2 className="mt-1 text-xl font-black uppercase leading-tight tracking-tight text-slate-950">
                  {invoiceData.seller.name || 'MURTHY CHEMICAL AGENCIES'}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-800">
                  {invoiceData.seller.address || 'Flat No. 104, Rukmini Apartment, Yousufguda Check Post'}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-800">
                  {invoiceData.seller.cityStateZip || 'Hyderabad-500045.'}
                </p>
                <p className="mt-0.5 text-xs font-semibold leading-relaxed text-slate-800">
                  Partner: {invoiceData.seller.partnerName || 'R.S.N.MURTHY'} <span className="text-slate-400">|</span> Ph: {invoiceData.seller.phone || '9849187125'}
                </p>
                <p className="mt-1.5 text-xs font-black leading-relaxed tracking-wide text-slate-950">
                  GSTIN No : {invoiceData.seller.gstin || '36ABXFM3174B1Z1'} &nbsp;&nbsp; PAN Number : {invoiceData.seller.pan || 'ABXFM3174B'}
                </p>
              </div>

              {/* 3. Three-Column Parties & Metadata Grid */}
              <div className="grid grid-cols-12 border-x border-b border-slate-900 text-xs bg-white">
                
                {/* Column 1: Billed To */}
                <div className="col-span-5 p-2.5 border-r border-slate-900 flex flex-col justify-between items-start text-left">
                  <div className="w-full">
                    <span className="block border-l-2 border-blue-600 pl-2 font-bold text-[11px] uppercase tracking-wide text-slate-900">
                      BILLED TO
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs mt-1 uppercase leading-tight">
                      {invoiceData.buyer.name || 'PRAJ INDUSTRIES LIMITED'}
                    </h3>
                    <p className="text-slate-800 text-[11px] mt-1 leading-relaxed">
                      {invoiceData.buyer.address}, {invoiceData.buyer.cityStateZip}
                    </p>
                  </div>
                  <p className="font-bold text-slate-900 text-[11px] mt-2 leading-relaxed">
                    GSTIN: {invoiceData.buyer.gstin || '27AAACP6090Q1ZS'}
                  </p>
                </div>

                {/* Column 2: Place of Supply / Service */}
                <div className="col-span-4 p-2.5 border-r border-slate-900 text-left">
                  <span className="font-bold text-slate-900 text-[11px] block tracking-wide uppercase">
                    Place of Supply / Service:
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs mt-1 uppercase leading-tight">
                    {invoiceData.buyer.name || 'Buyer'}
                  </h4>
                  <p className="text-slate-800 text-[11px] mt-1 whitespace-pre-line leading-relaxed">
                    {getInvoicePlaceOfSupply(invoiceData.buyer.name, invoiceData.buyer.placeOfSupply) || "PE's Manufacturing, 402/403/1098\nAt Pirangut, Urawade, Tal: Mulshi, Dist: Pune - 412108."}
                  </p>
                </div>

                {/* Column 3: INVOICE No. & DATE Stacked Boxes */}
                <div className="col-span-3 h-full border-l border-slate-900 bg-white">
                  <div className="grid h-full grid-rows-2">
                    <div className="flex flex-col justify-center border-b border-slate-900 bg-slate-50 px-2 py-1.5 text-left">
                      <span className="border-l-2 border-blue-600 pl-1.5 font-black text-slate-700 text-[10px] tracking-wide uppercase leading-none">
                        INVOICE No.
                      </span>
                      <span className="font-black text-slate-950 text-xs mt-1 font-mono leading-none break-all">
                        {invoiceData.invoiceNumber || 'Invoice number'}
                      </span>
                    </div>

                    <div className="flex flex-col justify-center bg-slate-50 px-2 py-1.5 text-left">
                      <span className="border-l-2 border-blue-600 pl-1.5 font-black text-slate-700 text-[10px] tracking-wide uppercase leading-none">
                        DATE
                      </span>
                      <span className="font-black text-slate-950 text-xs mt-1 leading-none">
                        {formatInvoiceDate(invoiceData.invoiceDate)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 4. Line Items Table with Customer Groupings matching reference */}
              <div className="border-x border-b border-slate-900 overflow-hidden">
                  <table className="w-full table-fixed text-left text-xs border-collapse align-middle">
                  <thead>
                    <tr className="bg-[#0f172a] text-white font-bold border-b border-slate-900 text-[11px] align-middle">
                      <th className="py-2 px-2.5 border-r border-slate-900 w-[48%] text-left align-middle">Description of Services</th>
                      <th className="py-2 px-2 text-center border-r border-slate-900 w-[14%] align-middle">HSN/SAC</th>
                      <th className="py-2 px-2 text-center border-r border-slate-900 w-[14%] align-middle">Qty</th>
                      <th className="py-2 px-2.5 text-right w-[24%] align-middle">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-slate-900 align-middle">
                    {(() => {
                      // Group items by Customer
                      const groups: { customer: string; items: InvoiceItem[] }[] = [];
                      invoiceData.items.forEach(item => {
                        const custName = item.customer || 'General Items';
                        let g = groups.find(x => x.customer === custName);
                        if (!g) {
                          g = { customer: custName, items: [] };
                          groups.push(g);
                        }
                        g.items.push(item);
                      });

                      if (invoiceData.items.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                              No line items added.
                            </td>
                          </tr>
                        );
                      }

                      return groups.map(group => (
                        <React.Fragment key={group.customer}>
                          {/* Customer Group Header Row */}
                          {group.customer && group.customer !== 'General Items' && (
                            <tr className="bg-slate-100 border-t border-b border-slate-400 font-bold">
                              <td colSpan={4} className="py-1.5 px-2.5 text-[10px] font-black uppercase tracking-[0.08em] text-slate-800">
                                <span className="mr-2 text-slate-500">CUSTOMER</span>
                                <span className="text-slate-400">|</span>
                                <span className="ml-2">{group.customer}</span>
                              </td>
                            </tr>
                          )}

                          {/* Line items for this customer */}
                          {group.items.map(item => {
                            return (
                              <tr key={item.id} className="hover:bg-slate-50 align-middle">
                                <td className="py-1.5 pl-5 pr-2.5 border-r border-slate-900 text-slate-900 text-[11px] leading-relaxed text-left align-top">
                                  <span className="block font-semibold text-left">{getInvoiceProductName(item)}</span>
                                  <span className="block text-[10px] text-slate-600 mt-0.5 text-left">
                                    {getInvoiceItemMeta(item)}
                                  </span>
                                  <span className="block text-[10px] font-semibold text-slate-700 mt-0.5 text-left">
                                    {getInvoicePricingMeta(item)}
                                  </span>
                                </td>
                                <td className="py-1.5 px-2 text-center border-r border-slate-900 text-slate-900 font-mono text-[11px] align-middle">
                                  {item.hsnSacCode || '998311'}
                                </td>
                                <td className="py-1.5 px-2 text-center border-r border-slate-900 text-slate-900 text-[11px] align-middle">
                                  {formatInvoiceQuantity(item)}
                                </td>
                                <td className="py-1.5 px-2.5 text-right font-medium text-slate-900 text-[11px] align-middle">
                                  {formatInvoiceAmount(item.commissionAmount)}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ));
                    })()}

                    {/* Summary Calculation Rows inside Table */}
                    <tr className="border-t-2 border-slate-900 font-bold bg-white">
                      <td colSpan={3} className="py-1.5 px-2.5 border-r border-slate-900 text-right font-bold text-slate-900 text-xs">
                        Taxable Value
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-bold text-slate-900 text-xs">
                        {formatInvoiceAmount(taxableValue)}
                      </td>
                    </tr>

                    <tr className="border-t border-slate-900 font-bold bg-slate-50">
                      <td colSpan={3} className="py-1.5 px-2.5 border-r border-slate-900 text-right font-bold text-slate-900 text-xs">
                        ADD: {gstLabel(invoiceData.gstType, gstRate)}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-bold text-slate-900 text-xs">
                        {formatInvoiceAmount(gstAmount)}
                      </td>
                    </tr>

                    {roundOff !== 0 && (
                      <tr className="border-t border-slate-900 font-bold bg-white">
                        <td colSpan={3} className="py-1.5 px-2.5 border-r border-slate-900 text-right font-bold text-slate-900 text-xs">Round Off</td>
                        <td className="py-1.5 px-2.5 text-right font-bold text-slate-900 text-xs">{formatInvoiceAmount(roundOff)}</td>
                      </tr>
                    )}

                    <tr className="border-t-2 border-slate-900 font-bold bg-blue-50">
                      <td colSpan={3} className="py-2 px-2.5 border-r border-slate-900 text-right font-black text-slate-900 text-xs">
                        Total
                      </td>
                      <td className="py-2 px-2.5 text-right font-black text-blue-950 text-xs">
                        {formatInvoiceAmount(grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 5. Amount in Words Box */}
              <div className="border-x border-b border-slate-900 p-2.5 text-left bg-blue-50">
                <span className="text-slate-700 text-[10px] font-black block tracking-[0.12em] uppercase">Amount Chargeable (in words)</span>
                <span className="font-black text-slate-950 text-xs mt-1 block leading-relaxed">
                  {amountInWords}
                </span>
              </div>

              {/* 6. Bottom Split Box: Bank Details (Left) and Signatory (Right) */}
              <div className="grid border-x border-b border-slate-900 text-xs bg-white" style={{ gridTemplateColumns: '65% 35%' }}>
                
                {/* Left: Bank Details and PAN */}
                <div className="p-3 border-r border-slate-900 space-y-1 text-left" style={{ gridColumn: '1' }}>
                  <p className="font-bold text-slate-900 text-[10px] uppercase tracking-wide pb-0.5">
                    Bank Details
                  </p>
                  <p className="font-bold text-slate-900 text-[11px] leading-relaxed">
                    COMPANY PAN: {invoiceData.seller.pan || 'ABXFM3174B'}
                  </p>
                  <p className="font-bold text-slate-900 text-[11px] pt-1 leading-relaxed">
                    Cheques payable to "{invoiceData.seller.name || 'MURTHY CHEMICAL AGENCIES'}"
                  </p>
                  <p className="text-slate-900 text-[11px] pt-0.5 leading-relaxed">
                    {invoiceData.seller.bankName || 'HDFC BANK'}, {invoiceData.seller.bankBranch || 'SANJEVAREDDYNAGAR, HYDERABAD-500038.'}
                  </p>
                  <p className="font-bold text-slate-900 text-[11px] leading-relaxed">
                    A/C NO. {invoiceData.seller.accountNo || '50200084425696'}
                  </p>
                  <p className="font-bold text-slate-900 text-[11px] leading-relaxed">
                    IFSC CODE: {invoiceData.seller.ifscCode || 'HDFC0000642'}
                  </p>
                </div>

                {/* Right: Authorized Signatory */}
                <div className="p-3 flex flex-col justify-between text-center items-center bg-slate-50" style={{ gridColumn: '2' }}>
                  <span className="font-bold text-slate-900 text-[11px] block uppercase leading-relaxed text-right">
                    For {invoiceData.seller.name || 'MURTHY CHEMICAL AGENCIES'}
                  </span>

                  <div className="h-14 flex items-center justify-end my-1">
                    {invoiceData.showSignature !== false && invoiceData.seller.signatureUrl ? (
                      <img 
                        src={invoiceData.seller.signatureUrl} 
                        alt="Authorized Partner Signature" 
                        referrerPolicy="no-referrer"
                        className="h-12 max-w-[150px] object-contain"
                      />
                    ) : (
                      <div className="h-10 w-28 border border-dashed border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400">
                        Signature on file
                      </div>
                    )}
                  </div>

                  <span className="font-black text-slate-900 text-[11px] block uppercase tracking-wide">
                    Partner
                  </span>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Standard Bottom Navigation Bar with Clean Solid iOS Surface */}
      <div className="apple-glass-card p-4 rounded-[28px] flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onEditBuilder}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 apple-glass-btn text-slate-700 text-sm font-bold rounded-2xl transition-all cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Back to Edit Line Items</span>
        </button>

        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end space-x-2.5">
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-sm font-bold rounded-2xl transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={handleCelebrationDownload}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 apple-btn-primary text-white text-sm font-black rounded-2xl active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
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
