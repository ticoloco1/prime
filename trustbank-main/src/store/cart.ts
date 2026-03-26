'use client';
import { create } from 'zustand';

export interface CartItem {
  id: string;
  label: string;
  price: number;
  type: 'plan' | 'slug' | 'boost';
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  total: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  add: (item) => {
    if (get().items.find(i => i.id === item.id)) {
      set({ isOpen: true });
      return;
    }
    set(s => ({ items: [...s.items, item], isOpen: true }));
  },
  remove: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
  clear: () => set({ items: [] }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  total: () => get().items.reduce((sum, i) => sum + i.price, 0),
}));
