import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share, PlusSquare, X, CheckCircle2, Sparkles, Smartphone } from 'lucide-react';
import { BillrLogo } from './BillrLogo';

interface IosInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IosInstallModal: React.FC<IosInstallModalProps> = ({ isOpen, onClose }) => {
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* iOS Install Bottom Sheet / Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 pb-6 pt-5 px-6"
          >
            {/* Grabber bar on mobile */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <BillrLogo size="sm" showSubtitle={false} />
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    Install Billr on iPhone
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                      iOS App
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add to your Home Screen for instant offline GST invoicing
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step-by-Step iOS Safari Instructions */}
            <div className="mt-5 space-y-3">
              {/* Step 1 */}
              <div className="flex items-start space-x-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-xs">
                  1
                </div>
                <div className="flex-1 text-xs">
                  <div className="text-slate-900 font-semibold mb-0.5 flex items-center gap-1">
                    Tap the <span className="font-bold text-blue-600">Share</span> button
                    <span className="inline-flex items-center justify-center p-1 bg-white border border-slate-200 rounded-md shadow-xs">
                      <Share className="w-3.5 h-3.5 text-blue-600" />
                    </span>
                  </div>
                  <p className="text-slate-500">
                    Located in the Safari bottom toolbar on iPhone (or top right on iPad).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-xs">
                  2
                </div>
                <div className="flex-1 text-xs">
                  <div className="text-slate-900 font-semibold mb-0.5 flex items-center gap-1">
                    Select <span className="font-bold text-slate-900">"Add to Home Screen"</span>
                    <span className="inline-flex items-center justify-center p-1 bg-white border border-slate-200 rounded-md shadow-xs">
                      <PlusSquare className="w-3.5 h-3.5 text-slate-800" />
                    </span>
                  </div>
                  <p className="text-slate-500">
                    Scroll down the share sheet options and tap "Add to Home Screen".
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-xs">
                  3
                </div>
                <div className="flex-1 text-xs">
                  <div className="text-slate-900 font-semibold mb-0.5 flex items-center gap-1">
                    Tap <span className="font-bold text-blue-600">"Add"</span> in the top right
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 inline ml-1" />
                  </div>
                  <p className="text-slate-500">
                    Billr will appear on your iPhone Home Screen with its app icon.
                  </p>
                </div>
              </div>
            </div>

            {/* Key iOS PWA Features */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Full-screen standalone mode
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                Optimized for iPhone 16 / iOS 17+
              </span>
            </div>

            {/* Action Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Got It, Let's Go
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
