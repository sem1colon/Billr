import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, ShieldCheck, Zap, HardDrive, Globe } from 'lucide-react';
import { BillrLogo } from './BillrLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xl transition-opacity"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="relative w-full max-w-sm apple-glass-card !bg-white/95 rounded-[32px] p-6 shadow-2xl border border-white/95 text-slate-900 z-10 overflow-hidden"
          >
            
            {/* Perfectly Aligned Circular Close Button in Top-Right */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.90 }}
              onClick={onClose}
              className="!absolute top-4 right-4 w-8 h-8 rounded-full apple-glass-btn flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors cursor-pointer z-20"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4 flex-shrink-0" />
            </motion.button>

            {/* Brand Icon & Name */}
            <div className="flex flex-col items-center text-center pt-2 pb-3">
              <BillrLogo size="lg" showText={false} className="mb-3" />
              <h3 className="text-xl font-black tracking-tight text-slate-900">
                Billr
              </h3>
              <p className="text-xs font-bold text-blue-600 mt-0.5">
                Version 1.0.0
              </p>
              <p className="text-xs text-slate-500 mt-2 max-w-[240px] leading-relaxed">
                Fast commercial GST billing & tax invoice automation engine.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-2 my-3.5">
              <div className="flex items-center space-x-3 p-2.5 rounded-2xl apple-glass-subtle text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-slate-800 block">Private & Local</span>
                  <span className="text-[11px] text-slate-500">Zero cloud transmission; data stays on device.</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 rounded-2xl apple-glass-subtle text-xs">
                <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-slate-800 block">Instant Vector PDF</span>
                  <span className="text-[11px] text-slate-500">Crystal-clear print ready A4 commercial format.</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 rounded-2xl apple-glass-subtle text-xs">
                <HardDrive className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-slate-800 block">Universal PWA</span>
                  <span className="text-[11px] text-slate-500">Works 100% offline across Android, iOS & Desktop.</span>
                </div>
              </div>
            </div>

            {/* Developer Attribution Card */}
            <div className="mt-4 pt-3.5 border-t border-slate-200/70 text-center">
              <p className="text-[11px] text-slate-400 font-medium mb-2">
                Crafted with precision by
              </p>
              <motion.a
                href="https://sem1colon.github.io"
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl apple-glass-btn text-slate-800 hover:text-blue-700 text-xs font-bold transition-all group cursor-pointer w-full"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span>sem1Colon Inc.</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors ml-1" />
              </motion.a>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
