import { create } from 'zustand';
import type { CartItem, Product } from '../types';

interface CartStore {
  cart: CartItem[];
  customerName: string;
  addToCart: (product: Product) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  setCustomerName: (name: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],
  customerName: '',
  addToCart: (product) =>
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
              : item
          ),
        };
      } else {
        return {
          cart: [...state.cart, { ...product, quantity: 1 }],
        };
      }
    }),
  updateQuantity: (id, quantity) =>
    set((state) => ({
      cart: quantity === 0
        ? state.cart.filter((item) => item.id !== id)
        : state.cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
    })),
  clearCart: () => set({ cart: [], customerName: '' }),
  setCustomerName: (name) => set({ customerName: name }),
  getTotalPrice: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
  getTotalItems: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
