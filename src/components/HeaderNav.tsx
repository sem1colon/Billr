import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  UserCheck, 
  RotateCcw,
  Type,
  Download,
  Smartphone
} from 'lucide-react';
import { BillrLogo } from './BillrLogo';

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
  onLoadSample,
  itemsCount,
  isLargeText = false,
  onToggleLargeText,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (PWA installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
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

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install Billr on your device: Tap your browser menu (⋮ or Share icon) and select "Add to Home Screen" or "Install App".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const navTabs = [
    { 
      id: 'builder' as ActiveTab, 
      label: 'Create Invoice', 
      icon: FileText,
      badge: itemsCount > 0 ? itemsCount : undefined
    },
    { 
      id: 'preview' as ActiveTab, 
      label: 'Preview & Print', 
      icon: Eye 
    },
    { 
      id: 'settings' as ActiveTab, 
      label: 'Agency Profile', 
      icon: UserCheck 
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-6 sm:space-x-8">
            <button 
              type="button" 
              onClick={() => setActiveTab('builder')}
              className="text-left focus:outline-none"
              title="Billr Invoicing"
            >
              <BillrLogo size="md" />
            </button>

            {/* Desktop Navigation Tabs (Streamlined 3-step menu) */}
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Functional Controls */}
          <div className="flex items-center space-x-2">
            
            {/* PWA Install Button */}
            {!isInstalled && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
                title="Install Billr Progressive Web App on your device for instant offline access"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            {/* Readability Text Mode */}
            {onToggleLargeText && (
              <button
                type="button"
                onClick={onToggleLargeText}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isLargeText 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
                title="Toggle large text font"
              >
                <Type className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isLargeText ? 'Standard Font' : 'Large Font'}</span>
                <span className="sm:hidden font-mono font-bold">A+</span>
              </button>
            )}

            {/* Reset / Load Reference Sample */}
            <button
              type="button"
              onClick={onLoadSample}
              title="Reset to reference MCA sample invoice"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset Sample</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
