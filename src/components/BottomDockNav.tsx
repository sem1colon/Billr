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
      
      {/* Mobile Liquid Glass Bar (<= 640px) */}
      <div className="sm:hidden pointer-events-auto apple-glass-dock !rounded-t-3xl !rounded-b-none border-t border-white/90 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] pb-safe pt-2.5 px-4 transition-all">
        <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-slate-200/50">
          <div className="flex items-center">
            {currentStepIndex > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center space-x-1 px-3 py-1.5 apple-glass-btn text-slate-800 rounded-xl text-xs font-semibold active:scale-95"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-slate-500 px-2 py-1 bg-slate-100/70 rounded-lg">
                Step 1 of 3
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            {activeTab === 'builder' && (
              <button
                type="button"
                onClick={onOpenAddItemModal}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50/90 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200/80 active:scale-95 transition-transform"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            )}

            {currentStepIndex < TABS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1 px-3.5 py-1.5 apple-btn-primary text-white rounded-xl text-xs font-bold active:scale-95"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onDownloadPdf}
                className="flex items-center space-x-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom tab icons on mobile */}
        <nav className="flex items-center justify-around pt-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1 px-4 rounded-xl text-[10px] font-medium transition-all ${
                  isActive ? 'text-blue-600 font-bold bg-blue-50/60 scale-105' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop / Tablet Floating Liquid Glass Dock Island (> 640px) */}
      <div className="hidden sm:flex justify-center p-4 pb-6">
        <div className="pointer-events-auto relative w-full max-w-3xl apple-glass-dock rounded-3xl p-2.5 transition-all">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Back Button */}
            <div className="flex items-center flex-shrink-0 min-w-[90px]">
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center space-x-1.5 px-3.5 py-2 apple-glass-btn text-slate-700 font-semibold text-xs rounded-2xl active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div className="px-3 py-1.5 text-slate-400 text-xs font-medium bg-slate-100/50 rounded-xl">
                  Step 1 of 3
                </div>
              )}
            </div>

            {/* Center: Tabs */}
            <nav className="flex items-center apple-glass-subtle p-1 rounded-2xl gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-white text-blue-700 shadow-sm font-bold scale-[1.02]' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Next / Download Action */}
            <div className="flex items-center justify-end space-x-2 flex-shrink-0 min-w-[130px]">
              {activeTab === 'builder' && (
                <button
                  type="button"
                  onClick={onOpenAddItemModal}
                  className="flex items-center space-x-1.5 px-3.5 py-2 apple-glass-btn text-slate-800 text-xs font-semibold rounded-2xl active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add Item</span>
                </button>
              )}

              {currentStepIndex < TABS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 px-4 py-2 apple-btn-primary text-white text-xs font-bold rounded-2xl active:scale-95"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs active:scale-95 transition-all"
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
