import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HeaderNav } from './components/HeaderNav';
import { BottomDockNav } from './components/BottomDockNav';
import { ExcelImportView } from './components/ExcelImportView';
import { InvoiceBuilderView } from './components/InvoiceBuilderView';
import { InvoiceLivePreview } from './components/InvoiceLivePreview';
import { BusinessSettingsView } from './components/BusinessSettingsView';
import { HomeDashboardView } from './components/HomeDashboardView';
import { ItemFormModal } from './components/ItemFormModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { InvoiceData, InvoiceItem, ActiveTab, ExcelParsedRecord } from './types';
import { initialInvoiceData, defaultBuyer, sampleInvoiceItems } from './data/sampleData';
import { getDefaultSignatureDataUrl } from './utils/signatureUtils';
import { calculateInvoiceTotals } from './utils/invoiceCalculations';
import { validateInvoiceForExport } from './utils/invoiceValidation';
import { 
  loadSavedInvoiceData, 
  saveInvoiceData, 
  loadSavedActiveTab, 
  saveActiveTab, 
  loadSavedUiPreferences, 
  saveUiPreferences,
  loadSavedSheetRecords,
  loadInvoiceHistory,
  saveInvoiceHistoryEntry,
  createLocalBackup,
  clearAllBillrData,
  getLastSavedTimestamp,
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
  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState(() => loadInvoiceHistory());
  const [hasSavedDraft, setHasSavedDraft] = useState(() => hasSavedInvoiceData());
  const [saveStatus, setSaveStatus] = useState<'ready' | 'saving' | 'saved'>('ready');
  const [hasShownRestoreNotice, setHasShownRestoreNotice] = useState(false);
  const isInitialMount = useRef(true);

  // Auto-persist invoiceData to localStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setSaveStatus('saving');
    if (!saveInvoiceData(invoiceData)) {
      setSaveStatus('ready');
      showToast('Draft save failed. Keep this tab open and check device storage before leaving.');
      return;
    }
    setHasSavedDraft(true);
    setSaveStatus('saved');
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
    setInvoiceData(prev => {
      return {
        ...prev,
        items,
      };
    });
    showToast(`Loaded ${items.length} invoice item${items.length === 1 ? '' : 's'} from the selected worksheet`);
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
    setActiveTab('builder');
    setIsNewInvoiceDialogOpen(false);
    showToast('Started a new invoice');
  };

  const handleDownloadPdf = async () => {
    const validation = validateInvoiceForExport(invoiceData);
    if (!validation.isValid) {
      showToast(validation.errors[0]);
      setActiveTab('builder');
      return;
    }
    const { generateInvoicePDF } = await import('./utils/pdfGenerator');
    await generateInvoicePDF(invoiceData, false);
    const historyEntry = {
      id: invoiceData.id,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      total: grandTotal,
      itemCount: invoiceData.items.length,
      savedAt: new Date().toISOString(),
    };
    saveInvoiceHistoryEntry(historyEntry);
    setInvoiceHistory(loadInvoiceHistory());
    showToast('Tax Invoice PDF downloaded');
  };

  const handleLoadSample = () => {
    const defaultSig = getDefaultOrSavedSignature();
    const freshSample: InvoiceData = {
      ...initialInvoiceData,
      invoiceNumber: 'SAMPLE/2026-27/001',
      items: sampleInvoiceItems,
      showSignature: true,
      seller: {
        ...initialInvoiceData.seller,
        signatureUrl: defaultSig,
      },
    };
    setInvoiceData(freshSample);
    saveInvoiceData(freshSample);
    setHasSavedDraft(true);
    setActiveTab('builder');
    showToast('Loaded reference sample invoice');
  };

  const handleExportBackup = () => {
    const blob = new Blob([createLocalBackup()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `billr-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded');
  };

  const handleClearData = () => {
    clearAllBillrData();
    setInvoiceData({
      ...initialInvoiceData,
      seller: { ...initialInvoiceData.seller, signatureUrl: getDefaultOrSavedSignature() },
      buyer: { ...defaultBuyer },
      items: [],
    });
    setInvoiceHistory([]);
    setHasSavedDraft(false);
    setIsClearDataDialogOpen(false);
    setActiveTab('home');
    showToast('Local Billr data cleared');
  };

  const handleGenerateFromSheet = async () => {
    const cached = loadSavedSheetRecords();
    if (cached && cached.records && cached.records.length > 0) {
      const { convertParsedRecordsToInvoiceItems } = await import('./utils/excelParser');
      const items = convertParsedRecordsToInvoiceItems(cached.records, cached.customer);
      handleApplyItemsFromSheet(items);
    }
    setActiveTab('preview');
  };

  const { grandTotal } = calculateInvoiceTotals(invoiceData);

  return (
    <div className={`app-shell relative min-h-screen max-w-[100vw] overflow-x-hidden text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white ${isLargeText ? 'text-base sm:text-lg' : ''}`}>
      
      {/* Top Header Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadPdf={handleDownloadPdf}
        onStartNewInvoice={() => setIsNewInvoiceDialogOpen(true)}
        saveStatus={saveStatus}
        itemsCount={invoiceData.items.length}
        grandTotal={grandTotal}
        isLargeText={isLargeText}
        onToggleLargeText={() => {
          setIsLargeText(!isLargeText);
        }}
      />

      <div className="hidden sm:flex max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3">
        <ol className="flex items-center gap-2 text-[11px] font-bold text-slate-500" aria-label="Invoice workflow progress">
          {[
            { label: 'Create', complete: activeTab !== 'sheet' || invoiceData.items.length > 0 },
            { label: 'Details', complete: activeTab === 'preview' || activeTab === 'settings' },
            { label: 'Review', complete: activeTab === 'preview' },
          ].map((step, index) => (
            <React.Fragment key={step.label}>
              {index > 0 && <span className="text-slate-300" aria-hidden="true">/</span>}
              <li
                className={`inline-flex items-center gap-1 ${step.complete ? 'text-blue-700' : ''}`}
                aria-current={
                  (index === 0 && activeTab === 'sheet') ||
                  (index === 1 && activeTab === 'builder') ||
                  (index === 2 && activeTab === 'preview')
                    ? 'step'
                    : undefined
                }
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded-full border text-[9px] ${step.complete ? 'border-blue-200 bg-blue-50' : 'border-slate-300 bg-white/60'}`}>
                  {step.complete ? '✓' : index + 1}
                </span>
                {step.label}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 pb-32 md:pb-12 mobile-content-safe">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <HomeDashboardView
                invoiceData={invoiceData}
                hasSavedDraft={hasSavedDraft}
                history={invoiceHistory}
                lastSavedTimestamp={getLastSavedTimestamp()}
                onResumeDraft={() => setActiveTab(invoiceData.items.length > 0 ? 'builder' : 'sheet')}
                onStartNewInvoice={() => setIsNewInvoiceDialogOpen(true)}
                onImport={() => setActiveTab('sheet')}
                onLoadSample={handleLoadSample}
                onExportBackup={handleExportBackup}
                onClearData={() => setIsClearDataDialogOpen(true)}
              />
            </motion.div>
          )}
          
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

      <ConfirmDialog
        isOpen={isClearDataDialogOpen}
        title="Clear local Billr data?"
        description="This removes drafts, invoice history, uploaded workbook data, signatures, and preferences from this browser. Download a backup first if you may need them later."
        confirmLabel="Clear local data"
        onConfirm={handleClearData}
        onCancel={() => setIsClearDataDialogOpen(false)}
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
