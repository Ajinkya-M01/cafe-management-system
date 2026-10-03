'use client';

import React, { useEffect, useState } from 'react';
import { CafeSettings, Role, User } from '@/types';
import {
  ShieldCheck,
  UserPlus,
  Save,
  CheckCircle2,
  Building,
  Percent,
  X,
  Mail,
  Phone,
  Receipt,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<CafeSettings | null>(null);
  const [staff, setStaff] = useState<Omit<User, 'passwordHash'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // New staff modal
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPass, setNewStaffPass] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<Role>('STAFF');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setStaff(data.staff);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        alert(data.error || 'Failed to update settings');
      }
    } catch {
      alert('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingStaff(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStaffName,
          email: newStaffEmail,
          password: newStaffPass,
          role: newStaffRole,
          phone: newStaffPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddStaffModal(false);
        setNewStaffName('');
        setNewStaffEmail('');
        setNewStaffPass('');
        setNewStaffPhone('');
        await fetchSettings();
      } else {
        alert(data.error || 'Failed to create staff account');
      }
    } catch {
      alert('Error creating staff account');
    } finally {
      setIsCreatingStaff(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#c5a880] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-[#a8988b]">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        eyebrow="System Preferences &amp; Security"
        title="Café Configuration"
        action={
          savedSuccess ? (
            <div className="px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-scale-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Configuration Saved!</span>
            </div>
          ) : undefined
        }
      />

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section 1: Brand & Atelier Identity */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#1f1815] border border-[#c5a880]/20 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#c5a880]/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2a211c] border border-[#c5a880]/30 flex items-center justify-center">
                <Building className="w-4 h-4 text-[#c5a880]" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#f9f6f1]">Café Identity &amp; Profile</h3>
                <p className="text-xs text-[#a8988b]">Branding, legal atelier name, and guest concierge details</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="setting-name"
                className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1.5"
              >
                Brand Name *
              </label>
              <input
                id="setting-name"
                type="text"
                required
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div>
              <label
                htmlFor="setting-tagline"
                className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1.5"
              >
                Signature Tagline *
              </label>
              <input
                id="setting-tagline"
                type="text"
                required
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="setting-address"
                className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1.5"
              >
                Atelier Physical Address *
              </label>
              <input
                id="setting-address"
                type="text"
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div>
              <label
                htmlFor="setting-phone"
                className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1.5 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Concierge Phone *</span>
              </label>
              <input
                id="setting-phone"
                type="tel"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] font-mono focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div>
              <label
                htmlFor="setting-email"
                className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1.5 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Concierge Email *</span>
              </label>
              <input
                id="setting-email"
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Fiscal & Tax Regulations */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#1f1815] border border-[#c5a880]/20 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#c5a880]/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2a211c] border border-[#c5a880]/30 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-[#c5a880]" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#f9f6f1]">Taxation &amp; Receipt Compliance</h3>
                <p className="text-xs text-[#a8988b]">GST structure printed on tax invoices and POS receipts</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label
                htmlFor="setting-gstin"
                className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1.5"
              >
                GSTIN / Tax ID Registration *
              </label>
              <input
                id="setting-gstin"
                type="text"
                required
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] font-mono focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div>
              <label
                htmlFor="setting-cgst"
                className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1.5 flex items-center gap-1.5"
              >
                <Percent className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>CGST Rate (%) *</span>
              </label>
              <input
                id="setting-cgst"
                type="number"
                step="0.1"
                min="0"
                max="30"
                required
                value={settings.cgstRate}
                onChange={(e) =>
                  setSettings({ ...settings, cgstRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div>
              <label
                htmlFor="setting-sgst"
                className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1.5 flex items-center gap-1.5"
              >
                <Percent className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>SGST Rate (%) *</span>
              </label>
              <input
                id="setting-sgst"
                type="number"
                step="0.1"
                min="0"
                max="30"
                required
                value={settings.sgstRate}
                onChange={(e) =>
                  setSettings({ ...settings, sgstRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#c5a880]/15">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#c5a880] hover:bg-[#dfc8a5] text-[#1a1412] text-xs font-bold uppercase tracking-[0.18em] flex items-center gap-2 cursor-pointer disabled:opacity-60 transition-all duration-200 shadow-sm"
            >
              {saving ? (
                <>
                  <Spinner size="sm" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Staff Roster & Role Capabilities */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#1f1815] border border-[#c5a880]/20 shadow-md space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#c5a880]/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2a211c] border border-[#c5a880]/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-[#f9f6f1]">Staff Roster &amp; RBAC Security</h3>
              <p className="text-xs text-[#a8988b]">Role permissions for administrative and POS floor operations</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddStaffModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#2a211c] hover:bg-[#342a24] border border-[#c5a880]/30 text-xs font-semibold text-[#c5a880] hover:text-[#dfc8a5] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Account</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#c5a880]/15">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Contact</th>
                <th>Assigned Role</th>
                <th>Capabilities</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#2a211c] border border-[#c5a880]/25 flex items-center justify-center font-bold text-xs text-[#c5a880] shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-[#f9f6f1]">{s.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-[#f9f6f1] text-xs">{s.email}</div>
                    {s.phone && <div className="text-[10px] text-[#7f7065] font-mono">{s.phone}</div>}
                  </td>
                  <td>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                        s.role === 'ADMIN'
                          ? 'bg-[#c5a880] text-[#1a1412] border-[#c5a880]'
                          : s.role === 'MANAGER'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {s.role}
                    </span>
                  </td>
                  <td className="text-[11px] text-[#a8988b]">
                    {s.role === 'ADMIN'
                      ? 'Full access: Billing, Kitchen, Catalog, Tables, Reports, System Settings'
                      : s.role === 'MANAGER'
                      ? 'Floor operations: Orders, Reservations, Tables, Catalog & Reports'
                      : 'Floor service: Orders, POS terminal, Table availability'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Account Modal */}
      {showAddStaffModal && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={() => setShowAddStaffModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleAddStaff}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1f1815] border border-[#c5a880]/30 rounded-3xl max-w-md w-full p-6 text-[#f9f6f1] shadow-2xl space-y-4 animate-scale-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#c5a880]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#2a211c] border border-[#c5a880]/30 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-[#c5a880]" />
                </div>
                <h3 className="font-serif text-xl text-[#f9f6f1]">New Staff Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="p-1.5 rounded-lg text-[#a8988b] hover:text-[#f9f6f1] hover:bg-[#2a211c] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label
                htmlFor="staff-name"
                className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1"
              >
                Full Name *
              </label>
              <input
                id="staff-name"
                type="text"
                required
                placeholder="e.g. Julian Hayes"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div>
              <label
                htmlFor="staff-email"
                className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1"
              >
                Email Address *
              </label>
              <input
                id="staff-email"
                type="email"
                required
                placeholder="julian@noirandbean.com"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div>
              <label
                htmlFor="staff-pass"
                className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1"
              >
                Initial Password *
              </label>
              <input
                id="staff-pass"
                type="password"
                required
                placeholder="••••••••"
                value={newStaffPass}
                onChange={(e) => setNewStaffPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="staff-role"
                  className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1"
                >
                  Role
                </label>
                <select
                  id="staff-role"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as Role)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="staff-phone"
                  className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="staff-phone"
                  type="tel"
                  placeholder="+91..."
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#c5a880]/15 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#2a211c] hover:bg-[#342a24] text-xs font-semibold text-[#a8988b] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingStaff}
                className="px-5 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#dfc8a5] text-[#1a1412] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isCreatingStaff ? (
                  <>
                    <Spinner size="sm" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
