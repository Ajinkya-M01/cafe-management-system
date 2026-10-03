import React from 'react';
import { Package, Search, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'search' | 'error';
}

const defaultIcons = {
  default: <Package className="w-10 h-10 text-[#C5A880]/40" />,
  search: <Search className="w-10 h-10 text-[#C5A880]/40" />,
  error: <AlertCircle className="w-10 h-10 text-red-400/60" />,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-[#2A211C] border border-[#C5A880]/15 flex items-center justify-center mb-1">
        {icon ?? defaultIcons[variant]}
      </div>
      <h3 className="font-serif text-lg text-[#FBF8F3]">{title}</h3>
      {description && (
        <p className="text-xs text-[#A8988B] max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
