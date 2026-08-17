import React from 'react';

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
  const iconDimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const badgeSize = size === 'sm' ? 'text-[9px] px-1 py-0.2' : size === 'lg' ? 'text-[11px] px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5';

  return (
    <div className={`inline-flex items-center space-x-2.5 select-none group ${className}`}>
      {/* Clean & Professional Indian Invoice Icon Mark */}
      <div 
        className={`relative ${iconDimensions} flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-0.5 shadow-sm border border-blue-500/40 transition-transform duration-150 group-hover:scale-105 overflow-hidden`}
      >
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Clean Crisp White Invoice Card */}
          <rect x="108" y="76" width="296" height="360" rx="36" fill="#FFFFFF" />

          {/* Minimalist Corner Notch Accent */}
          <path d="M336 76H368C387.882 76 404 92.1178 404 112V144L336 76Z" fill="#DBEAFE" />

          {/* Bold Indian Rupee (₹) Symbol in Royal Blue */}
          <rect x="164" y="148" width="184" height="26" rx="13" fill="#1D4ED8" />
          <rect x="164" y="200" width="150" height="26" rx="13" fill="#1D4ED8" />

          <path
            d="M198 148V340"
            stroke="#1D4ED8"
            strokeWidth="26"
            strokeLinecap="round"
          />
          <path
            d="M198 148H264C294.928 148 320 171.281 320 200C320 228.719 294.928 252 264 252H198"
            stroke="#1D4ED8"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M232 248L318 344"
            stroke="#1D4ED8"
            strokeWidth="26"
            strokeLinecap="round"
          />

          {/* Minimalist Ledger Summary Bar */}
          <rect x="164" y="376" width="184" height="18" rx="9" fill="#93C5FD" />
        </svg>
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
