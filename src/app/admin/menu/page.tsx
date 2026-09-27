'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Category, MenuItem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Clock,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  Filter,
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'Coffee',
  'Tea',
  'Cold Beverages',
  'Breakfast',
  'Snacks',
  'Main Course',
  'Desserts',
  'Specials',
];

export default function AdminMenuPage() {
  const { hasRole } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<'All' | Category>('All');

  // Modal State
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCat, setFormCat] = useState<Category>('Coffee');
  const [formPrice, setFormPrice] = useState(350);
  const [formImage, setFormImage] = useState('');
  const [formVeg, setFormVeg] = useState(true);
  const [formPopular, setFormPopular] = useState(false);
  const [formAvailable, setFormAvailable] = useState(true);
  const [formPrep, setFormPrep] = useState(8);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/admin/menu');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const openAddModal = () => {
    setIsAddMode(true);
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormCat('Coffee');
    setFormPrice(350);
    setFormImage('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80');
    setFormVeg(true);
    setFormPopular(false);
    setFormAvailable(true);
    setFormPrep(8);
  };

  const openEditModal = (item: MenuItem) => {
    setIsAddMode(false);
    setEditingItem(item);
    setFormName(item.name);
    setFormDesc(item.description);
    setFormCat(item.category);
    setFormPrice(item.price);
    setFormImage(item.image);
    setFormVeg(item.isVeg);
    setFormPopular(item.isPopular);
    setFormAvailable(item.isAvailable);
    setFormPrep(item.preparationTime);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isAddMode) {
        const res = await fetch('/api/admin/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            description: formDesc,
            category: formCat,
            price: formPrice,
            image: formImage,
            isVeg: formVeg,
            isPopular: formPopular,
            isAvailable: formAvailable,
            preparationTime: formPrep,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsAddMode(false);
          fetchMenuItems();
        } else {
          alert(data.error || 'Failed to add item');
        }
      } else if (editingItem) {
        const res = await fetch('/api/admin/menu', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            name: formName,
            description: formDesc,
            category: formCat,
            price: formPrice,
            image: formImage,
            isVeg: formVeg,
            isPopular: formPopular,
            isAvailable: formAvailable,
            preparationTime: formPrep,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setEditingItem(null);
          fetchMenuItems();
        } else {
          alert(data.error || 'Failed to update item');
        }
      }
    } catch (err) {
      console.error('Error saving item:', err);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          isAvailable: !item.isAvailable,
        }),
      });
      if (res.ok) {
        fetchMenuItems();
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you wish to permanently remove this dish from the menu?')) return;
    try {
      const res = await fetch(`/api/admin/menu?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchMenuItems();
      } else {
        alert(data.error || 'Failed to delete item');
      }
    } catch {
      alert('Error deleting menu item');
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedCat !== 'All' && item.category !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold block mb-1">
            Culinary Offerings & Recipe Inventory
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#FBF8F3]">
            Menu Catalog
          </h1>
        </div>

        {hasRole(['ADMIN', 'MANAGER']) && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Menu Item</span>
          </button>
        )}
      </div>

      {/* Filters and Category Tabs */}
      <div className="p-4 rounded-2xl bg-[#1F1815] border border-[#C5A880]/20 space-y-3">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6D]" />
          <input
            type="text"
            placeholder="Search items by name, description, ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] placeholder-[#7F7065] focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['All', ...CATEGORIES] as ('All' | Category)[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-colors shrink-0 cursor-pointer ${
                selectedCat === cat
                  ? 'bg-[#C5A880] text-[#14100E]'
                  : 'bg-[#14100E] text-[#A8988B] border border-[#C5A880]/20 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs uppercase tracking-widest text-[#A8988B]">Loading catalog...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center text-xs text-[#A8988B]">
          No menu items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                item.isAvailable
                  ? 'bg-[#1F1815] border-[#C5A880]/20'
                  : 'bg-[#1F1815]/50 border-gray-800 opacity-60'
              }`}
            >
              <div>
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-3 bg-[#2A211C]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.isVeg ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    <span>{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
                  </div>

                  {item.isPopular && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#1A1412]/80 backdrop-blur-xs text-[#C5A880] text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Signature</span>
                    </div>
                  )}

                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-red-300 uppercase tracking-widest">
                      Currently Unavailable
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-serif text-lg font-medium text-[#FBF8F3]">
                    {item.name}
                  </h3>
                  <span className="font-bold text-[#C5A880] text-sm shrink-0">
                    ₹{item.price}
                  </span>
                </div>

                <p className="text-xs text-[#A8988B] line-clamp-2 mb-3">
                  {item.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-[#7F7065] mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C5A880]" />
                    <span>{item.preparationTime} mins</span>
                  </span>
                  <span>• {item.category}</span>
                </div>
              </div>

              {/* Actions row */}
              <div className="pt-3 border-t border-[#C5A880]/15 flex items-center justify-between">
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`text-xs flex items-center gap-1.5 cursor-pointer font-semibold ${
                    item.isAvailable ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                  title={item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                >
                  {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{item.isAvailable ? 'Available' : 'Sold Out'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {hasRole(['ADMIN', 'MANAGER']) && (
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg bg-[#2A211C] hover:bg-[#342A24] text-[#C5A880] cursor-pointer"
                      title="Edit dish"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {hasRole('ADMIN') && (
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg bg-[#2A211C] hover:bg-red-950 text-red-400 cursor-pointer"
                      title="Delete dish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {(isAddMode || editingItem) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveItem}
            className="bg-[#1F1815] border border-[#C5A880]/30 rounded-3xl max-w-lg w-full p-6 text-[#FBF8F3] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/20">
              <h3 className="font-serif text-2xl text-[#FBF8F3]">
                {isAddMode ? 'Add New Menu Item' : 'Edit Menu Item'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddMode(false);
                  setEditingItem(null);
                }}
                className="text-[#A8988B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                Item Title *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                  Category
                </label>
                <select
                  value={formCat}
                  onChange={(e) => setFormCat(e.target.value as Category)}
                  className="w-full px-3 py-2 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                  Prep Time (Mins)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formPrep}
                  onChange={(e) => setFormPrep(Number(e.target.value) || 5)}
                  className="w-full px-3 py-2 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                  Dietary Indicator
                </label>
                <select
                  value={formVeg ? 'veg' : 'non-veg'}
                  onChange={(e) => setFormVeg(e.target.value === 'veg')}
                  className="w-full px-3 py-2 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#A8988B] mb-1">
                Image Web URL
              </label>
              <input
                type="url"
                required
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14100E] border border-[#C5A880]/30 text-xs text-[#FBF8F3]"
              />
            </div>

            <div className="flex items-center gap-6 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formPopular}
                  onChange={(e) => setFormPopular(e.target.checked)}
                  className="rounded text-[#C5A880]"
                />
                <span>Signature Item</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formAvailable}
                  onChange={(e) => setFormAvailable(e.target.checked)}
                  className="rounded text-[#C5A880]"
                />
                <span>Currently Available</span>
              </label>
            </div>

            <div className="pt-3 border-t border-[#C5A880]/15 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddMode(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#2A211C] text-xs font-semibold text-[#A8988B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#C5A880] hover:bg-[#D4B68D] text-[#14100E] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Save Menu Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
