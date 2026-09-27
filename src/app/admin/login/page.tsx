'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Coffee, Lock, Mail, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/admin/dashboard');
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  // Helper quick fills for review
  const handleQuickRole = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen flex bg-[#14100E] text-[#FBF8F3]">
      {/* Left Column: Atmospheric Luxury Editorial */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-16 border-r border-[#C5A880]/20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1600&q=85"
            alt="Noir and bean atelier bar"
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14100E] via-[#14100E]/70 to-[#14100E]/50" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#C5A880]/40 flex items-center justify-center bg-[#231B17]">
            <Coffee className="w-5 h-5 text-[#C5A880]" />
          </div>
          <div>
            <span className="font-serif text-2xl tracking-[0.2em] font-medium text-[#FBF8F3]">
              NOIR & BEAN
            </span>
            <span className="block text-[10px] uppercase tracking-[0.25em] text-[#C5A880]">
              Management & Operations
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <blockquote className="font-serif text-3xl text-[#FBF8F3] leading-snug">
            &quot;Precision in roasting, poise in service, excellence in hospitality.&quot;
          </blockquote>
          <p className="text-xs text-[#A8988B] leading-relaxed">
            Authorized management console for POS billing, live table operations, kitchen display orders, and floor reservations.
          </p>
        </div>

        <div className="relative z-10 text-[11px] text-[#7F7065]">
          © {new Date().getFullYear()} NOIR & BEAN. Restricted system access.
        </div>
      </div>

      {/* Right Column: Secure Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 max-w-xl mx-auto w-full">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 text-xs uppercase tracking-widest text-[#C5A880] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff Authentication Portal</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#FBF8F3] mb-2">
            Sign In to Atelier Console
          </h1>
          <p className="text-xs text-[#A8988B]">
            Enter your staff credentials to access protected café operations.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#D8CCBD] font-medium mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. admin@noirandbean.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#201815] border border-[#C5A880]/30 text-sm text-[#FBF8F3] placeholder-[#7F7065] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#D8CCBD] font-medium mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#201815] border border-[#C5A880]/30 text-sm text-[#FBF8F3] placeholder-[#7F7065] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#A8988B] pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#C5A880]/40 text-[#C5A880] focus:ring-0"
              />
              <span>Keep session active</span>
            </label>
            <span className="text-[#C5A880]/80 text-[11px]">Server RBAC Enforced</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-4"
          >
            {loading ? (
              <div className="inline-block w-4 h-4 border-2 border-[#14100E] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Switcher */}
        <div className="mt-8 pt-6 border-t border-[#C5A880]/20 space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-[#A8988B] font-semibold">
            One-Click Demo Credentials:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickRole('admin@noirandbean.com', 'admin123')}
              className="p-2.5 rounded-lg bg-[#201815] border border-[#C5A880]/30 hover:border-[#C5A880] text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-[#C5A880]">Admin</div>
              <div className="text-[10px] text-[#A8988B]">Full access</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole('manager@noirandbean.com', 'manager123')}
              className="p-2.5 rounded-lg bg-[#201815] border border-[#C5A880]/30 hover:border-[#C5A880] text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-[#C5A880]">Manager</div>
              <div className="text-[10px] text-[#A8988B]">Orders & tables</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole('staff@noirandbean.com', 'staff123')}
              className="p-2.5 rounded-lg bg-[#201815] border border-[#C5A880]/30 hover:border-[#C5A880] text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-[#C5A880]">Staff</div>
              <div className="text-[10px] text-[#A8988B]">POS & orders</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
