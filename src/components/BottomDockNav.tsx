import React from 'react';
import { motion } from 'motion/react';
import { 
  FileSpreadsheet,
  FileText, 
  Eye, 
  Building2, 
  Download, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Share2,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomDockNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddItemModal: () => void;
  onDownloadPdf: () => void;
  onGenerateFromSheet?: () => void;
  itemsCount: number;
  grandTotal: number;
}

interface StepTabConfig {
  id: ActiveTab;
  label: string;
  shortLabel: string;
  step: number;
  icon: React.FC<{ className?: string }>;
}

const TABS: StepTabConfig[] = [
  { 
    id: 'sheet', 
    label: '1. Upload Sheet', 
    shortLabel: 'Sheet', 
    step: 1, 
    icon: FileSpreadsheet 
  },
  { 
    id: 'builder', 
    label: '2. Invoice Editor', 
    shortLabel: 'Invoice', 
    step: 2, 
    icon: FileText 
  },
  { 
    id: 'preview', 
    label: '3. Preview & Print', 
    shortLabel: 'Preview', 
    step: 3, 
    icon: Eye 
  },
  { 
    id: 'settings', 
    label: 'Agency Profile', 
    shortLabel: 'Profile', 
    step: 4, 
    icon: Building2 
  },
];

export const BottomDockNav: React.FC<BottomDockNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddItemModal,
  onDownloadPdf,
  onGenerateFromSheet,
  itemsCount,
  grandTotal,
}) => {
  const currentStepIndex = TABS.findIndex(t => t.id === activeTab);

  const handleNext = () => {
    if (activeTab === 'sheet' && onGenerateFromSheet) {
      onGenerateFromSheet();
    } else if (currentStepIndex < 2) {
      setActiveTab(TABS[currentStepIndex + 1].id);
    } else {
      setActiveTab('sheet');
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setActiveTab(TABS[currentStepIndex - 1].id);
    }
  };

  return (
    /* Bottom Dock is strictly for Mobile devices (< 768px / md:hidden).
       On Tablets, iPads & Desktops, navigation is unified in the top header to prevent repetition and overlap. */
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      
      {/* Mobile Solid iOS / Fluent Dock Bar */}
      <div className="pointer-events-auto apple-glass-dock rounded-t-[32px] rounded-b-none border-t border-slate-200/90 shadow-[0_-10px_32px_rgba(15,23,42,0.12)] pb-safe pt-2.5 px-3.5 transition-all bg-white/95 backdrop-blur-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-1.5 border-b border-slate-200/80">
          <div className="flex items-center">
            {currentStepIndex > 0 ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={handlePrev}
                className="flex items-center space-x-1 px-3 py-1.5 apple-glass-btn text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </motion.button>
            ) : (
              <span className="text-xs font-bold text-slate-500 px-3 py-1.5 bg-slate-100/90 rounded-xl">
                Step 1: Upload
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            {activeTab === 'builder' && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={onOpenAddItemModal}
                className="flex min-w-0 items-center space-x-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </motion.button>
            )}

            {activeTab === 'sheet' && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={handleNext}
                className="flex min-w-0 items-center space-x-1.5 px-3 py-2 apple-btn-primary text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
              >
                <span>Generate Invoice</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}

            {activeTab === 'builder' && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveTab('preview')}
                className="flex min-w-0 items-center space-x-1 px-3 py-2 apple-btn-primary text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
              >
                <span>Preview</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}

            {activeTab === 'preview' && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={onDownloadPdf}
                className="flex min-w-0 items-center space-x-1.5 px-3 py-2 apple-btn-emerald text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </motion.button>
            )}

            {activeTab === 'settings' && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveTab('sheet')}
                className="flex min-w-0 items-center space-x-1 px-3 py-2 apple-btn-primary text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
              >
                <span>Go to Sheet</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Bottom tab icons on mobile */}
        <nav className="grid grid-cols-4 items-stretch relative pt-1 pb-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative flex min-w-0 flex-col items-center py-1.5 px-1 rounded-xl text-[11px] font-bold cursor-pointer z-10 select-none transition-colors duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-dock-pill"
                    className="absolute inset-0 bg-blue-50/90 border border-blue-200 rounded-xl -z-10 shadow-2xs"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 35,
                    }}
                  />
                )}
                <Icon className={`w-4 h-4 mb-0.5 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`transition-colors duration-200 ${isActive ? 'text-blue-700 font-extrabold' : 'text-slate-500'}`}>
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

    </div>
  );
};
