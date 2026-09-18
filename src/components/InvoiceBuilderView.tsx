import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  FileSpreadsheet, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  AlertCircle, 
  ReceiptIndianRupee, 
  PenTool, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  BadgeCheck, 
  Eye, 
  ChevronRight, 
  RotateCcw,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { InvoiceData, InvoiceItem, GstType } from '../types';
import { formatIndianCurrency, numberToIndianRupees } from '../utils/numberToWords';
import { calculateInvoiceTotals } from '../utils/invoiceCalculations';
import { SignatureModal } from './SignatureModal';
import { ConfirmDialog } from './ConfirmDialog';

interface InvoiceBuilderViewProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  onOpenAddItemModal: (item?: InvoiceItem) => void;
  onNavigateToPreview: () => void;
  onNavigateToSettings: () => void;
  onNavigateToSheet?: () => void;
}

export const InvoiceBuilderView: React.FC<InvoiceBuilderViewProps> = ({
  invoiceData,
  setInvoiceData,
  onOpenAddItemModal,
  onNavigateToPreview,
  onNavigateToSettings,
  onNavigateToSheet,
}) => {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isClearItemsDialogOpen, setIsClearItemsDialogOpen] = useState(false);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);

  const { taxableValue, cgstAmount, sgstAmount, igstAmount, grandTotal, roundOff } = calculateInvoiceTotals(invoiceData);
  const gstRate = invoiceData.gstRate || 0;
  const totalQtyHandled = invoiceData.items.reduce((sum, item) => sum + (item.qty || 0), 0);

  const amountInWords = numberToIndianRupees(grandTotal);
  const hasInvoiceNumber = invoiceData.invoiceNumber.trim().length > 0;

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
    setIsClearItemsDialogOpen(true);
  };

  const confirmClearAllItems = () => {
    setInvoiceData(prev => ({ ...prev, items: [] }));
    setIsClearItemsDialogOpen(false);
  };

  const handleSetTodayDate = () => {
    const today = new Date().toISOString().split('T')[0];
    setInvoiceData(prev => ({ ...prev, invoiceDate: today }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. Header Banner & Quick Navigation */}
      <div className="apple-glass-card rounded-[28px] p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-700 tracking-wide">
                STEP 2 &bull; INVOICE CUSTOMIZER
              </span>
              <span className="text-xs text-slate-400 font-medium">Rule 46 CGST Compliant</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              Invoice Details & Line Items
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review and adjust invoice parameters, tax classification, and line items.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onNavigateToSheet && (
              <button
                type="button"
                onClick={onNavigateToSheet}
                className="flex items-center space-x-1.5 px-3.5 py-2 apple-glass-btn text-slate-700 rounded-xl text-xs font-semibold active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>Back to Sheet</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateToPreview}
              className="flex items-center space-x-1.5 px-4 py-2 apple-btn-primary text-white rounded-xl text-xs sm:text-sm font-bold active:scale-95 cursor-pointer shadow-md"
            >
              <Eye className="w-4 h-4" />
              <span>Live Preview</span>
            </button>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-5">
          
          {/* Invoice Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceData.invoiceNumber}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              aria-required="true"
              aria-invalid={!hasInvoiceNumber}
              aria-describedby={!hasInvoiceNumber ? 'invoice-number-error' : undefined}
              placeholder="e.g. MCA/2026-27/001"
              className="w-full px-3.5 py-2.5 apple-glass-input text-xs sm:text-sm font-bold text-slate-900 rounded-xl outline-none"
            />
            {!hasInvoiceNumber && <p id="invoice-number-error" className="mt-1 text-[11px] font-semibold text-rose-700">Add an invoice number before exporting.</p>}
          </div>

          {/* Invoice Date */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Invoice Date
              </label>
              <button
                type="button"
                onClick={handleSetTodayDate}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Set Today
              </button>
            </div>
            <input
              type="date"
              value={invoiceData.invoiceDate}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
              className="w-full px-3.5 py-2.5 apple-glass-input text-xs sm:text-sm font-bold text-slate-900 rounded-xl outline-none"
            />
          </div>

          {/* GST Tax Type & Rate */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Tax Classification
            </label>
            <div className="flex items-center space-x-2">
              <select
                value={invoiceData.gstType}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, gstType: e.target.value as GstType }))}
                className="w-2/3 px-3 py-2.5 apple-glass-input text-xs font-bold text-slate-900 rounded-xl outline-none"
              >
                <option value="IGST">Inter-State (IGST)</option>
                <option value="CGST_SGST">Intra-State (CGST+SGST)</option>
              </select>

              <select
                value={invoiceData.gstRate}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, gstRate: Number(e.target.value) }))}
                className="w-1/3 px-2 py-2.5 apple-glass-input text-xs font-bold text-blue-700 rounded-xl outline-none"
              >
                <option value={18}>18%</option>
                <option value={12}>12%</option>
                <option value={5}>5%</option>
                <option value={28}>28%</option>
                <option value={0}>0%</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Parties Info (Seller & Buyer Preview Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Seller Card */}
        <div className="apple-glass-card rounded-[24px] p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Supplier / Agency (Seller)</span>
            </span>
            <button
              type="button"
              onClick={onNavigateToSettings}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Edit in Profile
            </button>
          </div>
          <div className="pt-1">
            <h4 className="text-sm font-bold text-slate-900">{invoiceData.seller.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{invoiceData.seller.address}, {invoiceData.seller.cityStateZip}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-600">
              <span><strong>GSTIN:</strong> {invoiceData.seller.gstin}</span>
              <span>&bull;</span>
              <span><strong>PAN:</strong> {invoiceData.seller.pan}</span>
              <span>&bull;</span>
              <span><strong>Phone:</strong> {invoiceData.seller.phone}</span>
            </div>
          </div>
        </div>

        {/* Buyer Card */}
        <div className="apple-glass-card rounded-[24px] p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Billed To (Buyer / Recipient)</span>
            </span>
            <button
              type="button"
              onClick={onNavigateToSettings}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Edit in Profile
            </button>
          </div>
          <div className="pt-1">
            <h4 className="text-sm font-bold text-slate-900">{invoiceData.buyer.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{invoiceData.buyer.address}, {invoiceData.buyer.cityStateZip}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-600">
              <span><strong>GSTIN:</strong> {invoiceData.buyer.gstin}</span>
              <span>&bull;</span>
              <span><strong>PAN:</strong> {invoiceData.buyer.pan || 'Not provided'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Invoice Line Items Editor */}
      <div className="apple-glass-card rounded-[28px] p-4 sm:p-6 space-y-4 shadow-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Line Items ({invoiceData.items.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Weight: <strong>{totalQtyHandled.toLocaleString()} kg</strong> &bull; Taxable Commission:{' '}
              <strong className="text-blue-700">{formatIndianCurrency(taxableValue)}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {invoiceData.items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllItems}
                className="px-3 py-1.5 apple-glass-btn text-red-600 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Clear All
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenAddItemModal()}
              className="flex items-center space-x-1.5 px-3.5 py-2 apple-btn-primary text-white rounded-xl text-xs font-bold active:scale-95 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Item</span>
            </button>
          </div>
        </div>

        {/* Items List */}
        {invoiceData.items.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No items currently in this invoice.</p>
            {onNavigateToSheet && (
              <button
                type="button"
                onClick={onNavigateToSheet}
                className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Select items from uploaded spreadsheet &rarr;
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {invoiceData.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-200 transition-all shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.description}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500 ml-7">
                      {item.customer && (
                        <>
                          <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            Party: {item.customer}
                          </span>
                          <span>&bull;</span>
                        </>
                      )}
                      <span>HSN/SAC: <strong>{item.hsnSacCode || '998311'}</strong></span>
                      <span>&bull;</span>
                      <span>Qty: <strong>{item.qty.toLocaleString()} {item.unit || 'kg'}</strong></span>
                      {item.unitPrice && (
                        <>
                          <span>&bull;</span>
                          <span>Basic Rate: <strong>₹{item.unitPrice.toLocaleString('en-IN')}</strong></span>
                        </>
                      )}
                      <span>&bull;</span>
                      <span className="text-blue-700 font-bold">Comm Rate: @ ₹{item.commissionRate.toFixed(2)}/{item.unit || 'kg'}</span>
                      {item.invNo && (
                        <>
                          <span>&bull;</span>
                          <span>Inv #{item.invNo} {item.date && `(${item.date})`}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-xs sm:text-sm font-black text-slate-900">
                        {formatIndianCurrency(item.commissionAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400">Taxable Value</div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onOpenAddItemModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                        title="Edit item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateItem(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                        title="Duplicate item"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 4. Financial Breakdown & Payment Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Bank & Signature Settings */}
        <div className="apple-glass-card rounded-[24px] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Payment & signature
              </span>
              <span className="text-xs text-slate-500">Bank details and signing preferences</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPaymentDetailsOpen(prev => !prev)}
              className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold cursor-pointer"
              aria-expanded={isPaymentDetailsOpen}
            >
              <span>{isPaymentDetailsOpen ? 'Hide' : 'Show'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPaymentDetailsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isPaymentDetailsOpen && <div className="space-y-3">
            <div className="text-xs text-slate-600 space-y-1 bg-slate-50/70 p-3 rounded-xl">
              <div><strong>Bank:</strong> {invoiceData.seller.bankName} &bull; {invoiceData.seller.bankBranch}</div>
              <div><strong>Account No:</strong> {invoiceData.seller.accountNo}</div>
              <div><strong>IFSC Code:</strong> {invoiceData.seller.ifscCode}</div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-700">Include Signature on Invoice</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setIsSignatureModalOpen(true)} className="text-xs font-bold text-blue-600 cursor-pointer">
                  Configure
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invoiceData.showSignature !== false}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, showSignature: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>}
        </div>

        {/* Calculation Summary Card */}
        <div className="apple-glass-card rounded-[24px] p-4 sm:p-5 space-y-2.5 bg-gradient-to-br from-white to-blue-50/40">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Tax Computation
          </span>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span>Total Taxable Commission:</span>
              <strong className="text-slate-900">{formatIndianCurrency(taxableValue)}</strong>
            </div>

            {invoiceData.gstType === 'IGST' ? (
              <div className="flex justify-between">
                <span>Integrated GST ({gstRate}%):</span>
                <strong className="text-blue-700">{formatIndianCurrency(igstAmount)}</strong>
              </div>
            ) : (
              <>
                <div className="flex justify-between"><span>CGST ({gstRate / 2}%):</span><strong className="text-blue-700">{formatIndianCurrency(cgstAmount)}</strong></div>
                <div className="flex justify-between"><span>SGST ({gstRate / 2}%):</span><strong className="text-blue-700">{formatIndianCurrency(sgstAmount)}</strong></div>
              </>
            )}

            {invoiceData.roundOff !== 0 && (
              <div className="flex justify-between">
                <span>Round Off:</span>
                <span>{roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-sm font-black text-slate-900">Grand Total Payable:</span>
              <span className="text-lg font-black text-slate-900">{formatIndianCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 italic">
            <strong>Amount in words:</strong> {amountInWords}
          </div>
        </div>

      </div>

      {/* 5. Bottom Navigation CTA */}
      <div className="apple-glass-card rounded-[24px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          All changes are saved in real-time to your device.
        </div>

        <div className="flex items-center space-x-2">
          {onNavigateToSheet && (
            <button
              type="button"
              onClick={onNavigateToSheet}
              className="px-4 py-2.5 apple-glass-btn text-slate-700 rounded-xl text-xs font-bold active:scale-95 cursor-pointer"
            >
              Back to Sheet
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateToPreview}
            disabled={invoiceData.items.length === 0}
            className="px-6 py-2.5 apple-btn-primary text-white rounded-xl text-xs sm:text-sm font-black active:scale-95 cursor-pointer shadow-md flex items-center space-x-1.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            <span>Proceed to Preview & Export</span>
            <ArrowRight className="w-4 h-4" />
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
        onSaveSignature={(signatureDataUrl, showSig) => {
          setInvoiceData(prev => ({
            ...prev,
            showSignature: showSig !== undefined ? showSig : true,
            seller: {
              ...prev.seller,
              signatureUrl: signatureDataUrl,
            },
          }));
          setIsSignatureModalOpen(false);
        }}
      />

      <ConfirmDialog
        isOpen={isClearItemsDialogOpen}
        title="Clear all invoice items?"
        description="Every line item currently in this invoice will be removed. Invoice details and buyer information will remain unchanged."
        confirmLabel="Clear all items"
        onConfirm={confirmClearAllItems}
        onCancel={() => setIsClearItemsDialogOpen(false)}
      />

    </div>
  );
};
