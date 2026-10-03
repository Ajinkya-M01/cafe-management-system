import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizeMap[size]} border-[#C5A880] border-t-transparent rounded-full animate-spin inline-block ${className}`}
    />
  );
}

interface PageSpinnerProps {
  label?: string;
}

export function PageSpinner({ label = 'Loading...' }: PageSpinnerProps) {
  return (
    <div className="py-24 flex flex-col items-center gap-3" role="status" aria-label={label}>
      <Spinner size="lg" />
      <p className="text-[11px] uppercase tracking-widest text-[#A8988B]">{label}</p>
    </div>
  );
}
