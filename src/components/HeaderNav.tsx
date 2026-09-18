import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet,
  FileText, 
  Eye, 
  UserCheck, 
  Type,
  Download,
  Smartphone,
  MoreVertical,
  Check,
  Info,
  Building2,
  Plus,
  Home
} from 'lucide-react';
import { BillrLogo } from './BillrLogo';
import { InstallModal } from './InstallModal';
import { AboutModal } from './AboutModal';
import type { ActiveTab } from '../types';

export type { ActiveTab };

interface HeaderNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onDownloadPdf?: () => void;
  onStartNewInvoice?: () => void;
  saveStatus?: 'ready' | 'saving' | 'saved';
  itemsCount: number;
  grandTotal: number;
  isLargeText?: boolean;
  onToggleLargeText?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  onDownloadPdf,
  onStartNewInvoice,
  saveStatus = 'ready',
  itemsCount,
  isLargeText = false,
  onToggleLargeText,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if running in standalone mode (PWA installed on iOS/Android/Desktop)
    const isStandalone = 
      typeof window !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true
      );
    
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    }
    // Open the universal multi-platform install modal
    setIsInstallModalOpen(true);
  };

  const navTabs = [
    {
      id: 'home' as ActiveTab,
      label: 'Home',
      shortLabel: 'Home',
      icon: Home
    },
    { 
      id: 'sheet' as ActiveTab, 
      label: 'Create',
      shortLabel: 'Create',
      icon: FileSpreadsheet
    },
    { 
      id: 'builder' as ActiveTab, 
      label: 'Details',
      shortLabel: 'Details',
      icon: FileText
    },
    { 
      id: 'preview' as ActiveTab, 
      label: 'Preview', 
      shortLabel: 'Preview',
      icon: Eye 
    },
    { 
      id: 'settings' as ActiveTab, 
      label: 'Profile', 
      shortLabel: 'Profile',
      icon: Building2 
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 text-slate-900 shadow-xs transition-all pt-safe">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-16">
            
            {/* Left: Brand Identity */}
            <div className="flex items-center flex-shrink-0">
              <motion.button 
                type="button" 
                onClick={() => setActiveTab('sheet')}
                whileTap={{ scale: 0.96 }}
                className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl cursor-pointer"
                title="Billr — Excel to Tax Invoice"
              >
                <BillrLogo size="md" showSubtitle={false} />
              </motion.button>
            </div>

            {/* Center: Fluid UI Segmented Sliding Pill (Desktop & Tablet / iPad) */}
            <nav className="hidden md:flex items-center relative apple-glass-segmented p-1 rounded-2xl flex-shrink-0">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="relative flex items-center space-x-1.5 lg:space-x-2 px-3 lg:px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer z-10 select-none transition-colors duration-200"
                  >
                    {/* Fluid Active Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="header-liquid-active-pill"
                        className="absolute inset-0 apple-glass-segmented-active rounded-xl -z-10 shadow-xs"
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 35,
                        }}
                      />
                    )}

                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className={`transition-colors duration-200 ${isActive ? 'text-blue-700 font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}>
                      <span className="hidden lg:inline">{tab.label}</span>
                      <span className="inline lg:hidden">{tab.shortLabel}</span>
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Controls & Actions */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500" role="status" aria-live="polite">
                <span className={`h-1.5 w-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : saveStatus === 'saved' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                {saveStatus === 'saving' ? 'Saving' : saveStatus === 'saved' ? 'Saved locally' : 'Draft ready'}
              </span>
              
              {/* PWA Install Button (Hidden when already installed) */}
              {!isInstalled && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInstallClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 apple-glass-btn text-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Install Billr on your Android, iPhone, or PC"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Install App</span>
                  <span className="inline sm:hidden">Install</span>
                </motion.button>
              )}

              {/* Quick PDF Action */}
              {onDownloadPdf && activeTab === 'preview' && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={onDownloadPdf}
                  className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 apple-btn-primary text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </motion.button>
              )}

              {/* Clean Single "··· More Options" Menu Dropdown */}
              <div className="relative" ref={menuRef}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-2 rounded-xl text-slate-600 hover:text-slate-900 apple-glass-btn transition-all cursor-pointer ${
                    isMenuOpen ? '!bg-white shadow-sm border-slate-300' : ''
                  }`}
                  aria-label="More options"
                  title="Settings & utilities"
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>

                {/* Dropdown Popover */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      className="!absolute right-0 top-[calc(100%+8px)] w-64 max-w-[calc(100vw-2rem)] apple-glass-card rounded-2xl p-2 z-50 text-xs shadow-xl border border-slate-200 backdrop-blur-2xl"
                    >
                      
                      {/* Accessibility Font Size Toggle */}
                      {onToggleLargeText && (
                        <button
                          type="button"
                          onClick={() => {
                            onToggleLargeText();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-50/70 text-slate-700 text-left transition-colors cursor-pointer"
                        >
                          <span className="flex items-center space-x-2.5">
                            <Type className="w-4 h-4 text-slate-500" />
                            <span className="font-semibold">Large text</span>
                          </span>
                          {isLargeText && <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />}
                        </button>
                      )}

                      {/* Go to Settings */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('settings');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-blue-50/70 text-slate-700 text-left transition-colors cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold">Profile</span>
                      </button>

                      {onStartNewInvoice && (
                        <button
                          type="button"
                          onClick={() => {
                            onStartNewInvoice();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-blue-50/70 text-slate-700 text-left transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-slate-500" />
                          <span className="font-semibold">Start new invoice</span>
                        </button>
                      )}

                      <div className="my-1 border-t border-slate-200/80" />

                      {/* About / Help */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsAboutModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-blue-50/70 text-slate-700 text-left transition-colors cursor-pointer"
                      >
                        <Info className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold">About</span>
                      </button>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Universal Install Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </>
  );
};
