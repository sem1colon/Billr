import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share, 
  PlusSquare, 
  X, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  MoreVertical, 
  Download,
  Check,
  Zap,
  HardDrive,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';
import { BillrLogo } from './BillrLogo';

export type PlatformType = 'android' | 'ios' | 'desktop';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onTriggerInstall?: () => void;
  isInstalled?: boolean;
}

export const InstallModal: React.FC<InstallModalProps> = ({ 
  isOpen, 
  onClose,
  deferredPrompt,
  onTriggerInstall,
  isInstalled: isInstalledProp
}) => {
  // Detect current platform accurately
  const getDetectedPlatform = (): PlatformType => {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua))) {
      return 'ios';
    }
    if (/android/i.test(ua)) {
      return 'android';
    }
    return 'desktop';
  };

  const [activePlatform, setActivePlatform] = useState<PlatformType>('desktop');
  const [showOtherPlatforms, setShowOtherPlatforms] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const detected = getDetectedPlatform();
      setActivePlatform(detected);
      setShowOtherPlatforms(false);
      
      const standalone = 
        isInstalledProp ||
        (typeof window !== 'undefined' && (
          window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true
        ));
      setIsStandalone(Boolean(standalone));
    }
  }, [isOpen, isInstalledProp]);

  const handleOneClickInstall = async () => {
    if (onTriggerInstall) {
      onTriggerInstall();
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        onClose();
      }
    }
  };

  const platformLabels: Record<PlatformType, { name: string; device: string; icon: React.FC<{ className?: string }> }> = {
    ios: { name: 'iPhone / iPad', device: 'iOS Safari', icon: Smartphone },
    android: { name: 'Android', device: 'Google Chrome', icon: Smartphone },
    desktop: { name: 'Desktop / PC', device: 'Chrome / Edge / Safari', icon: Monitor },
  };

  const detectedPlatform = getDetectedPlatform();
  const ActiveIcon = platformLabels[activePlatform].icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-md transition-opacity"
          />

          {/* Universal Liquid Glass Install Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg apple-glass-card rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-white/95 overflow-hidden z-10 pb-6 pt-5 px-6 max-h-[92vh] flex flex-col"
          >
            {/* Grabber bar on mobile */}
            <div className="w-12 h-1.5 bg-slate-300/80 rounded-full mx-auto mb-3 sm:hidden" />

            {/* Close Button in Top-Right */}
            <button
              type="button"
              onClick={onClose}
              className="!absolute top-4.5 right-4.5 w-8 h-8 rounded-full apple-glass-btn flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors active:scale-95 cursor-pointer z-20"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-200/50 pr-8">
              <div className="flex items-center space-x-3">
                <BillrLogo size="sm" showSubtitle={false} />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    {isStandalone ? 'Billr App' : 'Install Billr'}
                    <span className="text-[10px] font-bold px-2.5 py-0.5 apple-glass-badge text-blue-700 rounded-full">
                      {isStandalone ? 'Installed' : 'Offline Ready'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isStandalone ? 'Running locally in standalone PWA mode' : 'Fast, private tax billing on your home screen'}
                  </p>
                </div>
              </div>
            </div>

            {/* === SCENARIO A: ALREADY INSTALLED STATE === */}
            {isStandalone ? (
              <div className="mt-5 space-y-4 text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    App is Already Installed!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Billr is currently running in standalone PWA mode with instant vector PDF generation and zero cloud data storage.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 px-4 apple-btn-primary text-white font-bold text-xs rounded-2xl active:scale-95 transition-all cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              /* === SCENARIO B: SMART DETECTED DEVICE INSTRUCTIONS === */
              <>
                {/* Detected Device Badge */}
                <div className="mt-4 flex items-center justify-between p-3 rounded-2xl apple-glass-subtle">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-xl bg-blue-100/90 text-blue-700 flex items-center justify-center">
                      <ActiveIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Target Device
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {platformLabels[activePlatform].name} ({platformLabels[activePlatform].device})
                      </span>
                    </div>
                  </div>

                  {/* Switch Platform Dropdown Link */}
                  <button
                    type="button"
                    onClick={() => setShowOtherPlatforms(!showOtherPlatforms)}
                    className="flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    <span>Change</span>
                    {showOtherPlatforms ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Optional Secondary Platform Selector (Shown only if user clicks 'Change') */}
                {showOtherPlatforms && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2.5 flex items-center relative apple-glass-segmented p-1 rounded-2xl gap-1"
                  >
                    {(['ios', 'android', 'desktop'] as PlatformType[]).map((p) => {
                      const Icon = platformLabels[p].icon;
                      const isSelected = activePlatform === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setActivePlatform(p)}
                          className="relative flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer z-10 select-none transition-colors duration-200"
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="install-platform-liquid-pill"
                              className="absolute inset-0 apple-glass-segmented-active rounded-xl -z-10"
                              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                            />
                          )}
                          <Icon className={`w-3 h-3 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                          <span className={`${isSelected ? 'text-blue-700 font-bold' : 'text-slate-600'}`}>
                            {platformLabels[p].name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}

                {/* Platform-Specific Instructions Body */}
                <div className="mt-3.5 space-y-2.5 overflow-y-auto pr-0.5">
                  
                  {/* === PLATFORM 1: iOS / iPHONE / iPAD INSTRUCTIONS === */}
                  {activePlatform === 'ios' && (
                    <div className="space-y-2.5 animate-in fade-in duration-150">
                      {/* Step 1 */}
                      <div className="flex items-start space-x-3.5 p-3 rounded-2xl apple-glass-subtle">
                        <div className="w-7 h-7 rounded-xl apple-btn-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-xs">
                          1
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="text-slate-900 font-semibold mb-0.5 flex items-center gap-1.5">
                            Tap the <span className="font-bold text-blue-700">Share</span> icon
                            <span className="inline-flex items-center justify-center p-1 bg-white/90 border border-slate-200 rounded-md shadow-xs">
                              <Share className="w-3.5 h-3.5 text-blue-600" />
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            Located in the Safari bottom toolbar on iPhone (or top bar on iPad).
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-start space-x-3.5 p-3 rounded-2xl apple-glass-subtle">
                        <div className="w-7 h-7 rounded-xl apple-btn-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-xs">
                          2
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="text-slate-900 font-semibold mb-0.5 flex items-center gap-1.5">
                            Tap <span className="font-bold text-slate-900">"Add to Home Screen"</span>
                            <span className="inline-flex items-center justify-center p-1 bg-white/90 border border-slate-200 rounded-md shadow-xs">
                              <PlusSquare className="w-3.5 h-3.5 text-slate-800" />
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            Scroll down the iOS share sheet list and select "Add to Home Screen".
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-start space-x-3.5 p-3 rounded-2xl apple-glass-subtle">
                        <div className="w-7 h-7 rounded-xl apple-btn-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-xs">
                          3
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="text-slate-900 font-semibold mb-0.5 flex items-center gap-1.5">
                            Tap <span className="font-bold text-blue-700">"Add"</span> in the top right
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            Billr appears on your iPhone / iPad Home Screen as a native app!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* === PLATFORM 2: ANDROID INSTRUCTIONS === */}
                  {activePlatform === 'android' && (
                    <div className="space-y-2.5 animate-in fade-in duration-150">
                      {/* One-Click Direct Install Button if supported */}
                      {deferredPrompt && (
                        <button
                          type="button"
                          onClick={handleOneClickInstall}
                          className="w-full flex items-center justify-center space-x-2 py-3 px-4 apple-btn-primary text-white font-bold text-xs rounded-2xl active:scale-95 transition-all shadow-md cursor-pointer mb-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Install Billr on this Android Device Now</span>
                        </button>
                      )}

                      {/* Step 1 */}
                      <div className="flex items-start space-x-3.5 p-3 rounded-2xl apple-glass-subtle">
                        <div className="w-7 h-7 rounded-xl apple-btn-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-xs">
                          1
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="text-slate-900 font-semibold mb-0.5 flex items-center gap-1.5">
                            Tap the <span className="font-bold text-slate-900">Menu (⋮)</span> button
                            <span className="inline-flex items-center justify-center p-1 bg-white/90 border border-slate-200 rounded-md shadow-xs">
                              <MoreVertical className="w-3.5 h-3.5 text-slate-700" />
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            Located in the top-right corner of Google Chrome or browser bar.
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-start space-x-3.5 p-3 rounded-2xl apple-glass-subtle">
                        <div className="w-7 h-7 rounded-xl apple-btn-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-xs">
                          2
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="text-slate-900 font-semibold mb-0.5 flex items-center gap-1.5">
                            Tap <span className="font-bold text-blue-700">"Install app"</span> or <span className="font-bold text-slate-900">"Add to Home screen"</span>
                            <Download className="w-3.5 h-3.5 text-blue-600 inline" />
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            Look for the download or phone icon in the Chrome options menu.
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-start space-x-3.5 p-3 rounded-2xl apple-glass-subtle">
                        <div className="w-7 h-7 rounded-xl apple-btn-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-xs">
                          3
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="text-slate-900 font-semibold mb-0.5 flex items-center gap-1.5">
                            Confirm <span className="font-bold text-blue-700">"Install"</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            Billr is installed to your Android home screen & app drawer!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* === PLATFORM 3: DESKTOP / PC / MAC INSTRUCTIONS === */}
                  {activePlatform === 'desktop' && (
                    <div className="space-y-2.5 animate-in fade-in duration-150">
                      {/* One-Click Direct Install Button if supported */}
                      {deferredPrompt && (
                        <button
                          type="button"
                          onClick={handleOneClickInstall}
                          className="w-full flex items-center justify-center space-x-2 py-3 px-4 apple-btn-primary text-white font-bold text-xs rounded-2xl active:scale-95 transition-all shadow-md cursor-pointer mb-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Install Desktop App Now</span>
                        </button>
                      )}

                      {/* Step 1 */}
                      <div className="flex items-start space-x-3.5 p-3 rounded-2xl apple-glass-subtle">
                        <div className="w-7 h-7 rounded-xl apple-btn-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-xs">
                          1
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="text-slate-900 font-semibold mb-0.5 flex items-center gap-1.5">
                            Click the <span className="font-bold text-blue-700">Install</span> icon in URL Bar
                            <Download className="w-3.5 h-3.5 text-blue-600 inline" />
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            In Chrome, Edge, or Brave, look for the computer/download icon on the right side of the address bar.
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-start space-x-3.5 p-3 rounded-2xl apple-glass-subtle">
                        <div className="w-7 h-7 rounded-xl apple-btn-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-xs">
                          2
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="text-slate-900 font-semibold mb-0.5 flex items-center gap-1.5">
                            Click <span className="font-bold text-blue-700">"Install"</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            Billr opens in its own window, with keyboard shortcuts and desktop dock access.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Universal PWA Feature Highlights */}
                <div className="mt-3.5 pt-3 border-t border-slate-200/50 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>Works 100% Offline</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Zero Cloud Storage</span>
                  </span>
                </div>

                {/* Action Footer */}
                <div className="mt-3.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 px-4 apple-glass-btn text-slate-800 font-bold text-xs rounded-2xl active:scale-95 transition-all cursor-pointer"
                  >
                    Got It
                  </button>
                </div>
              </>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
