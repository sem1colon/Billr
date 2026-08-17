import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';
import { BillrLogo } from './BillrLogo';
import { IosInstallModal } from './IosInstallModal';

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
  const [isIosModalOpen, setIsIosModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Detect iOS environment (iPhone, iPad, iPod)
  const isIos = typeof window !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent))
  );

  useEffect(() => {
    // Check if running in standalone mode (PWA installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
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
    if (isIos) {
      setIsIosModalOpen(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setIsIosModalOpen(true);
    }
  };

  const navTabs = [
    { 
      id: 'builder' as ActiveTab, 
      label: 'Invoice Builder', 
      shortLabel: 'Invoice',
      icon: FileText,
      badge: itemsCount > 0 ? itemsCount : undefined
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
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-white/80 text-slate-900 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand Identity */}
            <div className="flex items-center space-x-6 sm:space-x-8">
              <button 
                type="button" 
                onClick={() => setActiveTab('builder')}
                className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl transition-transform active:scale-95"
                title="Billr — Murthy Chemicals"
              >
                <BillrLogo size="md" subtitle="Murthy Chemicals" showSubtitle={true} />
              </button>
            </div>

            {/* Center: Apple Segmented Pill Tabs (Desktop & Tablet) */}
            <nav className="hidden md:flex items-center space-x-1 apple-glass-subtle p-1 rounded-2xl border border-white/90 shadow-xs">
              {navTabs.map((tab) => {
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
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-200/80 text-slate-700'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Clean & Simple Controls */}
            <div className="flex items-center space-x-2">
              
              {/* PWA Install Button (Minimalist Liquid Glass Pill) */}
              {!isInstalled && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-50/80 hover:bg-blue-100/90 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-semibold shadow-2xs backdrop-blur-md transition-all active:scale-95"
                  title="Install Billr on your device"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Install App</span>
                </button>
              )}

              {/* Quick PDF Action (Preview or Builder view) */}
              {onDownloadPdf && activeTab === 'preview' && (
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 apple-btn-primary text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              )}

              {/* Clean Single "··· More Options" Menu Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-2 rounded-xl text-slate-600 hover:text-slate-900 apple-glass-btn transition-all active:scale-95 ${
                    isMenuOpen ? '!bg-white !border-slate-300 shadow-xs' : ''
                  }`}
                  aria-label="More options"
                  title="Settings & utilities"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Popover */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 apple-glass-card rounded-3xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Accessibility Font Size Toggle */}
                    {onToggleLargeText && (
                      <button
                        type="button"
                        onClick={() => {
                          onToggleLargeText();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-slate-100/70 text-slate-700 text-left transition-colors"
                      >
                        <span className="flex items-center space-x-2.5">
                          <Type className="w-4 h-4 text-slate-500" />
                          <span>Large Text Mode (A+)</span>
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
                      className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-slate-100/70 text-slate-700 text-left transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="font-semibold text-slate-900">Load Reference Sample</div>
                        <div className="text-[11px] text-slate-500">Reset to MCA sample statement</div>
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-200/60" />

                    {/* iOS / PWA Guide */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsIosModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-slate-100/70 text-slate-700 text-left transition-colors"
                    >
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-semibold text-slate-900">Install Guide (iPhone & Android)</div>
                        <div className="text-[11px] text-slate-500">Instructions for Home Screen app</div>
                      </div>
                    </button>

                    {/* App Version Info */}
                    <div className="px-3.5 py-2 text-[10px] text-slate-400 border-t border-slate-200/60 mt-1 flex items-center justify-between">
                      <span className="font-semibold">Billr</span>
                      <span className="flex items-center gap-0.5 text-blue-600 font-medium">
                        <Sparkles className="w-3 h-3" /> PWA Ready
                      </span>
                    </div>

                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* iOS / iPhone Installation Guide Sheet */}
      <IosInstallModal
        isOpen={isIosModalOpen}
        onClose={() => setIsIosModalOpen(false)}
      />
    </>
  );
};
