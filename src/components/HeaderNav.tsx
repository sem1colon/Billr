import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Eye, 
  UserCheck, 
  RotateCcw,
  Type,
  Download,
  Smartphone,
  MoreVertical,
  Check,
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';
import { BillrLogo } from './BillrLogo';
import { InstallModal } from './InstallModal';
import { AboutModal } from './AboutModal';

export type ActiveTab = 'builder' | 'preview' | 'settings';

interface HeaderNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onDownloadPdf?: () => void;
  onLoadSample: () => void;
  itemsCount: number;
  grandTotal: number;
  isLargeText?: boolean;
  onToggleLargeText?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  onDownloadPdf,
  onLoadSample,
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
      id: 'builder' as ActiveTab, 
      label: 'Invoice Builder', 
      shortLabel: 'Invoice',
      icon: FileText
    },
    { 
      id: 'preview' as ActiveTab, 
      label: 'Live Preview', 
      shortLabel: 'Preview',
      icon: Eye 
    },
    { 
      id: 'settings' as ActiveTab, 
      label: 'Agency Profile', 
      shortLabel: 'Profile',
      icon: UserCheck 
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/75 backdrop-blur-3xl border-b border-white/90 text-slate-900 shadow-[0_8px_32px_-4px_rgba(30,58,138,0.08)] transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-16">
            
            {/* Left: Brand Identity */}
            <div className="flex items-center flex-shrink-0">
              <motion.button 
                type="button" 
                onClick={() => setActiveTab('builder')}
                whileTap={{ scale: 0.95 }}
                className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl cursor-pointer"
                title="Billr — Tax Invoice Generator"
              >
                <BillrLogo size="md" showSubtitle={false} />
              </motion.button>
            </div>

            {/* Center: Apple iOS 26 Liquid Glass Segmented Sliding Pill (Desktop & Tablet) */}
            <nav className="hidden md:flex items-center relative apple-glass-segmented p-1.5 rounded-2xl flex-shrink-0">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="relative flex items-center space-x-1.5 lg:space-x-2 px-3 lg:px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer z-10 select-none transition-colors duration-200"
                  >
                    {/* Continuous Fluid Sliding Liquid Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="header-liquid-active-pill"
                        className="absolute inset-0 apple-glass-segmented-active rounded-xl -z-10"
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 35,
                        }}
                      />
                    )}

                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className={`transition-colors duration-200 ${isActive ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>
                      <span className="hidden lg:inline">{tab.label}</span>
                      <span className="inline lg:hidden">{tab.shortLabel}</span>
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Controls & Actions */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              
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
                  className="hidden sm:flex items-center space-x-1.5 px-3.5 lg:px-4 py-1.5 apple-btn-primary text-white rounded-xl text-xs font-black transition-all cursor-pointer"
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
                    isMenuOpen ? '!bg-white/95 shadow-sm border-white' : ''
                  }`}
                  aria-label="More options"
                  title="Settings & utilities"
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>

                {/* Dropdown Popover with Liquid Glass Surface */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      className="!absolute right-0 top-[calc(100%+8px)] w-64 max-w-[calc(100vw-2rem)] apple-glass-card !bg-white/98 rounded-3xl p-2.5 z-50 text-xs shadow-2xl border border-white/95 backdrop-blur-3xl"
                    >
                      
                      {/* Accessibility Font Size Toggle */}
                      {onToggleLargeText && (
                        <button
                          type="button"
                          onClick={() => {
                            onToggleLargeText();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-blue-50/70 text-slate-700 text-left transition-colors cursor-pointer"
                        >
                          <span className="flex items-center space-x-2.5">
                            <Type className="w-4 h-4 text-slate-500" />
                            <span className="font-semibold">Large Text Mode (A+)</span>
                          </span>
                          {isLargeText && <Check className="w-4 h-4 text-blue-600 font-bold" />}
                        </button>
                      )}

                      {/* Reset to Reference Sample Invoice */}
                      <button
                        type="button"
                        onClick={() => {
                          onLoadSample();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-blue-50/70 text-slate-700 text-left transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="font-bold text-slate-900">Load Reference Sample</div>
                          <div className="text-[11px] text-slate-500">Reset to MCA sample statement</div>
                        </div>
                      </button>

                      {/* Install Guide (Shown ONLY if not already installed as standalone PWA) */}
                      {!isInstalled && (
                        <>
                          <div className="my-1 border-t border-slate-200/60" />
                          <button
                            type="button"
                            onClick={() => {
                              setIsInstallModalOpen(true);
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-blue-50/70 text-slate-700 text-left transition-colors cursor-pointer"
                          >
                            <Smartphone className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="font-bold text-slate-900">Install App</div>
                              <div className="text-[11px] text-slate-500">Add to Home Screen / PC</div>
                            </div>
                          </button>
                        </>
                      )}

                      <div className="my-1 border-t border-slate-200/60" />

                      {/* About Billr & Developer Dialog */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsAboutModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-blue-50/70 text-slate-700 text-left transition-colors cursor-pointer"
                      >
                        <Info className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-bold text-slate-900">About Billr</div>
                          <div className="text-[11px] text-slate-500">Engine & Developer Credit</div>
                        </div>
                      </button>

                      {/* App Version Info / Installed Status */}
                      <div className="px-3.5 py-2 text-[10px] text-slate-400 border-t border-slate-200/60 mt-1 flex items-center justify-between">
                        <span className="font-semibold">Billr v1.0</span>
                        {isInstalled ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold apple-glass-badge px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Installed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-600 font-semibold apple-glass-badge px-2 py-0.5 rounded-full">
                            <Zap className="w-3 h-3 text-amber-500" /> Offline Ready
                          </span>
                        )}
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Multi-Platform Universal Installation Guide Sheet (Android, iOS & Desktop) */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onTriggerInstall={handleInstallClick}
        isInstalled={isInstalled}
      />

      {/* Discreet Creative About Billr & Developer Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </>
  );
};
