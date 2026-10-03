'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Coffee, Lock, Mail, ShieldCheck, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

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

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/admin/dashboard');
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper quick fills for testing
  const handleQuickRole = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex bg-[#100d0b] text-[#f9f6f1]">
      {/* Left Column: Editorial Atmosphere */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 xl:p-16 border-r border-[#c5a880]/15 bg-[#171311]">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1600&q=85"
            alt="Noir and bean atelier bar"
            fill
            priority
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#100d0b] via-[#100d0b]/80 to-[#100d0b]/50" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl border border-[#c5a880]/30 flex items-center justify-center bg-[#231b17] shadow-lg">
            <Coffee className="w-5 h-5 text-[#c5a880]" />
          </div>
          <div>
            <span className="font-serif text-2xl tracking-[0.2em] font-medium text-[#f9f6f1] block leading-none">
              NOIR &amp; BEAN
            </span>
            <span className="text-[9px] uppercase tracking-[0.28em] text-[#c5a880] mt-1 block">
              Management &amp; Operations
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a880]/10 border border-[#c5a880]/20 text-[11px] font-semibold text-[#c5a880] tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hospitality Intelligence</span>
          </div>
          <blockquote className="font-serif text-3xl xl:text-4xl text-[#f9f6f1] leading-snug">
            &ldquo;Precision in roasting, poise in service, excellence in hospitality.&rdquo;
          </blockquote>
          <p className="text-xs text-[#a8988b] leading-relaxed">
            Centralized console for live table management, multi-station kitchen display orders, POS billing &amp; customer reservations.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#231b17]/80 border border-[#c5a880]/15">
              <div className="flex items-center gap-2 text-[#c5a880] text-xs font-bold mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live POS Engine</span>
              </div>
              <p className="text-[11px] text-[#7f7065]">Real-time order dispatch &amp; billing</p>
            </div>
            <div className="p-3 rounded-xl bg-[#231b17]/80 border border-[#c5a880]/15">
              <div className="flex items-center gap-2 text-[#c5a880] text-xs font-bold mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Role-Based Access</span>
              </div>
              <p className="text-[11px] text-[#7f7065]">Admin, Manager &amp; Staff roles</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-[#7f7065] flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} NOIR &amp; BEAN. Restricted system.</span>
          <span className="text-[#a8988b]">v1.0.0</span>
        </div>
      </div>

      {/* Right Column: Centered Login Card */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 w-full">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a880]/12 border border-[#c5a880]/25 text-[11px] uppercase tracking-[0.18em] font-semibold text-[#c5a880]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Authentication</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#f9f6f1]">
              Sign in to Console
            </h1>
            <p className="text-xs text-[#a8988b]">
              Enter your authorized staff credentials to continue.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-[#ef4444]/12 border border-[#ef4444]/30 text-[#fca5a5] text-xs flex items-center gap-2.5 animate-scale-in"
            >
              <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[11px] uppercase tracking-[0.15em] text-[#d8ccbd] font-medium mb-1.5 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Email Address</span>
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@noirandbean.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1f1815] border border-[#c5a880]/25 text-sm text-[#f9f6f1] placeholder-[#7f7065] focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-[11px] uppercase tracking-[0.15em] text-[#d8ccbd] font-medium mb-1.5 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Password</span>
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1f1815] border border-[#c5a880]/25 text-sm text-[#f9f6f1] placeholder-[#7f7065] focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-colors"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#a8988b] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#c5a880]/40 text-[#c5a880] focus:ring-0 accent-[#c5a880]"
                />
                <span className="text-[12px]">Remember session</span>
              </label>
              <span className="text-[#c5a880]/80 text-[11px] font-medium">RBAC Protected</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#c5a880] hover:bg-[#dfc8a5] text-[#1a1412] font-bold text-xs uppercase tracking-[0.18em] transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-4 min-h-[48px]"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span>Authenticating&hellip;</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Quick Switcher */}
          <div className="pt-6 border-t border-[#c5a880]/15 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#a8988b] font-semibold">
                Quick-Select Demo Role:
              </p>
              <span className="text-[10px] text-[#7f7065]">Click to auto-fill</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRole('admin@noirandbean.com', 'admin123')}
                className="p-2.5 rounded-xl bg-[#1f1815] border border-[#c5a880]/20 hover:border-[#c5a880] hover:bg-[#231b17] text-left transition-all duration-200 cursor-pointer group"
                aria-label="Fill Admin credentials"
              >
                <div className="text-xs font-bold text-[#c5a880] group-hover:text-[#dfc8a5]">Admin</div>
                <div className="text-[10px] text-[#a8988b]">Full Access</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('manager@noirandbean.com', 'manager123')}
                className="p-2.5 rounded-xl bg-[#1f1815] border border-[#c5a880]/20 hover:border-[#c5a880] hover:bg-[#231b17] text-left transition-all duration-200 cursor-pointer group"
                aria-label="Fill Manager credentials"
              >
                <div className="text-xs font-bold text-[#c5a880] group-hover:text-[#dfc8a5]">Manager</div>
                <div className="text-[10px] text-[#a8988b]">Orders &amp; Floor</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('staff@noirandbean.com', 'staff123')}
                className="p-2.5 rounded-xl bg-[#1f1815] border border-[#c5a880]/20 hover:border-[#c5a880] hover:bg-[#231b17] text-left transition-all duration-200 cursor-pointer group"
                aria-label="Fill Staff credentials"
              >
                <div className="text-xs font-bold text-[#c5a880] group-hover:text-[#dfc8a5]">Staff</div>
                <div className="text-[10px] text-[#a8988b]">POS &amp; Kitchen</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
