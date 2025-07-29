import { create } from 'zustand';
import type { Order, OrderStatus } from '../types';
import { PublicApiService } from '../services/publicApi';
import { AdminApiService } from '../services/adminApi';
import type { CreateOrderRequest, OrderResponse } from '../services/types';
import { extractErrorMessage, getUserFriendlyMessage } from '../utils/errorHandling';

interface OrderStore {
  orders: Order[];
  ordersByStatus: {
    pending: Order[];
    accepted: Order[];
    rejected: Order[];
    ready: Order[];
    completed: Order[];
  };
  loading: boolean;
  error: string | null;
  
  // Méthodes Client
  addOrder: (order: Omit<Order, 'id' | 'timestamp'>) => Promise<string>;
  getOrderById: (orderId: number) => Promise<Order | null>;
  
  // Méthodes Barman/Admin - Nouvelles avec route générique
  fetchOrdersByStatus: (status: 'pending' | 'accepted' | 'rejected' | 'ready' | 'completed') => Promise<void>;
  fetchAllOrders: () => Promise<void>;
  refreshOrdersData: () => Promise<void>;
  
  // Actions sur les commandes
  acceptOrder: (orderId: number) => Promise<void>;
  rejectOrder: (orderId: number) => Promise<void>;
  markOrderReady: (orderId: number) => Promise<void>;
  completeOrder: (orderId: number) => Promise<void>;
  
  // Méthodes utilitaires
  updateOrderStatus: (orderId: number, status: 'pending' | 'accepted' | 'rejected' | 'ready' | 'completed') => void;
  getPendingOrders: () => Order[];
  getOrdersByStatus: (status: string) => Order[];
  getAllOrdersFlat: () => Order[];
  getOrdersStats: () => { total: number; pending: number; accepted: number; ready: number; completed: number; rejected: number };
  clearError: () => void;
}

// Fonction utilitaire pour s'assurer que ordersByStatus est bien initialisé
const ensureOrdersByStatusStructure = (ordersByStatus: any) => {
  const defaultStructure = {
    pending: [],
    accepted: [],
    rejected: [],
    ready: [],
    completed: [],
  };

  return {
    pending: Array.isArray(ordersByStatus?.pending) ? ordersByStatus.pending : [],
    accepted: Array.isArray(ordersByStatus?.accepted) ? ordersByStatus.accepted : [],
    rejected: Array.isArray(ordersByStatus?.rejected) ? ordersByStatus.rejected : [],
    ready: Array.isArray(ordersByStatus?.ready) ? ordersByStatus.ready : [],
    completed: Array.isArray(ordersByStatus?.completed) ? ordersByStatus.completed : [],
  };
};

// Fonction utilitaire pour convertir OrderResponse vers Order
const convertOrderResponse = (orderResponse: OrderResponse, index: number = 0): Order => {
  console.log('🔄 Conversion OrderResponse:', {
    id: orderResponse.id,
    status: orderResponse.status,
    statusType: typeof orderResponse.status,
    customerName: orderResponse.customerName
  });

  // Normaliser le statut (enlever espaces, mettre en minuscules)
  const normalizedStatus = orderResponse.status?.toString().trim().toLowerCase();
  
  // Mapper les statuts possibles
  const statusMapping: { [key: string]: Order['status'] } = {
    'pending': 'pending',
    'accepted': 'accepted',
    'rejected': 'rejected',
    'ready': 'ready',
    'completed': 'completed',
    // Autres variantes possibles
    'en_attente': 'pending',
    'acceptee': 'accepted',
    'refusee': 'rejected',
    'prete': 'ready',
    'terminee': 'completed',
  };

  const mappedStatus = statusMapping[normalizedStatus] || 'pending';
  
  console.log('📍 Status mapping:', {
    original: orderResponse.status,
    normalized: normalizedStatus,
    mapped: mappedStatus
  });

  return {
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
    status: mappedStatus,
    customerName: orderResponse.customerName,
    timestamp: new Date(orderResponse.createdAt),
  };
};

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  ordersByStatus: {
    pending: [],
    accepted: [],
    rejected: [],
    ready: [],
    completed: [],
  },
  loading: false,
  error: null,

  // === MÉTHODES CLIENT ===
  
  addOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      console.log('📝 Création commande avec données:', orderData);
      
      // Convertir vers le nouveau format API
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
      
      // Ajouter à la liste locale et dans le bon statut
      set((state) => {
        console.log('📝 Ajout commande à l\'état:', {
          newOrderStatus: newOrder.status,
          currentOrdersByStatus: state.ordersByStatus,
          existingStatusArray: state.ordersByStatus[newOrder.status]
        });

        // Vérifier que le tableau pour ce statut existe
        const currentStatusOrders = state.ordersByStatus[newOrder.status] || [];
        
        return {
          orders: [...state.orders, newOrder],
          ordersByStatus: {
            ...state.ordersByStatus,
            [newOrder.status]: [...currentStatusOrders, newOrder],
          },
          loading: false,
        };
      });
      
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
      
      const order = convertOrderResponse(orderResponse);
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

  // === NOUVELLES MÉTHODES AVEC ROUTE GÉNÉRIQUE ===
  
  fetchOrdersByStatus: async (status) => {
    set({ loading: true, error: null });
    try {
      console.log(`📋 Récupération des commandes ${status}...`);
      const orderResponses = await AdminApiService.getOrdersByStatus(status);
      console.log(`📊 ${orderResponses.length} commandes ${status} reçues`);
      
      // Convertir les OrderResponse vers Order local
      const orders: Order[] = orderResponses.map((orderResponse, index) => 
        convertOrderResponse(orderResponse, index)
      );
      
      set((state) => ({
        ordersByStatus: {
          ...state.ordersByStatus,
          [status]: orders,
        },
        loading: false,
      }));
      
    } catch (error) {
      console.error(`❌ Erreur récupération commandes ${status}:`, error);
      set({ 
        error: error instanceof Error ? error.message : `Erreur lors de la récupération des commandes ${status}`,
        loading: false 
      });
    }
  },

  fetchAllOrders: async () => {
    set({ loading: true, error: null });
    try {
      console.log('📋 Récupération de toutes les commandes...');
      
      // Récupérer toutes les commandes par statut en parallèle
      const [pending, accepted, ready, completed, rejected] = await Promise.all([
        AdminApiService.getOrdersByStatus('pending'),
        AdminApiService.getOrdersByStatus('accepted'),
        AdminApiService.getOrdersByStatus('ready'),
        AdminApiService.getOrdersByStatus('completed'),
        AdminApiService.getOrdersByStatus('rejected'),
      ]);

      // Convertir toutes les réponses
      const ordersByStatus = {
        pending: pending.map((order, index) => convertOrderResponse(order, index)),
        accepted: accepted.map((order, index) => convertOrderResponse(order, index + 1000)),
        ready: ready.map((order, index) => convertOrderResponse(order, index + 2000)),
        completed: completed.map((order, index) => convertOrderResponse(order, index + 3000)),
        rejected: rejected.map((order, index) => convertOrderResponse(order, index + 4000)),
      };

      // Créer la liste plate pour compatibility
      const allOrders = [
        ...ordersByStatus.pending,
        ...ordersByStatus.accepted,
        ...ordersByStatus.ready,
        ...ordersByStatus.completed,
        ...ordersByStatus.rejected,
      ];

      console.log(`📊 Total commandes récupérées: ${allOrders.length}`);
      
      set({
        orders: allOrders,
        ordersByStatus: ensureOrdersByStatusStructure(ordersByStatus),
        loading: false,
      });
      
    } catch (error) {
      console.error('❌ Erreur récupération toutes commandes:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des commandes',
        loading: false 
      });
    }
  },

  refreshOrdersData: async () => {
    const { fetchAllOrders } = get();
    await fetchAllOrders();
  },

  // === ACTIONS SUR LES COMMANDES ===
  
  acceptOrder: async (orderId: number) => {
    set({ error: null }); // Reset de l'erreur précédente

    try {
      console.log('✅ Acceptation commande:', orderId);
      const updatedOrder = await AdminApiService.acceptOrder(orderId);
      
      set((state) => {
        // Assurer la structure et obtenir les listes
        const safeOrdersByStatus = ensureOrdersByStatusStructure(state.ordersByStatus);
        const pendingOrders = safeOrdersByStatus.pending.filter(order => order.id !== orderId);
        const orderToMove = safeOrdersByStatus.pending.find(order => order.id === orderId);
        
        if (orderToMove) {
          const updatedOrderLocal = { ...orderToMove, status: 'accepted' as const };
          
          return {
            orders: state.orders.map(order => 
              order.id === orderId ? updatedOrderLocal : order
            ),
            ordersByStatus: {
              ...safeOrdersByStatus,
              pending: pendingOrders,
              accepted: [...safeOrdersByStatus.accepted, updatedOrderLocal],
            },
          };
        }
        
        return state;
      });
      
    } catch (error) {
      console.error('❌ Erreur acceptation commande:', error);
      const errorMessage = getUserFriendlyMessage(error);
      set({ error: errorMessage });
      
      // Si c'est une erreur de stock, on peut proposer des actions spécifiques
      if (errorMessage.toLowerCase().includes('stock')) {
        // Optionnel: déclencher un refresh des produits pour voir les stocks actuels
        console.log('🔄 Erreur de stock détectée, refresh recommandé');
      }
    }
  },

  rejectOrder: async (orderId: number) => {
    set({ error: null });
    
    try {
      console.log('❌ Refus commande:', orderId);
      const updatedOrder = await AdminApiService.rejectOrder(orderId);
      
      set((state) => {
        const safeOrdersByStatus = ensureOrdersByStatusStructure(state.ordersByStatus);
        const pendingOrders = safeOrdersByStatus.pending.filter(order => order.id !== orderId);
        const orderToMove = safeOrdersByStatus.pending.find(order => order.id === orderId);
        
        if (orderToMove) {
          const updatedOrderLocal = { ...orderToMove, status: 'rejected' as const };
          
          return {
            orders: state.orders.map(order => 
              order.id === orderId ? updatedOrderLocal : order
            ),
            ordersByStatus: {
              ...safeOrdersByStatus,
              pending: pendingOrders,
              rejected: [...safeOrdersByStatus.rejected, updatedOrderLocal],
            },
          };
        }
        
        return state;
      });
      
    } catch (error) {
      console.error('❌ Erreur refus commande:', error);
      const errorMessage = getUserFriendlyMessage(error);
      set({ error: errorMessage });
    }
  },

  markOrderReady: async (orderId: number) => {
    set({ error: null });
    
    try {
      console.log('📦 Commande prête:', orderId);
      const updatedOrder = await AdminApiService.markOrderReady(orderId);
      
      set((state) => {
        const safeOrdersByStatus = ensureOrdersByStatusStructure(state.ordersByStatus);
        const acceptedOrders = safeOrdersByStatus.accepted.filter(order => order.id !== orderId);
        const orderToMove = safeOrdersByStatus.accepted.find(order => order.id === orderId);
        
        if (orderToMove) {
          const updatedOrderLocal = { ...orderToMove, status: 'ready' as const };
          
          return {
            orders: state.orders.map(order => 
              order.id === orderId ? updatedOrderLocal : order
            ),
            ordersByStatus: {
              ...safeOrdersByStatus,
              accepted: acceptedOrders,
              ready: [...safeOrdersByStatus.ready, updatedOrderLocal],
            },
          };
        }
        
        return state;
      });
      
    } catch (error) {
      console.error('❌ Erreur marquage prêt:', error);
      const errorMessage = getUserFriendlyMessage(error);
      set({ error: errorMessage });
    }
  },

  completeOrder: async (orderId: number) => {
    set({ error: null });
    
    try {
      console.log('🏁 Finalisation commande:', orderId);
      const updatedOrder = await AdminApiService.completeOrder(orderId);
      
      set((state) => {
        const safeOrdersByStatus = ensureOrdersByStatusStructure(state.ordersByStatus);
        const readyOrders = safeOrdersByStatus.ready.filter(order => order.id !== orderId);
        const orderToMove = safeOrdersByStatus.ready.find(order => order.id === orderId);
        
        if (orderToMove) {
          const updatedOrderLocal = { ...orderToMove, status: 'completed' as const };
          
          return {
            orders: state.orders.map(order => 
              order.id === orderId ? updatedOrderLocal : order
            ),
            ordersByStatus: {
              ...safeOrdersByStatus,
              ready: readyOrders,
              completed: [...safeOrdersByStatus.completed, updatedOrderLocal],
            },
          };
        }
        
        return state;
      });
      
    } catch (error) {
      console.error('❌ Erreur finalisation commande:', error);
      const errorMessage = getUserFriendlyMessage(error);
      set({ error: errorMessage });
    }
  },

  // === MÉTHODES UTILITAIRES ===

  // Nettoyer les erreurs
  clearError: () => {
    set({ error: null });
  },

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    })),

  getPendingOrders: () => {
    const { ordersByStatus } = get();
    return ordersByStatus.pending;
  },

  getOrdersByStatus: (status: string) => {
    const { ordersByStatus } = get();
    const safeOrdersByStatus = ensureOrdersByStatusStructure(ordersByStatus);
    return safeOrdersByStatus[status as keyof typeof safeOrdersByStatus] || [];
  },

  getAllOrdersFlat: () => {
    const { orders } = get();
    return orders;
  },

  getOrdersStats: () => {
    const { ordersByStatus } = get();
    return {
      pending: ordersByStatus.pending.length,
      accepted: ordersByStatus.accepted.length,
      ready: ordersByStatus.ready.length,
      completed: ordersByStatus.completed.length,
      rejected: ordersByStatus.rejected.length,
      total: Object.values(ordersByStatus).flat().length,
    };
  },
}));
