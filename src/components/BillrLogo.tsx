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
      {/* Clean & Professional Indian GST Invoice Icon Mark */}
      <div 
        className={`relative ${iconDimensions} flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-1 shadow-sm border border-blue-500/40 transition-transform duration-150 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <filter id="iconShadow" x="-10%" y="-10%" width="125%" height="130%">
              <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0F172A" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Invoice Document Base (White Card with Folded Corner) */}
          <g filter="url(#iconShadow)">
            <path
              d="M144 88C130.745 88 120 98.7452 120 112V400C120 413.255 130.745 424 144 424H368C381.255 424 392 413.255 392 400V168L312 88H144Z"
              fill="#FFFFFF"
            />
            <path
              d="M312 88V152C312 160.837 319.163 168 328 168H392L312 88Z"
              fill="#DBEAFE"
            />
          </g>

          {/* Indian Rupee (₹) Symbol */}
          <g stroke="#1D4ED8" strokeLinecap="round" strokeLinejoin="round">
            {/* Top Rupee Bar */}
            <path d="M178 184H298" strokeWidth="24" />
            {/* Second Rupee Bar */}
            <path d="M178 226H280" strokeWidth="24" />
            {/* Rupee Loop */}
            <path
              d="M214 184V264C214 264 282 264 282 222C282 184 214 184 214 184Z"
              strokeWidth="24"
            />
            {/* Rupee Diagonal Leg */}
            <path d="M224 264L294 340" strokeWidth="26" />
          </g>

          {/* Invoice Ledger Line Items */}
          <g strokeLinecap="round">
            <line x1="178" y1="378" x2="238" y2="378" stroke="#94A3B8" strokeWidth="16" />
            <line x1="262" y1="378" x2="334" y2="378" stroke="#3B82F6" strokeWidth="16" />
          </g>
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
