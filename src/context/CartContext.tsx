'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { OrderItem, OrderType } from '@/types';

interface CartContextType {
  items: OrderItem[];
  addItem: (item: Omit<OrderItem, 'quantity'>, quantity?: number, notes?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  tableNumber: string | null;
  setTableNumber: (table: string | null) => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumberState] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount & check URL params
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('nb_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedTable = localStorage.getItem('nb_table');
      if (savedTable) {
        setTableNumberState(savedTable);
      }
      const savedType = localStorage.getItem('nb_order_type') as OrderType;
      if (savedType) {
        setOrderType(savedType);
      }

      // Check URL query parameters for table detection (QR scan e.g., ?table=04 or ?table=T-04)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlTable = params.get('table');
        if (urlTable) {
          const cleanTable = urlTable.replace(/^T-?/i, '').padStart(2, '0');
          setTableNumberState(cleanTable);
          localStorage.setItem('nb_table', cleanTable);
          setOrderType('dine-in');
          localStorage.setItem('nb_order_type', 'dine-in');
        }
      }
    } catch {
      // LocalStorage fallback
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('nb_cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, isHydrated]);

  const setTableNumber = (num: string | null) => {
    setTableNumberState(num);
    if (num) {
      localStorage.setItem('nb_table', num);
    } else {
      localStorage.removeItem('nb_table');
    }
  };

  const addItem = (item: Omit<OrderItem, 'quantity'>, quantity: number = 1, notes?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + quantity, notes: notes || i.notes }
            : i
        );
      }
      return [...prev, { ...item, quantity, notes }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (menuItemId: string) => {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem('nb_cart');
    } catch {
      // ignore
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cgst = Math.round(subtotal * 0.025 * 100) / 100;
  const sgst = Math.round(subtotal * 0.025 * 100) / 100;
  const grandTotal = Math.round((subtotal + cgst + sgst) * 100) / 100;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        tableNumber,
        setTableNumber,
        orderType,
        setOrderType,
        subtotal,
        cgst,
        sgst,
        grandTotal,
        itemCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
