import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface DeveloperCreditProps {
  variant?: 'inline' | 'floating' | 'subtle';
  className?: string;
}

export const DeveloperCredit: React.FC<DeveloperCreditProps> = ({
  variant = 'inline',
  className = '',
}) => {
  if (variant === 'floating') {
    return (
      <aside aria-label="Developer Credits" className={`fixed bottom-20 right-4 sm:bottom-4 sm:right-6 z-20 pointer-events-auto ${className}`}>
        <a
          href="https://sem1colon.github.io"
          target="_blank"
          rel="noopener noreferrer"
          title="Engineered by sem1Colon Inc."
          className="group flex items-center space-x-1.5 px-2.5 py-1 bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200/80 hover:border-blue-300 text-slate-400 hover:text-slate-700 rounded-full text-[11px] font-mono shadow-xs transition-all duration-200 hover:shadow-sm"
        >
          <span className="text-blue-600 font-bold group-hover:rotate-12 transition-transform inline-block">;</span>
          <span className="opacity-70 group-hover:opacity-100 font-medium">sem1Colon</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity text-blue-600" />
        </a>
      </aside>
    );
  }

  return (
    <footer className={`pt-8 pb-4 text-center select-none ${className}`}>
      <a
        href="https://sem1colon.github.io"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors group px-3 py-1 rounded-full hover:bg-slate-100/80"
      >
        <span className="font-mono font-bold text-blue-600 group-hover:scale-110 transition-transform">;</span>
        <span className="font-medium tracking-tight">Crafted with precision by</span>
        <span className="font-semibold text-slate-600 group-hover:text-blue-600 group-hover:underline decoration-blue-400 underline-offset-2">
          sem1Colon Inc.
        </span>
        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
      </a>
    </footer>
  );
};
