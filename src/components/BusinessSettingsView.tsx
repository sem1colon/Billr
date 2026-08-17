import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  CreditCard, 
  RotateCcw, 
  ShieldCheck, 
  Check, 
  PenTool, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { InvoiceData } from '../types';
import { defaultSeller, defaultBuyer } from '../data/sampleData';
import { SignatureModal } from './SignatureModal';
import { getDefaultSignatureDataUrl } from '../utils/signatureUtils';

interface BusinessSettingsViewProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  onSaveProfile?: () => void;
  onNavigateToBuilder?: () => void;
}

export const BusinessSettingsView: React.FC<BusinessSettingsViewProps> = ({
  invoiceData,
  setInvoiceData,
  onSaveProfile,
  onNavigateToBuilder,
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const handleSellerChange = (field: string, value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      seller: { ...prev.seller, [field]: value }
    }));
  };

  const handleBuyerChange = (field: string, value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      buyer: { ...prev.buyer, [field]: value }
    }));
  };

  const handleResetToMCA = () => {
    setInvoiceData(prev => ({
      ...prev,
      seller: {
        ...defaultSeller,
        signatureUrl: prev.seller.signatureUrl || getDefaultSignatureDataUrl(),
      },
      buyer: defaultBuyer,
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Banner with Upgraded Profile Icon & Info */}
      <div className="apple-glass-card rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl apple-btn-primary text-white flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Agency & Client Profiles
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                GST Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              <strong>Seller:</strong> Murthy Chemical Agencies &bull; <strong>Partner:</strong> R.S.N. Murthy
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleResetToMCA}
            className="flex items-center space-x-1.5 px-3.5 py-2 apple-glass-btn text-slate-700 rounded-2xl text-xs font-semibold active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          {onNavigateToBuilder && (
            <button
              type="button"
              onClick={onNavigateToBuilder}
              className="flex items-center space-x-1 px-4 py-2 apple-btn-primary text-white rounded-2xl text-xs font-bold active:scale-95 transition-all"
            >
              <span>Back to Invoice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 rounded-2xl flex items-center space-x-2 text-xs font-semibold shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Profile configuration updated successfully.</span>
        </div>
      )}

      {/* Seller Profile Card */}
      <div className="apple-glass-card rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              1. Seller Agency (Murthy Chemical Agencies)
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Agency Legal Name *
            </label>
            <input
              type="text"
              value={invoiceData.seller.name}
              onChange={(e) => handleSellerChange('name', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Managing Partner Name
            </label>
            <input
              type="text"
              value={invoiceData.seller.partnerName}
              onChange={(e) => handleSellerChange('partnerName', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Contact Phone Number
            </label>
            <input
              type="text"
              value={invoiceData.seller.phone}
              onChange={(e) => handleSellerChange('phone', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Registered Office Address
            </label>
            <input
              type="text"
              value={invoiceData.seller.address}
              onChange={(e) => handleSellerChange('address', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City, State & Pincode
            </label>
            <input
              type="text"
              value={invoiceData.seller.cityStateZip}
              onChange={(e) => handleSellerChange('cityStateZip', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Seller GSTIN
            </label>
            <input
              type="text"
              value={invoiceData.seller.gstin}
              onChange={(e) => handleSellerChange('gstin', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              PAN Number
            </label>
            <input
              type="text"
              value={invoiceData.seller.pan}
              onChange={(e) => handleSellerChange('pan', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>
        </div>

        {/* Banking & Signature */}
        <div className="pt-5 border-t border-slate-200/60 space-y-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Agency Bank Account (for GST Invoices)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bank Name</label>
              <input
                type="text"
                value={invoiceData.seller.bankName}
                onChange={(e) => handleSellerChange('bankName', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 apple-glass-input rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bank Branch</label>
              <input
                type="text"
                value={invoiceData.seller.bankBranch}
                onChange={(e) => handleSellerChange('bankBranch', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 apple-glass-input rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Account Number</label>
              <input
                type="text"
                value={invoiceData.seller.accountNo}
                onChange={(e) => handleSellerChange('accountNo', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 apple-glass-input rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">IFSC Code</label>
              <input
                type="text"
                value={invoiceData.seller.ifscCode}
                onChange={(e) => handleSellerChange('ifscCode', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 apple-glass-input rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Partner Signature Configuration */}
          <div className="p-4 apple-glass-subtle rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-28 bg-white/90 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-2xs">
                {invoiceData.seller.signatureUrl ? (
                  <img 
                    src={invoiceData.seller.signatureUrl} 
                    alt="Partner Signature" 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold">No signature</span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Authorized Partner Signature</span>
                <span className="text-[11px] text-slate-500">Auto-embedded on all official tax invoices.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 apple-glass-btn text-blue-700 rounded-xl text-xs font-bold active:scale-95 self-start sm:self-auto"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Update Signature</span>
            </button>
          </div>
        </div>
      </div>

      {/* Buyer / Client Profile Card */}
      <div className="apple-glass-card rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900">
              2. Client Profile (Praj Industries Limited)
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
            Primary Client
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Client Legal Name
            </label>
            <input
              type="text"
              value={invoiceData.buyer.name}
              onChange={(e) => handleBuyerChange('name', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Billing Office Address
            </label>
            <input
              type="text"
              value={invoiceData.buyer.address}
              onChange={(e) => handleBuyerChange('address', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City, State & Pincode
            </label>
            <input
              type="text"
              value={invoiceData.buyer.cityStateZip}
              onChange={(e) => handleBuyerChange('cityStateZip', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Client / Buyer GSTIN
            </label>
            <input
              type="text"
              value={invoiceData.buyer.gstin}
              onChange={(e) => handleBuyerChange('gstin', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Place of Supply & Delivery Locations
            </label>
            <textarea
              rows={3}
              value={invoiceData.buyer.placeOfSupply}
              onChange={(e) => handleBuyerChange('placeOfSupply', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 apple-glass-input rounded-xl focus:outline-none"
            />
          </div>
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

      {/* Discreet Developer Info */}
      <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-1.5 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Billr Engine</span>
          <span>&bull;</span>
          <span>PWA Ready</span>
        </div>
        <a
          href="https://sem1colon.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 hover:text-blue-600 transition-colors group"
        >
          <span className="font-mono font-bold text-blue-600">;</span>
          <span>Engineered by <strong className="font-semibold group-hover:underline">sem1Colon Inc.</strong></span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

    </div>
  );
};
