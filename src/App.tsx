import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HeaderNav } from './components/HeaderNav';
import { BottomDockNav } from './components/BottomDockNav';
import { ExcelImportView } from './components/ExcelImportView';
import { InvoiceBuilderView } from './components/InvoiceBuilderView';
import { InvoiceLivePreview } from './components/InvoiceLivePreview';
import { BusinessSettingsView } from './components/BusinessSettingsView';
import { ItemFormModal } from './components/ItemFormModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { InvoiceData, InvoiceItem, ActiveTab, ExcelParsedRecord } from './types';
import { initialInvoiceData, defaultBuyer, sampleInvoiceItems } from './data/sampleData';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { getDefaultSignatureDataUrl } from './utils/signatureUtils';
import { convertParsedRecordsToInvoiceItems } from './utils/excelParser';
import { calculateInvoiceTotals } from './utils/invoiceCalculations';
import { 
  loadSavedInvoiceData, 
  saveInvoiceData, 
  loadSavedActiveTab, 
  saveActiveTab, 
  loadSavedUiPreferences, 
  saveUiPreferences,
  loadSavedSheetRecords,
  getDefaultOrSavedSignature,
  clearSavedInvoiceData,
  clearSavedWorkbookState,
  hasSavedInvoiceData,
} from './utils/storageUtils';

export default function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(() => loadSavedInvoiceData());
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => loadSavedActiveTab());
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLargeText, setIsLargeText] = useState<boolean>(() => loadSavedUiPreferences().isLargeText);
  const [isNewInvoiceDialogOpen, setIsNewInvoiceDialogOpen] = useState(false);
  const [hasShownRestoreNotice, setHasShownRestoreNotice] = useState(false);
  const isInitialMount = useRef(true);

  // Auto-persist invoiceData to localStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!saveInvoiceData(invoiceData)) {
      showToast('Draft save failed. Keep this tab open and check device storage before leaving.');
    }
  }, [invoiceData]);

  useEffect(() => {
    if (!hasShownRestoreNotice && hasSavedInvoiceData()) {
      setHasShownRestoreNotice(true);
      showToast('Draft restored from this device');
    }
  }, [hasShownRestoreNotice]);

  // Auto-persist activeTab to localStorage
  useEffect(() => {
    saveActiveTab(activeTab);
  }, [activeTab]);

  // Auto-persist UI preferences
  useEffect(() => {
    saveUiPreferences({ isLargeText });
  }, [isLargeText]);

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
    showToast(editingItem ? 'Item updated & auto-saved' : 'Item added & auto-saved');
  };

  const handleApplyItemsFromSheet = (items: InvoiceItem[]) => {
    const existingIds = new Set(invoiceData.items.map(item => item.id));
    const newItems = items.filter(item => !existingIds.has(item.id));
    setInvoiceData(prev => {
      return {
        ...prev,
        items: [...prev.items, ...newItems],
      };
    });
    showToast(newItems.length > 0 ? `Added ${newItems.length} new item${newItems.length === 1 ? '' : 's'}; existing edits were preserved` : 'No new rows added; duplicate source rows were skipped');
  };

  const handleStartNewInvoice = () => {
    const freshInvoice: InvoiceData = {
      ...initialInvoiceData,
      seller: { ...initialInvoiceData.seller, signatureUrl: getDefaultOrSavedSignature() },
      buyer: { ...defaultBuyer },
      items: [],
    };
    clearSavedInvoiceData();
    clearSavedWorkbookState();
    setInvoiceData(freshInvoice);
    setIsNewInvoiceDialogOpen(false);
    showToast('Started a new invoice');
  };

  const handleDownloadPdf = () => {
    generateInvoicePDF(invoiceData, false);
    showToast('Tax Invoice PDF downloaded');
  };

  const handleLoadSample = () => {
    const defaultSig = getDefaultOrSavedSignature();
    const freshSample: InvoiceData = {
      ...initialInvoiceData,
      items: sampleInvoiceItems,
      showSignature: true,
      seller: {
        ...initialInvoiceData.seller,
        signatureUrl: defaultSig,
      },
    };
    setInvoiceData(freshSample);
    saveInvoiceData(freshSample);
    showToast('Loaded reference sample invoice');
  };

  const handleGenerateFromSheet = () => {
    const cached = loadSavedSheetRecords();
    if (cached && cached.records && cached.records.length > 0) {
      const items = convertParsedRecordsToInvoiceItems(cached.records, cached.customer);
      handleApplyItemsFromSheet(items);
    }
    setActiveTab('preview');
  };

  const { grandTotal } = calculateInvoiceTotals(invoiceData);

  return (
    <div className={`relative min-h-screen max-w-[100vw] overflow-x-hidden bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white ${isLargeText ? 'text-base sm:text-lg' : ''}`}>
      
      {/* Top Header Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadPdf={handleDownloadPdf}
        itemsCount={invoiceData.items.length}
        grandTotal={grandTotal}
        isLargeText={isLargeText}
        onToggleLargeText={() => {
          setIsLargeText(!isLargeText);
        }}
      />

      <button type="button" onClick={() => setIsNewInvoiceDialogOpen(true)} className="fixed top-3 right-3 z-40 apple-glass-btn rounded-xl px-3 py-2 text-xs font-bold">
        Start new invoice
      </button>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 pb-32 md:pb-12">
        <AnimatePresence mode="wait">
          
          {/* Step 1: Upload Excel / CSV & Working Sheet */}
          {activeTab === 'sheet' && (
            <motion.div
              key="sheet"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <ExcelImportView
                onApplyItemsToInvoice={handleApplyItemsFromSheet}
                onNavigateToPreview={() => setActiveTab('preview')}
                onNavigateToBuilder={() => setActiveTab('builder')}
              />
            </motion.div>
          )}

          {/* Step 2: Invoice Details & Line Items Editor */}
          {activeTab === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <InvoiceBuilderView
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
                onOpenAddItemModal={handleOpenAddItemModal}
                onNavigateToPreview={() => setActiveTab('preview')}
                onNavigateToSettings={() => setActiveTab('settings')}
                onNavigateToSheet={() => setActiveTab('sheet')}
              />
            </motion.div>
          )}

          {/* Step 3: Live Preview & Vector PDF Export */}
          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <InvoiceLivePreview
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
                onDownloadPdf={handleDownloadPdf}
                onEditBuilder={() => setActiveTab('builder')}
              />
            </motion.div>
          )}

          {/* Step 4: Business Settings & Profiles */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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

      </main>

      {/* Floating Bottom Step Bar (Mobile-first for iPhone 17e) */}
      <BottomDockNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddItemModal={() => handleOpenAddItemModal()}
        onDownloadPdf={handleDownloadPdf}
        onGenerateFromSheet={handleGenerateFromSheet}
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

      <ConfirmDialog
        isOpen={isNewInvoiceDialogOpen}
        title="Start a new invoice?"
        description="This removes the saved invoice and workbook draft from this device. Your current invoice items and edits will be cleared."
        confirmLabel="Start new invoice"
        onConfirm={handleStartNewInvoice}
        onCancel={() => setIsNewInvoiceDialogOpen(false)}
      />

      {/* Floating Toast Notification (Apple Liquid Glass Pill) */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 apple-glass-card !bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center space-x-2 border border-white/20 animate-in fade-in slide-in-from-top-3 duration-200" role="status" aria-live="polite">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
