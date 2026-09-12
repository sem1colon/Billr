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
      
      {/* Mobile Solid iOS Dock Bar */}
      <div className="pointer-events-auto apple-glass-dock !rounded-t-[32px] !rounded-b-none border-t border-slate-200 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] pb-safe pt-2.5 px-4 transition-all bg-white/95">
        <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-slate-200">
          <div className="flex items-center">
            {currentStepIndex > 0 ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={handlePrev}
                className="flex items-center space-x-1 px-3.5 py-2 apple-glass-btn text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </motion.button>
            ) : (
              <span className="text-xs font-bold text-slate-500 px-3 py-1.5 bg-slate-100 rounded-xl">
                Step 1 of 3
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {activeTab === 'builder' && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={onOpenAddItemModal}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </motion.button>
            )}

            {currentStepIndex < TABS.length - 1 ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-5 py-2 apple-btn-primary text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer shadow-md"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={onDownloadPdf}
                className="flex items-center space-x-1.5 px-5 py-2 apple-btn-emerald text-white rounded-xl text-xs sm:text-sm font-black cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Bottom tab icons on mobile */}
        <nav className="flex items-center justify-around relative pt-1 pb-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center py-2 px-4 rounded-xl text-xs font-bold cursor-pointer z-10 select-none transition-colors duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-dock-pill"
                    className="absolute inset-0 bg-blue-50 border border-blue-200 rounded-xl -z-10 shadow-xs"
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 35,
                    }}
                  />
                )}
                <Icon className={`w-5 h-5 mb-1 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className={`transition-colors duration-200 ${isActive ? 'text-blue-700 font-extrabold' : 'text-slate-600'}`}>
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
