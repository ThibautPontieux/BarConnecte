import { create } from 'zustand';
import type { Order } from '../types';
import { PublicApiService } from '../services/publicApi';
import { AdminApiService } from '../services/adminApi';
import type { CreateOrderRequest, OrderResponse } from '../services/types';

interface OrderStore {
  orders: Order[];
  loading: boolean;
  error: string | null;
  
  // Méthodes Client
  addOrder: (order: Omit<Order, 'id' | 'timestamp'>) => Promise<string>;
  getOrderById: (orderId: number) => Promise<Order | null>;
  
  // Méthodes Barman/Admin
  fetchPendingOrders: () => Promise<void>;
  acceptOrder: (orderId: number) => Promise<void>;
  rejectOrder: (orderId: number) => Promise<void>;
  markOrderReady: (orderId: number) => Promise<void>;
  completeOrder: (orderId: number) => Promise<void>;
  
  // Méthodes utilitaires
  updateOrderStatus: (orderId: number, status: 'pending' | 'accepted' | 'rejected' | 'ready' | 'completed') => void;
  getPendingOrders: () => Order[];
  getOrdersByStatus: (status: string) => Order[];
  clearError: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  // === MÉTHODES CLIENT ===
  
  addOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      console.log('📝 Création commande avec données:', orderData);
      
      // Convertir vers le nouveau format API manuellement
      const createOrderRequest: CreateOrderRequest = {
        customerName: orderData.customerName,
        items: orderData.items.map(item => ({
          drinkId: item.id,
          quantity: item.quantity
        }))
      };
      
      console.log('📡 Envoi vers API:', createOrderRequest);
      
      // Appeler l'API
      const result = await PublicApiService.createOrder(createOrderRequest);
      console.log('✅ Réponse API:', result);
      
      // Convertir la réponse vers le format local
      const newOrder: Order = {
        id: result.id,
        items: orderData.items, // On garde les items du panier local
        total: result.totalAmount,
        status: result.status as 'pending' | 'accepted' | 'rejected' | 'ready' | 'completed',
        customerName: result.customerName,
        timestamp: new Date(result.createdAt),
      };
      
      // Ajouter à la liste locale
      set((state) => ({
        orders: [...state.orders, newOrder],
        loading: false,
      }));
      
      return result.id.toString();
      
    } catch (error) {
      console.error('❌ Erreur création commande:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de la commande';
      set({ 
        error: errorMessage,
        loading: false 
      });
      throw new Error(errorMessage);
    }
  },

  getOrderById: async (orderId: number) => {
    try {
      set({ loading: true, error: null });
      console.log('🔍 Recherche commande:', orderId);
      
      const orderResponse = await PublicApiService.getOrderById(orderId);
      console.log('📦 Commande trouvée:', orderResponse);
      
      // Convertir vers le format local
      const order: Order = {
        id: orderResponse.id,
        items: orderResponse.items.map((item, index) => ({
          id: Date.now() + index, // ID temporaire
          name: item.drinkName,
          price: item.unitPrice,
          stock: 0, // Non disponible dans la réponse
          category: 'Unknown',
          quantity: item.quantity,
        })),
        total: orderResponse.totalAmount,
        status: orderResponse.status as 'pending' | 'accepted' | 'rejected' | 'ready' | 'completed',
        customerName: orderResponse.customerName,
        timestamp: new Date(orderResponse.createdAt),
      };
      
      set({ loading: false });
      return order;
      
    } catch (error) {
      console.error('❌ Erreur récupération commande:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération de la commande',
        loading: false 
      });
      return null;
    }
  },

  // === MÉTHODES BARMAN/ADMIN ===
  
  fetchPendingOrders: async () => {
    set({ loading: true, error: null });
    try {
      console.log('📋 Récupération des commandes en attente...');
      const orderResponses = await AdminApiService.getPendingOrders();
      console.log('📊 Commandes reçues:', orderResponses.length);
      
      // Convertir les OrderResponse vers Order local
      const orders: Order[] = orderResponses.map((orderResponse, index) => ({
        id: orderResponse.id,
        items: orderResponse.items.map((item, itemIndex) => ({
          id: Date.now() + index + itemIndex, // ID temporaire unique
          name: item.drinkName,
          price: item.unitPrice,
          stock: 0, // Non disponible dans la réponse
          category: 'Unknown',
          quantity: item.quantity,
        })),
        total: orderResponse.totalAmount,
        status: 'pending', // Les commandes pending sont forcément en attente
        customerName: orderResponse.customerName,
        timestamp: new Date(orderResponse.createdAt),
      }));
      
      set({ 
        orders,
        loading: false 
      });
      
    } catch (error) {
      console.error('❌ Erreur récupération commandes:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des commandes',
        loading: false 
      });
    }
  },

  acceptOrder: async (orderId: number) => {
    try {
      console.log('✅ Acceptation commande:', orderId);
      const updatedOrder = await AdminApiService.acceptOrder(orderId);
      
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId 
            ? { ...order, status: updatedOrder.status as 'accepted' }
            : order
        ),
      }));
      
    } catch (error) {
      console.error('❌ Erreur acceptation commande:', error);
      set({ error: error instanceof Error ? error.message : 'Erreur lors de l\'acceptation de la commande' });
    }
  },

  rejectOrder: async (orderId: number) => {
    try {
      console.log('❌ Refus commande:', orderId);
      const updatedOrder = await AdminApiService.rejectOrder(orderId);
      
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId 
            ? { ...order, status: updatedOrder.status as 'rejected' }
            : order
        ),
      }));
      
    } catch (error) {
      console.error('❌ Erreur refus commande:', error);
      set({ error: error instanceof Error ? error.message : 'Erreur lors du refus de la commande' });
    }
  },

  markOrderReady: async (orderId: number) => {
    try {
      console.log('📦 Commande prête:', orderId);
      const updatedOrder = await AdminApiService.markOrderReady(orderId);
      
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId 
            ? { ...order, status: updatedOrder.status as 'ready' }
            : order
        ),
      }));
      
    } catch (error) {
      console.error('❌ Erreur marquage prêt:', error);
      set({ error: error instanceof Error ? error.message : 'Erreur lors du marquage comme prête' });
    }
  },

  completeOrder: async (orderId: number) => {
    try {
      console.log('🏁 Finalisation commande:', orderId);
      const updatedOrder = await AdminApiService.completeOrder(orderId);
      
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId 
            ? { ...order, status: updatedOrder.status as 'completed' }
            : order
        ),
      }));
      
    } catch (error) {
      console.error('❌ Erreur finalisation commande:', error);
      set({ error: error instanceof Error ? error.message : 'Erreur lors de la finalisation de la commande' });
    }
  },

  // === MÉTHODES UTILITAIRES ===
  
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

  getOrdersByStatus: (status: string) => {
    const { orders } = get();
    return orders.filter((order) => order.status === status);
  },

  clearError: () => set({ error: null }),
}));
