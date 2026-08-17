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
  Sparkles
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
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);

  const taxableValue = invoiceData.items.reduce((sum, item) => sum + (item.commissionAmount || 0), 0);
  const totalQty = invoiceData.items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const gstRate = invoiceData.gstRate || 18;
  const gstAmount = Number(((taxableValue * gstRate) / 100).toFixed(2));
  const grandTotal = Number((taxableValue + gstAmount + (invoiceData.roundOff || 0)).toFixed(2));
  const amountInWords = numberToIndianRupees(grandTotal);

  const handlePrint = () => {
    generateInvoicePDF(invoiceData, true);
  };

  const handleCelebrationDownload = () => {
    confetti({
      particleCount: 70,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#0f172a', '#2563eb', '#10b981'],
    });
    onDownloadPdf();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Apple Liquid Glass Action Toolbar */}
      <div className="bg-white/75 backdrop-blur-2xl p-3 sm:p-4 rounded-3xl border border-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.03)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Document Info Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-black text-xs border border-blue-500/20 shadow-2xs">
            INV
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">Tax Invoice Preview</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-700 border border-blue-500/20">
                18% IGST
              </span>
            </div>
            <p className="text-xs text-slate-500">
              No: <strong className="text-slate-800 font-mono">{invoiceData.invoiceNumber}</strong> &bull; Date: <strong className="text-slate-800">{invoiceData.invoiceDate}</strong>
            </p>
          </div>
        </div>

        {/* Center & Right: Zoom & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-black/[0.04] p-1 rounded-2xl border border-black/[0.06]">
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 10, 50))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-1.5 min-w-[2.8rem] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 10, 150))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsSignatureModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 rounded-2xl text-xs font-bold transition-colors border border-blue-500/20"
            title="Configure Partner Signature"
          >
            <PenTool className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Signature</span>
          </button>

          <button
            onClick={onEditBuilder}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-black/[0.04] text-slate-700 rounded-2xl text-xs font-bold transition-colors border border-black/[0.08] shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Edit</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-black/[0.04] text-slate-700 rounded-2xl text-xs font-bold transition-colors border border-black/[0.08] shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print</span>
          </button>

          <button
            onClick={handleCelebrationDownload}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-[0_4px_16px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="w-full overflow-x-auto pb-8 flex justify-center bg-slate-900/[0.04] backdrop-blur-xl p-3 sm:p-8 rounded-3xl border border-white/60">
        <div 
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-200"
        >
          {/* Authentic High-Precision Tax Invoice Document */}
          <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-2xl p-10 font-sans border border-slate-300 rounded-sm relative flex flex-col justify-between">
            
            <div>
              {/* Document Header (Clean, Authentic, No Generic Slogans) */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
                <h1 className="text-xl font-black tracking-wider text-slate-900 uppercase">
                  TAX INVOICE
                </h1>
                <p className="text-[11px] font-semibold text-slate-500 tracking-wide mt-0.5">
                  (ORIGINAL FOR RECIPIENT)
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
                <div className="flex items-center justify-center space-x-4 mt-2 text-xs font-bold text-slate-800">
                  <span>GSTIN: <strong className="font-mono">{invoiceData.seller.gstin}</strong></span>
                  <span>&bull;</span>
                  <span>PAN: <strong className="font-mono">{invoiceData.seller.pan}</strong></span>
                  <span>&bull;</span>
                  <span>Phone: <strong>{invoiceData.seller.phone}</strong></span>
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
                    <p className="font-bold text-slate-900 text-xs mt-1">
                      GSTIN No: {invoiceData.buyer.gstin || 'N/A'}
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
                      <span className="text-slate-500 font-semibold">Date:</span>
                      <span className="font-bold text-slate-900">{invoiceData.invoiceDate}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">Place of Supply:</span>
                      <span className="font-bold text-slate-800 text-[11px]">{invoiceData.buyer.cityStateZip || 'As per Bill'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Tax Category:</span>
                      <span className="font-bold text-slate-900 text-[11px]">
                        IGST {gstRate}%
                      </span>
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
            <div className="pt-4 border-t border-slate-300">
              <div className="flex justify-between items-end">
                <div className="text-[10px] text-slate-500 space-y-1">
                  <p>1. Certified that all particular details are true and correct.</p>
                  <p>2. Subject to Hyderabad Jurisdiction.</p>
                  <p className="text-[9px] text-slate-400 pt-1">Computer Generated Tax Invoice &bull; Murthy Chemical Agencies</p>
                </div>

                {/* Authorized Signatory */}
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900 block uppercase">
                    For {invoiceData.seller.name}
                  </span>

                  <div className="h-16 flex items-center justify-end my-1">
                    {invoiceData.seller.signatureUrl ? (
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

      {/* Standard Bottom Navigation Bar */}
      <div className="bg-white/75 backdrop-blur-2xl p-4 rounded-3xl border border-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onEditBuilder}
          className="flex items-center space-x-2 px-4 py-2.5 bg-black/[0.04] hover:bg-black/[0.08] text-slate-700 text-xs font-bold rounded-2xl transition-all"
        >
          <Edit3 className="w-4 h-4" />
          <span>Back to Edit Line Items</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-black/[0.04] hover:bg-black/[0.08] text-slate-700 text-xs font-bold rounded-2xl transition-all border border-black/[0.06]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          <button
            type="button"
            onClick={handleCelebrationDownload}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-2xl shadow-[0_4px_16px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-all"
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
        seller={invoiceData.seller}
        onSaveSignature={(signatureUrl) => {
          setInvoiceData(prev => ({
            ...prev,
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
