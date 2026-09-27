'use client';

import React, { useEffect, useState } from 'react';
import { CafeSettings, Role, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  ShieldCheck,
  UserPlus,
  Save,
  CheckCircle2,
  Building,
  Percent,
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();
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
        setTimeout(() => setSavedSuccess(false), 3000);
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
        fetchSettings();
      } else {
        alert(data.error || 'Failed to create staff account');
      }
    } catch {
      alert('Error creating staff account');
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-[#A8988B]">Loading atelier configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-1">
            System Preferences & Security
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#FBF8F3]">
            Café Configuration
          </h1>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Brand & Address Identity */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#C5A880]/15">
            <Building className="w-4 h-4 text-[#C5A880]" />
            <h3 className="font-serif text-xl text-[#FBF8F3]">Café Profile & Tax Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1.5 font-semibold">
                Café Brand Name
              </label>
              <input
                type="text"
                required
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1.5 font-semibold">
                Luxury Tagline
              </label>
              <input
                type="text"
                required
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1.5 font-semibold">
                Atelier Physical Address
              </label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1.5 font-semibold">
                Concierge Contact Phone
              </label>
              <input
                type="tel"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1.5 font-semibold">
                Concierge Email
              </label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1.5 font-semibold">
                GSTIN / Tax ID Registration
              </label>
              <input
                type="text"
                required
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] font-mono focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1.5 font-semibold">
                  CGST Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={settings.cgstRate}
                  onChange={(e) => setSettings({ ...settings, cgstRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1.5 font-semibold">
                  SGST Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={settings.sgstRate}
                  onChange={(e) => setSettings({ ...settings, sgstRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Staff Accounts Management */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#1F1815] border border-[#C5A880]/20 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/15">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
            <h3 className="font-serif text-xl text-[#FBF8F3]">Staff & Role-Based Permissions</h3>
          </div>

          <button
            onClick={() => setShowAddStaffModal(true)}
            className="px-4 py-2 rounded-xl bg-[#2A211C] hover:bg-[#342A24] border border-[#C5A880]/30 text-xs font-semibold text-[#C5A880] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Staff Account</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#E8DFD5]">
            <thead className="uppercase text-[10px] text-[#A8988B] bg-[#171210] border-b border-[#C5A880]/20">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Role Capabilities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A880]/10">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-[#251D19]">
                  <td className="py-3 px-4 font-semibold text-[#FBF8F3]">{s.name}</td>
                  <td className="py-3 px-4 text-[#A8988B]">{s.email}</td>
                  <td className="py-3 px-4">{s.phone || '--'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                        s.role === 'ADMIN'
                          ? 'bg-[#C5A880] text-[#14100E] border-[#C5A880]'
                          : s.role === 'MANAGER'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {s.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-[#A8988B]">
                    {s.role === 'ADMIN'
                      ? 'Full management, staff, menu, tables, billing, reports, settings'
                      : s.role === 'MANAGER'
                      ? 'Orders, reservations, tables, menu, reports, billing'
                      : 'Orders, reservations, table status, generate bills'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Account Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddStaff}
            className="bg-[#1F1815] border border-[#C5A880]/30 rounded-3xl max-w-md w-full p-6 text-[#FBF8F3] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/20">
              <h3 className="font-serif text-xl text-[#FBF8F3]">Add Staff Account</h3>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="text-[#A8988B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={newStaffPass}
                onChange={(e) => setNewStaffPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                  Role
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as Role)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="px-4 py-2 rounded-xl bg-[#2A211C] text-xs font-semibold text-[#A8988B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs font-bold uppercase tracking-wider"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
