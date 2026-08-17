import React from 'react';
import { ReceiptIndianRupee } from 'lucide-react';

interface BillrLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  subtitle?: string;
  showSubtitle?: boolean;
}

export const BillrLogo: React.FC<BillrLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtitle = '',
  showSubtitle = false,
}) => {
  const iconDimensions = size === 'sm' ? 'w-8 h-8 rounded-xl' : size === 'lg' ? 'w-11 h-11 rounded-2xl' : 'w-9 h-9 rounded-[14px]';
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const badgeSize = size === 'sm' ? 'text-[9px] px-1.5 py-0.2' : size === 'lg' ? 'text-[11px] px-2.5 py-0.5' : 'text-[10px] px-2 py-0.5';

  return (
    <div className={`inline-flex items-center space-x-2.5 select-none group ${className}`}>
      {/* Apple Liquid Glass Sapphire Icon Box */}
      <div 
        className={`relative ${iconDimensions} flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)] border border-white/40 backdrop-blur-xl transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] overflow-hidden`}
      >
        {/* Specular light sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-transparent pointer-events-none" />
        <ReceiptIndianRupee className={`${iconSize} relative z-10 drop-shadow-xs`} strokeWidth={2.4} />
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex items-center space-x-2">
          <div className="flex items-baseline leading-none">
            <span className={`font-black ${textSize} tracking-tight text-slate-900`}>
              B<span className="text-blue-600 font-black">i</span>llr
            </span>
          </div>

          {showSubtitle && subtitle && (
            <span className={`${badgeSize} hidden sm:inline-flex font-bold tracking-wider uppercase apple-glass-badge text-blue-700 rounded-full`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
