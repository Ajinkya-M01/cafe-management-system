'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  X,
  LayoutGrid,
  List,
  Utensils,
  Leaf,
  Layers,
  AlertTriangle,
  Flame,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonMenuCard, SkeletonTableRow } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';

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
  const [dietaryFilter, setDietaryFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | 'Available' | 'SoldOut'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCat, setFormCat] = useState<Category>('Coffee');
  const [formPrice, setFormPrice] = useState<number>(350);
  const [formImage, setFormImage] = useState('');
  const [formVeg, setFormVeg] = useState(true);
  const [formPopular, setFormPopular] = useState(false);
  const [formAvailable, setFormAvailable] = useState(true);
  const [formPrep, setFormPrep] = useState<number>(8);

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

  // Stats calculation
  const stats = useMemo(() => {
    const total = items.length;
    const available = items.filter((i) => i.isAvailable).length;
    const vegCount = items.filter((i) => i.isVeg).length;
    const signatures = items.filter((i) => i.isPopular).length;
    return { total, available, vegCount, signatures };
  }, [items]);

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
    setIsSubmitting(true);

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
          await fetchMenuItems();
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
          await fetchMenuItems();
        } else {
          alert(data.error || 'Failed to update item');
        }
      }
    } catch (err) {
      console.error('Error saving item:', err);
    } finally {
      setIsSubmitting(false);
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
        // Optimistic local update
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i))
        );
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/menu?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmId(null);
        await fetchMenuItems();
      } else {
        alert(data.error || 'Failed to delete item');
      }
    } catch {
      alert('Error deleting menu item');
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCat !== 'All' && item.category !== selectedCat) return false;
      if (dietaryFilter === 'Veg' && !item.isVeg) return false;
      if (dietaryFilter === 'Non-Veg' && item.isVeg) return false;
      if (availabilityFilter === 'Available' && !item.isAvailable) return false;
      if (availabilityFilter === 'SoldOut' && item.isAvailable) return false;

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
  }, [items, selectedCat, dietaryFilter, availabilityFilter, search]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCat('All');
    setDietaryFilter('All');
    setAvailabilityFilter('All');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        eyebrow="Culinary Offerings &amp; Recipe Inventory"
        title="Menu Catalog"
        action={
          hasRole(['ADMIN', 'MANAGER']) ? (
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#dfc8a5] text-[#1a1412] text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          ) : undefined
        }
      />

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2a211c] border border-[#c5a880]/20 flex items-center justify-center shrink-0">
            <Utensils className="w-5 h-5 text-[#c5a880]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#a8988b]">Total Items</div>
            <div className="font-serif text-xl text-[#f9f6f1]">{loading ? '—' : stats.total}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#a8988b]">In Stock</div>
            <div className="font-serif text-xl text-emerald-400">{loading ? '—' : stats.available}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-950/40 border border-green-500/25 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#a8988b]">Vegetarian</div>
            <div className="font-serif text-xl text-[#f9f6f1]">{loading ? '—' : stats.vegCount}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2a211c] border border-[#c5a880]/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#c5a880]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#a8988b]">Signatures</div>
            <div className="font-serif text-xl text-[#c5a880]">{loading ? '—' : stats.signatures}</div>
          </div>
        </div>
      </div>

      {/* Control Panel: Search, Filters & View Mode */}
      <div className="p-4 rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7a6d]" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/25 text-xs text-[#f9f6f1] placeholder-[#7f7065] focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8988b] hover:text-[#f9f6f1]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Secondary Filters & View Switcher */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Dietary */}
            <select
              aria-label="Filter by dietary type"
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value as 'All' | 'Veg' | 'Non-Veg')}
              className="px-3 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/25 text-xs text-[#d8ccbd] focus:outline-none focus:border-[#c5a880]"
            >
              <option value="All">All Diets</option>
              <option value="Veg">Vegetarian Only</option>
              <option value="Non-Veg">Non-Veg Only</option>
            </select>

            {/* Availability */}
            <select
              aria-label="Filter by availability"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as 'All' | 'Available' | 'SoldOut')}
              className="px-3 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/25 text-xs text-[#d8ccbd] focus:outline-none focus:border-[#c5a880]"
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="SoldOut">Sold Out</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-[#171311] border border-[#c5a880]/25 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#c5a880] text-[#1a1412]' : 'text-[#a8988b] hover:text-[#f9f6f1]'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#c5a880] text-[#1a1412]' : 'text-[#a8988b] hover:text-[#f9f6f1]'
                }`}
                title="Table View"
                aria-label="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Chips with Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {(['All', ...CATEGORIES] as ('All' | Category)[]).map((cat) => {
            const count = cat === 'All' ? items.length : items.filter((i) => i.category === cat).length;
            const isSelected = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#c5a880] text-[#1a1412] shadow-xs'
                    : 'bg-[#171311] text-[#a8988b] border border-[#c5a880]/20 hover:text-[#f9f6f1] hover:border-[#c5a880]/40'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-[#1a1412]/20 text-[#1a1412]' : 'bg-[#2a211c] text-[#a8988b]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Display */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonMenuCard key={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Prep</th>
                  <th>Diet</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonTableRow key={i} cols={7} />
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Utensils className="w-10 h-10 text-[#c5a880]" />}
          title="No menu items match your criteria"
          description="Try adjusting your search terms or clearing the selected category and dietary filters."
          action={
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-[#c5a880] text-[#1a1412] text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#dfc8a5] transition-colors"
            >
              Reset All Filters
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between group ${
                item.isAvailable
                  ? 'bg-[#1f1815] border-[#c5a880]/20 hover:border-[#c5a880]/50 hover:shadow-lg'
                  : 'bg-[#1f1815]/50 border-gray-800 opacity-60'
              }`}
            >
              <div>
                {/* Photo & Badges */}
                <div className="relative h-48 w-full rounded-xl overflow-hidden mb-3.5 bg-[#2a211c]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-md ${
                        item.isVeg
                          ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
                          : 'bg-red-950/80 border border-red-500/30 text-red-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span>{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded-full bg-black/60 border border-[#c5a880]/30 text-[10px] text-[#c5a880] font-medium backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>

                  {item.isPopular && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#c5a880] text-[#1a1412] text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <Flame className="w-3 h-3" />
                      <span>Signature</span>
                    </div>
                  )}

                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-2xs flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-red-950/90 border border-red-500/40 text-red-300 text-xs font-bold tracking-wider uppercase">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* Prep Time in bottom right */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] text-[#d8ccbd] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#c5a880]" />
                    <span>{item.preparationTime}m</span>
                  </div>
                </div>

                {/* Title & Price */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-serif text-lg font-medium text-[#f9f6f1] group-hover:text-[#c5a880] transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <span className="font-bold text-[#c5a880] text-base shrink-0">
                    ₹{item.price}
                  </span>
                </div>

                <p className="text-xs text-[#a8988b] line-clamp-2 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#c5a880]/15 flex items-center justify-between">
                {/* Availability Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleAvailability(item)}
                  className={`text-xs flex items-center gap-2 cursor-pointer font-medium px-2.5 py-1 rounded-lg transition-colors ${
                    item.isAvailable
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-900/40'
                      : 'bg-amber-950/40 text-amber-300 border border-amber-500/25 hover:bg-amber-900/40'
                  }`}
                  title={item.isAvailable ? 'Click to mark Sold Out' : 'Click to mark Available'}
                >
                  <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>{item.isAvailable ? 'Available' : 'Sold Out'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {hasRole(['ADMIN', 'MANAGER']) && (
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-xl bg-[#2a211c] hover:bg-[#342a24] text-[#c5a880] hover:text-[#dfc8a5] transition-colors cursor-pointer"
                      title="Edit Item"
                      aria-label={`Edit ${item.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {hasRole('ADMIN') && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-2 rounded-xl bg-[#2a211c] hover:bg-red-950/60 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      title="Delete Item"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-[#1f1815] border border-[#c5a880]/15 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Prep Time</th>
                  <th>Diet</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-[#2a211c]">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-medium text-[#f9f6f1] flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {item.isPopular && <Sparkles className="w-3 h-3 text-[#c5a880]" />}
                          </div>
                          <div className="text-[11px] text-[#a8988b] line-clamp-1">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-[#c5a880] font-medium">{item.category}</span>
                    </td>
                    <td>
                      <span className="font-bold text-[#f9f6f1]">₹{item.price}</span>
                    </td>
                    <td>
                      <span className="text-[#d8ccbd]">{item.preparationTime} mins</span>
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.isVeg
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-950/60 text-red-300 border border-red-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span>{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          item.isAvailable
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/25'
                            : 'bg-amber-950/40 text-amber-300 border border-amber-500/25'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span>{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasRole(['ADMIN', 'MANAGER']) && (
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg bg-[#2a211c] hover:bg-[#342a24] text-[#c5a880] cursor-pointer"
                            title="Edit dish"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {hasRole('ADMIN') && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-lg bg-[#2a211c] hover:bg-red-950/60 text-red-400 cursor-pointer"
                            title="Delete dish"
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={() => setDeleteConfirmId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-[#1f1815] border border-[#ef4444]/40 rounded-3xl max-w-md w-full p-6 text-[#f9f6f1] shadow-2xl space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#f9f6f1]">Remove from Menu?</h3>
                <p className="text-xs text-[#a8988b]">
                  This item will be permanently removed from all ordering catalogs.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#c5a880]/15">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#2a211c] hover:bg-[#342a24] text-xs font-semibold text-[#d8ccbd] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(isAddMode || editingItem) && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={() => {
            setIsAddMode(false);
            setEditingItem(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveItem}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1f1815] border border-[#c5a880]/30 rounded-3xl max-w-xl w-full p-6 text-[#f9f6f1] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#c5a880]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#2a211c] border border-[#c5a880]/30 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-[#c5a880]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#f9f6f1]">
                    {isAddMode ? 'Add New Menu Item' : 'Edit Menu Item'}
                  </h3>
                  <p className="text-[11px] text-[#a8988b]">Update recipe details, pricing &amp; dietary specs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddMode(false);
                  setEditingItem(null);
                }}
                className="p-1.5 rounded-lg text-[#a8988b] hover:text-[#f9f6f1] hover:bg-[#2a211c] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smoked Bourbon Cold Brew"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                  Category *
                </label>
                <select
                  value={formCat}
                  onChange={(e) => setFormCat(e.target.value as Category)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                Description &amp; Notes
              </label>
              <textarea
                rows={2}
                placeholder="Describe aroma notes, ingredients, and preparation nuance..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            {/* Price, Prep Time, Diet */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                  Prep (Mins)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formPrep}
                  onChange={(e) => setFormPrep(Number(e.target.value) || 5)}
                  className="w-full px-3 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                  Diet Type
                </label>
                <select
                  value={formVeg ? 'veg' : 'non-veg'}
                  onChange={(e) => setFormVeg(e.target.value === 'veg')}
                  className="w-full px-3 py-2 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Veg</option>
                </select>
              </div>
            </div>

            {/* Image URL with live preview */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#d8ccbd] font-medium mb-1">
                Image Web URL *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#171311] border border-[#c5a880]/30 text-xs text-[#f9f6f1] focus:outline-none focus:border-[#c5a880]"
                />
                {formImage && (
                  <div className="relative w-12 h-10 rounded-lg overflow-hidden shrink-0 border border-[#c5a880]/30 bg-[#2a211c]">
                    <Image
                      src={formImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Toggles: Signature & Availability */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#171311] border border-[#c5a880]/20 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formPopular}
                  onChange={(e) => setFormPopular(e.target.checked)}
                  className="rounded text-[#c5a880] accent-[#c5a880]"
                />
                <div>
                  <div className="text-xs font-semibold text-[#f9f6f1]">Signature Dish</div>
                  <div className="text-[10px] text-[#a8988b]">Highlighted on main menu</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#171311] border border-[#c5a880]/20 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formAvailable}
                  onChange={(e) => setFormAvailable(e.target.checked)}
                  className="rounded text-[#c5a880] accent-[#c5a880]"
                />
                <div>
                  <div className="text-xs font-semibold text-[#f9f6f1]">Ready to Serve</div>
                  <div className="text-[10px] text-[#a8988b]">Available for ordering</div>
                </div>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#c5a880]/15 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsAddMode(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#2a211c] hover:bg-[#342a24] text-xs font-semibold text-[#a8988b] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#dfc8a5] text-[#1a1412] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isAddMode ? 'Create Recipe' : 'Save Changes'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
