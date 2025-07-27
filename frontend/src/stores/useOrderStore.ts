import { create } from 'zustand';
import type { Order } from '../types';
import { PublicApiService } from '../services/publicApi';
import { DrinkMapper } from '../services/mappers';

interface OrderStore {
  orders: Order[];
  loading: boolean;
  error: string | null;
  
  addOrder: (order: Omit<Order, 'id' | 'timestamp'>) => Promise<string>;
  updateOrderStatus: (orderId: number, status: 'accepted' | 'rejected') => void;
  getPendingOrders: () => Order[];
  clearError: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  addOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const orderDto = DrinkMapper.cartToOrderDto(orderData.items, orderData.customerName);
      const result = await PublicApiService.createOrder(orderDto);
      
      // Ajouter à la liste locale
      const newOrder: Order = {
        ...orderData,
        id: Date.now(),
        timestamp: new Date(),
      };
      
      set((state) => ({
        orders: [...state.orders, newOrder],
        loading: false,
      }));
      
      return result;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création de la commande',
        loading: false 
      });
      throw error;
    }
  },

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    })),

  getPendingOrders: () => {
    const { orders } = get();
    return orders.filter((order) => order.status === 'pending');
  },

  clearError: () => set({ error: null }),
}));
