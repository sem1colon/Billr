import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HeaderNav, ActiveTab } from './components/HeaderNav';
import { BottomDockNav } from './components/BottomDockNav';
import { InvoiceBuilderView } from './components/InvoiceBuilderView';
import { InvoiceLivePreview } from './components/InvoiceLivePreview';
import { BusinessSettingsView } from './components/BusinessSettingsView';
import { ItemFormModal } from './components/ItemFormModal';
import { InvoiceData, InvoiceItem } from './types';
import { initialInvoiceData } from './data/sampleData';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { getDefaultSignatureDataUrl } from './utils/signatureUtils';
import { DeveloperCredit } from './components/DeveloperCredit';

export default function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(initialInvoiceData);
  const [activeTab, setActiveTab] = useState<ActiveTab>('builder');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLargeText, setIsLargeText] = useState(false);

  useEffect(() => {
    // Populate default partner signature if not present
    if (!invoiceData.seller.signatureUrl) {
      const defaultSig = getDefaultSignatureDataUrl();
      if (defaultSig) {
        setInvoiceData(prev => ({
          ...prev,
          showSignature: true,
          seller: {
            ...prev.seller,
            signatureUrl: defaultSig,
          },
        }));
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleOpenAddItemModal = (item?: InvoiceItem) => {
    setEditingItem(item || null);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (item: InvoiceItem) => {
    setInvoiceData(prev => {
      const exists = prev.items.some(i => i.id === item.id);
      let newItems: InvoiceItem[];
      if (exists) {
        newItems = prev.items.map(i => (i.id === item.id ? item : i));
      } else {
        newItems = [...prev.items, item];
      }
      return { ...prev, items: newItems };
    });
    showToast(editingItem ? 'Item updated' : 'Item added to invoice');
  };

  const handleDownloadPdf = () => {
    generateInvoicePDF(invoiceData, false);
    showToast('Tax Invoice PDF downloaded');
  };

  const handleLoadSample = () => {
    setInvoiceData(initialInvoiceData);
    showToast('Loaded reference sample invoice');
  };

  const grandTotal = invoiceData.items.reduce((s, i) => s + (i.commissionAmount || 0), 0) * (1 + (invoiceData.gstRate || 18) / 100);

  return (
    <div className={`relative min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white ${isLargeText ? 'text-base sm:text-lg' : ''}`}>
      
      {/* Ambient Liquid Glass Atmosphere (Floating Orbs) */}
      <div className="ambient-glow-mesh">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
      </div>

      {/* Top Header Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadPdf={handleDownloadPdf}
        onLoadSample={handleLoadSample}
        itemsCount={invoiceData.items.length}
        grandTotal={grandTotal}
        isLargeText={isLargeText}
        onToggleLargeText={() => {
          setIsLargeText(!isLargeText);
        }}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 pb-32 sm:pb-28">
        <AnimatePresence mode="wait">
          {activeTab === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <InvoiceBuilderView
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
                onOpenAddItemModal={handleOpenAddItemModal}
                onNavigateToPreview={() => setActiveTab('preview')}
                onNavigateToSettings={() => setActiveTab('settings')}
              />
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <InvoiceLivePreview
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
                onDownloadPdf={handleDownloadPdf}
                onEditBuilder={() => setActiveTab('builder')}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <BusinessSettingsView
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
                onSaveProfile={() => {
                  showToast('Agency profile saved');
                  setActiveTab('builder');
                }}
                onNavigateToBuilder={() => setActiveTab('builder')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Developer Attribution */}
        <DeveloperCredit variant="inline" className="mt-8" />
      </main>

      {/* Floating Bottom Step Bar */}
      <BottomDockNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddItemModal={() => handleOpenAddItemModal()}
        onDownloadPdf={handleDownloadPdf}
        itemsCount={invoiceData.items.length}
        grandTotal={grandTotal}
      />

      {/* Line Item Modal (Add or Edit) */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        initialItem={editingItem}
      />

      {/* Floating Toast Notification (Liquid Glass Pill) */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 apple-glass-card !bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center space-x-2 border border-white/20 animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
