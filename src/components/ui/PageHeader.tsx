import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        {eyebrow && (
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-bold block mb-1.5">
            {eyebrow}
          </span>
        )}
        <h1 className="font-serif text-3xl sm:text-4xl text-[#FBF8F3] leading-tight">
          {title}
        </h1>
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
}
