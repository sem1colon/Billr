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
  subtitle = 'GST Invoice Studio',
  showSubtitle = true,
}) => {
  const iconDimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const badgeSize = size === 'sm' ? 'text-[9px] px-1 py-0.2' : size === 'lg' ? 'text-[11px] px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5';

  return (
    <div className={`inline-flex items-center space-x-2.5 select-none group ${className}`}>
      {/* High-End Billr Precision Monogram Icon */}
      <div 
        className={`relative ${iconDimensions} flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 p-[1px] shadow-sm shadow-blue-950/20 ring-1 ring-white/15 transition-transform duration-200 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full rounded-xl"
        >
          <defs>
            <linearGradient id="logoBg" x1="64" y1="32" x2="448" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="50%" stopColor="#172554" />
              <stop offset="100%" stopColor="#090D16" />
            </linearGradient>

            <radialGradient id="logoGlow" cx="120" cy="100" r="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="logoUpper" x1="170" y1="120" x2="380" y2="270" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            <linearGradient id="logoLower" x1="170" y1="240" x2="410" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="60%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            <linearGradient id="logoSpine" x1="130" y1="110" x2="220" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#DBEAFE" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>

            <filter id="logoShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Squircle Base */}
          <rect width="512" height="512" rx="128" fill="url(#logoBg)" />
          <rect width="512" height="512" rx="128" fill="url(#logoGlow)" />

          {/* Geometric Monogram "B" */}
          <g filter="url(#logoShadow)">
            {/* Lower Loop of B */}
            <path
              d="M190 236H284C339.228 236 384 274.056 384 321C384 367.944 339.228 406 284 406H144C130.745 406 120 395.255 120 382V320C120 306.745 130.745 296 144 296H190V236Z"
              fill="url(#logoLower)"
            />

            {/* Upper Loop of B */}
            <path
              d="M190 106H264C312.597 106 352 139.131 352 180C352 220.869 312.597 254 264 254H190V106Z"
              fill="url(#logoUpper)"
            />

            {/* Spine Pillar */}
            <path
              d="M144 106H190V406H144C130.745 406 120 395.255 120 382V130C120 116.745 130.745 106 144 106Z"
              fill="url(#logoSpine)"
            />

            {/* Center Flow Divider */}
            <path
              d="M190 240H308C322 240 332 246 332 254C332 262 322 268 308 268H190V240Z"
              fill="#FFFFFF"
              fillOpacity="0.9"
            />

            {/* Inner Cutouts */}
            <path
              d="M190 156H256C278.091 156 296 168.088 296 183C296 197.912 278.091 210 256 210H190V156Z"
              fill="#0E1726"
            />
            <path
              d="M190 292H276C302.51 292 324 306.775 324 325C324 343.225 302.51 358 276 358H190V292Z"
              fill="#0A101D"
            />

            {/* Rupee Ledger Accent Ticks */}
            <rect x="142" y="180" width="76" height="12" rx="6" fill="#FFFFFF" fillOpacity="0.95" />
            <rect x="142" y="322" width="76" height="12" rx="6" fill="#60A5FA" />
          </g>
        </svg>
      </div>

      {/* Brand Wordmark & Subtle Badge */}
      {showText && (
        <div className="flex items-center space-x-2">
          <div className="flex items-baseline space-x-0.5 leading-none">
            <span className={`font-black ${textSize} tracking-tight text-slate-900`}>
              Billr
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5 transform translate-y-[-2px]"></span>
          </div>

          {showSubtitle && subtitle && (
            <span className={`${badgeSize} hidden sm:inline-flex font-semibold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200/80 rounded-md`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
