import React from 'react';
import { OrderStatus, ReservationStatus, TableStatus, PaymentMethod } from '@/types';

interface StatusBadgeProps {
  status: OrderStatus | ReservationStatus | TableStatus | PaymentMethod | string;
  className?: string;
}

function getOrderStatusStyle(status: string): string {
  switch (status) {
    case 'Pending':     return 'bg-amber-950/70 text-amber-300 border-amber-800/60';
    case 'Confirmed':   return 'bg-blue-950/70 text-blue-300 border-blue-800/60';
    case 'Preparing':   return 'bg-purple-950/70 text-purple-300 border-purple-800/60';
    case 'Ready':       return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
    case 'Completed':   return 'bg-[#251D19] text-[#A8988B] border-[#C5A880]/20';
    case 'Cancelled':   return 'bg-red-950/70 text-red-400 border-red-900/60';
    case 'No-show':     return 'bg-red-950/40 text-red-400 border-red-900/30';
    // Table statuses
    case 'Available':   return 'bg-emerald-950/50 text-emerald-400 border-emerald-700/40';
    case 'Occupied':    return 'bg-[#C5A880]/15 text-[#C5A880] border-[#C5A880]/30';
    case 'Reserved':    return 'bg-purple-950/50 text-purple-300 border-purple-700/40';
    case 'Billing':     return 'bg-amber-950/50 text-amber-300 border-amber-700/40';
    case 'Cleaning':    return 'bg-teal-950/50 text-teal-300 border-teal-700/40';
    // Payment methods
    case 'UPI':         return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
    case 'Card':        return 'bg-blue-950/70 text-blue-300 border-blue-800/60';
    case 'Cash':        return 'bg-[#251D19] text-[#A8988B] border-[#C5A880]/20';
    // Payment statuses
    case 'Paid':        return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
    case 'Refunded':    return 'bg-blue-950/50 text-blue-300 border-blue-700/40';
    default:            return 'bg-[#251D19] text-[#FBF8F3] border-[#C5A880]/15';
  }
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getOrderStatusStyle(status)} ${className}`}
    >
      {status}
    </span>
  );
}

interface RoleBadgeProps {
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  className?: string;
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const styles: Record<string, string> = {
    ADMIN:   'bg-[#C5A880] text-[#14100E] border-[#C5A880]',
    MANAGER: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    STAFF:   'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${styles[role] ?? ''} ${className}`}
    >
      {role}
    </span>
  );
}
