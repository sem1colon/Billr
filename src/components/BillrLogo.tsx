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
  const iconDimensions = size === 'sm' ? 'w-8 h-8 rounded-lg' : size === 'lg' ? 'w-11 h-11 rounded-2xl' : 'w-9 h-9 rounded-xl';
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const badgeSize = size === 'sm' ? 'text-[9px] px-1 py-0.2' : size === 'lg' ? 'text-[11px] px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5';

  return (
    <div className={`inline-flex items-center space-x-2.5 select-none group ${className}`}>
      {/* Standard Clean Indian Rupee Receipt Icon */}
      <div 
        className={`relative ${iconDimensions} flex-shrink-0 flex items-center justify-center bg-blue-600 text-white shadow-xs border border-blue-500/30 transition-transform duration-150 group-hover:scale-105`}
      >
        <ReceiptIndianRupee className={iconSize} strokeWidth={2.2} />
      </div>

      {/* Brand Wordmark with highlighted blue 'i' */}
      {showText && (
        <div className="flex items-center space-x-2">
          <div className="flex items-baseline leading-none">
            <span className={`font-black ${textSize} tracking-tight text-slate-900`}>
              B<span className="text-blue-600 font-black">i</span>llr
            </span>
          </div>

          {showSubtitle && subtitle && (
            <span className={`${badgeSize} hidden sm:inline-flex font-bold tracking-wider uppercase bg-blue-50/80 text-blue-700 border border-blue-200/80 rounded-full backdrop-blur-md shadow-2xs`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
