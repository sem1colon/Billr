import React from 'react';

interface BillrLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

export const BillrLogo: React.FC<BillrLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtitle = 'Murthy Chemical Agencies',
}) => {
  const iconDimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const subTextSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';

  return (
    <div className={`inline-flex items-center space-x-3 select-none group ${className}`}>
      {/* 
        Professional Billr Icon Mark:
        Conveys an Invoice Document with a folded corner, holding a crisp Indian Rupee symbol (₹)
        combined with clean invoice ledger lines for instant recognition as an Indian GST/Tax Invoice Maker.
      */}
      <div className={`relative ${iconDimensions} flex-shrink-0 flex items-center justify-center rounded-xl bg-blue-600 shadow-sm border border-blue-700/30 transition-transform duration-150 group-hover:scale-105`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[82%] h-[82%]"
        >
          {/* Invoice Document Base (White Card) */}
          <path
            d="M8 6.5C8 5.11929 9.11929 4 10.5 4H24.5L32 11.5V33.5C32 34.8807 30.8807 36 29.5 36H10.5C9.11929 36 8 34.8807 8 33.5V6.5Z"
            fill="#FFFFFF"
          />

          {/* Folded Top-Right Document Corner */}
          <path
            d="M24.5 4V10C24.5 10.8284 25.1716 11.5 26 11.5H32L24.5 4Z"
            fill="#DBEAFE"
          />
          <path
            d="M24.5 4V10C24.5 10.8284 25.1716 11.5 26 11.5H32"
            stroke="#93C5FD"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Indian Rupee Symbol (₹) embedded seamlessly as invoice identity */}
          {/* Top Rupee Bar */}
          <path
            d="M13 13.5H23"
            stroke="#1D4ED8"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Second Rupee Bar */}
          <path
            d="M13 17.5H21.5"
            stroke="#1D4ED8"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Rupee Loop & Stem */}
          <path
            d="M16 13.5V20.5C16 20.5 21.5 20.5 21.5 17C21.5 13.5 16 13.5 16 13.5Z"
            stroke="#1D4ED8"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Rupee Diagonal Leg */}
          <path
            d="M17 20.5L22.5 27.5"
            stroke="#1D4ED8"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Invoice Item Lines at bottom */}
          <path
            d="M13 31.5H27"
            stroke="#94A3B8"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Professional Brand Wordmark */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center space-x-1 leading-none">
            <span className={`font-bold ${textSize} tracking-tight text-slate-900`}>
              B<span className="text-blue-600 font-bold">i</span>llr
            </span>
          </div>
          <span className={`${subTextSize} text-slate-500 font-medium tracking-tight truncate max-w-[200px] sm:max-w-[280px] mt-0.5`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};
