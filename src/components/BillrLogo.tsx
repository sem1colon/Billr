import React from 'react';

export type LogoVariant = 'ledger' | 'monolith' | 'flow';

interface BillrLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtitle?: string;
  showSubtitle?: boolean;
  variant?: LogoVariant;
}

export const BillrLogo: React.FC<BillrLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtitle = '',
  showSubtitle = false,
}) => {
  // Metric matrix calibrated for clean typographic hierarchy
  const dimensions = {
    sm: { text: 'text-lg', sub: 'text-[9px]' },
    md: { text: 'text-2xl', sub: 'text-[10px]' },
    lg: { text: 'text-3xl', sub: 'text-[11px]' },
    xl: { text: 'text-4xl', sub: 'text-[13px]' },
  }[size];

  if (!showText) {
    return null;
  }

  return (
    <div className={`inline-flex flex-col justify-center select-none ${className}`}>
      <div className="flex items-center leading-none">
        <span className={`font-black ${dimensions.text} tracking-[-0.035em] text-slate-900 inline-block transition-colors duration-200`}>
          B<span className="text-blue-600 font-black relative inline-block transition-colors">i</span>llr
        </span>
      </div>

      {showSubtitle && subtitle && (
        <span className={`${dimensions.sub} font-semibold tracking-wider uppercase text-slate-400 mt-0.5`}>
          {subtitle}
        </span>
      )}
    </div>
  );
};
