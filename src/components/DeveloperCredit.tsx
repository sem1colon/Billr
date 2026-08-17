import React, { useState } from 'react';
import { ExternalLink, Globe } from 'lucide-react';

interface DeveloperCreditProps {
  variant?: 'floating' | 'subtle' | 'inline';
  className?: string;
}

export const DeveloperCredit: React.FC<DeveloperCreditProps> = ({
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`fixed bottom-3 right-3 z-30 pointer-events-auto select-none transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href="https://sem1colon.github.io"
        target="_blank"
        rel="noopener noreferrer"
        title="Crafted by sem1Colon Inc."
        className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full apple-glass-subtle bg-white/40 hover:bg-white/90 border border-white/70 shadow-xs hover:shadow-md text-slate-400 hover:text-slate-800 transition-all duration-300 opacity-40 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md overflow-hidden"
      >
        {/* Subtle glowing pulse */}
        <span className="font-mono font-black text-xs text-blue-600 group-hover:rotate-12 transition-transform duration-300">
          ;
        </span>

        {/* Hidden by default, smoothly reveals on hover / tap */}
        <div className={`flex items-center gap-1 text-[11px] font-medium tracking-tight overflow-hidden transition-all duration-300 ${
          isHovered ? 'max-w-[140px] opacity-100 ml-0.5' : 'max-w-0 opacity-0'
        }`}>
          <span className="text-slate-600 font-semibold whitespace-nowrap">sem1Colon</span>
          <Globe className="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />
          <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
        </div>
      </a>
    </div>
  );
};
