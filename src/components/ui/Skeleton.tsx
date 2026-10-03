import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SkeletonKpiCard() {
  return (
    <div className="p-5 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 space-y-3" aria-hidden="true">
      <div className="flex items-center justify-between">
        <Skeleton className="skeleton-text w-24" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="skeleton-heading w-28 mt-2" />
      <Skeleton className="skeleton-text w-36" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          <Skeleton className={`skeleton-text ${i === 0 ? 'w-20' : i === cols - 1 ? 'w-16' : 'w-full max-w-[140px]'}`} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonMenuCard() {
  return (
    <div className="p-4 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 space-y-3" aria-hidden="true">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="skeleton-text w-32" />
          <Skeleton className="skeleton-text w-12" />
        </div>
        <Skeleton className="skeleton-text w-full" />
        <Skeleton className="skeleton-text w-3/4" />
      </div>
    </div>
  );
}

export function SkeletonTableCard() {
  return (
    <div className="p-5 rounded-2xl border border-[#C5A880]/15 bg-[#1F1815] space-y-3" aria-hidden="true">
      <div className="flex justify-between items-center">
        <Skeleton className="skeleton-heading w-20" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="skeleton-text w-24" />
      <Skeleton className="skeleton-text w-full" />
      <div className="flex justify-between pt-1">
        <Skeleton className="skeleton-text w-16" />
        <Skeleton className="skeleton-text w-16" />
      </div>
    </div>
  );
}
