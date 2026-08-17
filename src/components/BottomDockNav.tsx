import React from 'react';
import { 
  FileText, 
  Eye, 
  UserCheck, 
  Download, 
  Plus, 
  ArrowLeft, 
  ArrowRight,
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
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      
      {/* Mobile Bar (<= 640px) */}
      <div className="sm:hidden pointer-events-auto bg-white border-t border-slate-200 shadow-lg pb-[max(env(safe-area-inset-bottom),10px)] pt-2 px-3">
        <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-slate-100">
          <div className="flex items-center">
            {currentStepIndex > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-slate-500 px-2 py-1">
                Step 1 of 3
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            {activeTab === 'builder' && (
              <button
                type="button"
                onClick={onOpenAddItemModal}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            )}

            {currentStepIndex < TABS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onDownloadPdf}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom tab icons on mobile */}
        <nav className="flex items-center justify-around">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop / Tablet Clean Floating Navigation Bar (> 640px) */}
      <div className="hidden sm:flex justify-center p-4">
        <div className="pointer-events-auto relative w-full max-w-3xl bg-white border border-slate-200 shadow-xl rounded-2xl p-2 transition-all">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Back Button */}
            <div className="flex items-center flex-shrink-0 min-w-[100px]">
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div className="px-3 py-2 text-slate-400 text-xs font-medium">
                  Step 1 of 3
                </div>
              )}
            </div>

            {/* Center: Tabs */}
            <nav className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive 
                        ? 'bg-white text-blue-700 shadow-xs font-bold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Next / Download Action */}
            <div className="flex items-center justify-end space-x-2 flex-shrink-0 min-w-[140px]">
              {activeTab === 'builder' && (
                <button
                  type="button"
                  onClick={onOpenAddItemModal}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add Item</span>
                </button>
              )}

              {currentStepIndex < TABS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
