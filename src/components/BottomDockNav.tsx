import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Eye, 
  UserCheck, 
  Download, 
  Plus, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ActiveTab } from './HeaderNav';

interface BottomDockNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddItemModal: () => void;
  onDownloadPdf: () => void;
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
    id: 'builder', 
    label: '1. Create Invoice', 
    shortLabel: 'Invoice', 
    step: 1, 
    icon: FileText 
  },
  { 
    id: 'preview', 
    label: '2. Preview & Print', 
    shortLabel: 'Preview', 
    step: 2, 
    icon: Eye 
  },
  { 
    id: 'settings', 
    label: '3. Agency Profile', 
    shortLabel: 'Profile', 
    step: 3, 
    icon: UserCheck 
  },
];

export const BottomDockNav: React.FC<BottomDockNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddItemModal,
  onDownloadPdf,
}) => {
  const currentStepIndex = TABS.findIndex(t => t.id === activeTab);

  const handleNext = () => {
    if (currentStepIndex < TABS.length - 1) {
      setActiveTab(TABS[currentStepIndex + 1].id);
    } else {
      setActiveTab('builder');
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
      
      {/* Mobile Liquid Glass Bar */}
      <div className="pointer-events-auto apple-glass-dock !rounded-t-[32px] !rounded-b-none border-t border-white/95 shadow-[0_-12px_40px_rgba(15,23,42,0.12)] pb-safe pt-2.5 px-4 transition-all">
        <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-slate-200/50">
          <div className="flex items-center">
            {currentStepIndex > 0 ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={handlePrev}
                className="flex items-center space-x-1 px-3 py-1.5 apple-glass-btn text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </motion.button>
            ) : (
              <span className="text-[11px] font-bold text-slate-500 px-2.5 py-1 apple-glass-subtle rounded-lg">
                Step 1 of 3
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            {activeTab === 'builder' && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={onOpenAddItemModal}
                className="flex items-center space-x-1 px-3.5 py-1.5 apple-glass-btn text-blue-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </motion.button>
            )}

            {currentStepIndex < TABS.length - 1 ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={handleNext}
                className="flex items-center space-x-1 px-4 py-1.5 apple-btn-primary text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={onDownloadPdf}
                className="flex items-center space-x-1 px-4 py-1.5 apple-btn-emerald text-white rounded-xl text-xs font-black cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Bottom tab icons on mobile with sliding liquid glass pill */}
        <nav className="flex items-center justify-around relative pt-0.5 pb-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center py-1.5 px-5 rounded-xl text-[10px] font-semibold cursor-pointer z-10 select-none transition-colors duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-dock-liquid-pill"
                    className="absolute inset-0 apple-glass-segmented-active rounded-xl -z-10 shadow-xs"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 35,
                    }}
                  />
                )}
                <Icon className={`w-4 h-4 mb-0.5 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className={`transition-colors duration-200 ${isActive ? 'text-blue-700 font-bold' : 'text-slate-500'}`}>
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
