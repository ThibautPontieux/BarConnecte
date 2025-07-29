import { create } from 'zustand';
import type { 
  Order, 
  StockCheckResult, 
  EditOrderRequest, 
  AcceptPartialOrderRequest, 
  ModifyQuantitiesRequest,
  OrderEditSuggestions 
} from '../types/Order';
import { PublicApiService } from '../services/publicApi';
import { AdminApiService } from '../services/adminApi';
import { OrderEditingApiService } from '../services/orderEditingApi';
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
  
  // === NOUVEL ÉTAT POUR L'ÉDITION ===
  stockCheckResults: Record<number, StockCheckResult>; // orderId -> StockCheckResult
  editingSuggestions: Record<number, OrderEditSuggestions>; // orderId -> Suggestions
  editingOrder: Order | null; // Commande en cours d'édition
  stockCheckLoading: boolean;
  editingLoading: boolean;
  
  // === MÉTHODES EXISTANTES ===
  addOrder: (order: Omit<Order, 'id' | 'timestamp'>) => Promise<string>;
  getOrderById: (orderId: number) => Promise<Order | null>;
  fetchOrdersByStatus: (status: 'pending' | 'accepted' | 'rejected' | 'ready' | 'completed') => Promise<void>;
  fetchAllOrders: () => Promise<void>;
  refreshOrdersData: () => Promise<void>;
  acceptOrder: (orderId: number) => Promise<void>;
  rejectOrder: (orderId: number) => Promise<void>;
  markOrderReady: (orderId: number) => Promise<void>;
  completeOrder: (orderId: number) => Promise<void>;
  
  // === NOUVELLES MÉTHODES POUR L'ÉDITION ===
  
  // Vérification de stock
  checkOrderStock: (orderId: number) => Promise<StockCheckResult>;
  getStockCheckResult: (orderId: number) => StockCheckResult | null;
  clearStockCheck: (orderId: number) => void;
  
  // Suggestions d'édition
  getOrderEditSuggestions: (orderId: number) => Promise<OrderEditSuggestions>;
  getSuggestions: (orderId: number) => OrderEditSuggestions | null;
  
  // Édition de commandes
  editOrder: (orderId: number, editRequest: EditOrderRequest) => Promise<void>;
  acceptPartialOrder: (orderId: number, acceptRequest: AcceptPartialOrderRequest) => Promise<void>;
  modifyOrderQuantities: (orderId: number, modifyRequest: ModifyQuantitiesRequest) => Promise<void>;
  getOrderDetails: (orderId: number) => Promise<Order>;
  
  // Gestion de l'état d'édition
  setEditingOrder: (order: Order | null) => void;
  
  // Méthodes utilitaires existantes
  updateOrderStatus: (orderId: number, status: 'pending' | 'accepted' | 'rejected' | 'ready' | 'completed') => void;
  getPendingOrders: () => Order[];
  getOrdersByStatus: (status: string) => Order[];
  getAllOrdersFlat: () => Order[];
  getOrdersStats: () => { total: number; pending: number; accepted: number; ready: number; completed: number; rejected: number };
  clearError: () => void;
}

// Fonction utilitaire pour s'assurer que ordersByStatus est bien initialisé
const ensureOrdersByStatusStructure = (ordersByStatus: any) => {
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
  
  // === NOUVEL ÉTAT POUR L'ÉDITION ===
  stockCheckResults: {},
  editingSuggestions: {},
  editingOrder: null,
  stockCheckLoading: false,
  editingLoading: false,

  // === MÉTHODES EXISTANTES (inchangées) ===
  
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
      
      // Convertir et ajouter la commande au store
      const newOrder = convertOrderResponse(result);
      
      set(state => ({
        orders: [...state.orders, newOrder],
        ordersByStatus: {
          ...state.ordersByStatus,
          pending: [...state.ordersByStatus.pending, newOrder]
        },
        loading: false
      }));

      return `Commande #${result.id} créée avec succès`;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error('❌ Erreur création commande:', errorMessage);
      set({ 
        error: getUserFriendlyMessage('CREATE_ORDER_ERROR', errorMessage), 
        loading: false 
      });
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await PublicApiService.getOrderById(orderId);
      return convertOrderResponse(response);
    } catch (error) {
      console.error('❌ Erreur récupération commande:', error);
      return null;
    }
  },

  fetchOrdersByStatus: async (status) => {
    set({ loading: true, error: null });
    try {
      const orders = await AdminApiService.getOrdersByStatus(status);
      const convertedOrders = orders.map(convertOrderResponse);
      
      set(state => ({
        ordersByStatus: {
          ...state.ordersByStatus,
          [status]: convertedOrders
        },
        loading: false
      }));
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ 
        error: getUserFriendlyMessage('FETCH_ORDERS_ERROR', errorMessage), 
        loading: false 
      });
    }
  },

  fetchAllOrders: async () => {
    set({ loading: true, error: null });
    try {
      const statuses = ['pending', 'accepted', 'rejected', 'ready', 'completed'] as const;
      const promises = statuses.map(status => AdminApiService.getOrdersByStatus(status));
      const results = await Promise.all(promises);
      
      const newOrdersByStatus = statuses.reduce((acc, status, index) => {
        acc[status] = results[index].map(convertOrderResponse);
        return acc;
      }, {} as any);
      
      const allOrders = Object.values(newOrdersByStatus).flat();
      
      set({
        orders: allOrders,
        ordersByStatus: ensureOrdersByStatusStructure(newOrdersByStatus),
        loading: false
      });
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ 
        error: getUserFriendlyMessage('FETCH_ORDERS_ERROR', errorMessage), 
        loading: false 
      });
    }
  },

  refreshOrdersData: async () => {
    const { fetchAllOrders } = get();
    await fetchAllOrders();
  },

  acceptOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      await AdminApiService.acceptOrder(orderId);
      
      // Mettre à jour le statut local
      set(state => {
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
          order.status = 'accepted';
          
          // Déplacer de pending vers accepted
          const newOrdersByStatus = {
            ...state.ordersByStatus,
            pending: state.ordersByStatus.pending.filter(o => o.id !== orderId),
            accepted: [...state.ordersByStatus.accepted, order]
          };
          
          return {
            ordersByStatus: ensureOrdersByStatusStructure(newOrdersByStatus),
            loading: false
          };
        }
        return { loading: false };
      });
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ 
        error: getUserFriendlyMessage('ACCEPT_ORDER_ERROR', errorMessage), 
        loading: false 
      });
      throw error;
    }
  },

  rejectOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      await AdminApiService.rejectOrder(orderId);
      
      set(state => {
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
          order.status = 'rejected';
          
          const newOrdersByStatus = {
            ...state.ordersByStatus,
            pending: state.ordersByStatus.pending.filter(o => o.id !== orderId),
            rejected: [...state.ordersByStatus.rejected, order]
          };
          
          return {
            ordersByStatus: ensureOrdersByStatusStructure(newOrdersByStatus),
            loading: false
          };
        }
        return { loading: false };
      });
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ 
        error: getUserFriendlyMessage('REJECT_ORDER_ERROR', errorMessage), 
        loading: false 
      });
      throw error;
    }
  },

  markOrderReady: async (orderId) => {
    set({ loading: true, error: null });
    try {
      await AdminApiService.markOrderReady(orderId);
      
      set(state => {
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
          order.status = 'ready';
          
          const newOrdersByStatus = {
            ...state.ordersByStatus,
            accepted: state.ordersByStatus.accepted.filter(o => o.id !== orderId),
            ready: [...state.ordersByStatus.ready, order]
          };
          
          return {
            ordersByStatus: ensureOrdersByStatusStructure(newOrdersByStatus),
            loading: false
          };
        }
        return { loading: false };
      });
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ 
        error: getUserFriendlyMessage('MARK_READY_ERROR', errorMessage), 
        loading: false 
      });
      throw error;
    }
  },

  completeOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      await AdminApiService.completeOrder(orderId);
      
      set(state => {
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
          order.status = 'completed';
          
          const newOrdersByStatus = {
            ...state.ordersByStatus,
            ready: state.ordersByStatus.ready.filter(o => o.id !== orderId),
            completed: [...state.ordersByStatus.completed, order]
          };
          
          return {
            ordersByStatus: ensureOrdersByStatusStructure(newOrdersByStatus),
            loading: false
          };
        }
        return { loading: false };
      });
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ 
        error: getUserFriendlyMessage('COMPLETE_ORDER_ERROR', errorMessage), 
        loading: false 
      });
      throw error;
    }
  },

  // === NOUVELLES MÉTHODES POUR L'ÉDITION ===

  checkOrderStock: async (orderId) => {
    set({ stockCheckLoading: true, error: null });
    try {
      console.log('🔍 Vérification stock commande:', orderId);
      const stockCheck = await OrderEditingApiService.checkOrderStock(orderId);
      
      set(state => ({
        stockCheckResults: {
          ...state.stockCheckResults,
          [orderId]: stockCheck
        },
        stockCheckLoading: false
      }));
      
      return stockCheck;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ 
        error: getUserFriendlyMessage('STOCK_CHECK_ERROR', errorMessage), 
        stockCheckLoading: false 
      });
      throw error;
    }
  },

  getStockCheckResult: (orderId) => {
    return get().stockCheckResults[orderId] || null;
  },

  clearStockCheck: (orderId) => {
    set(state => {
      const newResults = { ...state.stockCheckResults };
      delete newResults[orderId];
      return { stockCheckResults: newResults };
    });
  },

  getOrderEditSuggestions: async (orderId) => {
    set({ stockCheckLoading: true, error: null });
    try {
      console.log('💡 Récupération suggestions commande:', orderId);
      const suggestions = await OrderEditingApiService.getOrderEditSuggestions(orderId);
      
      set(state => ({
        editingSuggestions: {
          ...state.editingSuggestions,
          [orderId]: suggestions
        },
        stockCheckLoading: false
      }));
      
      return suggestions;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ 
        error: getUserFriendlyMessage('SUGGESTIONS_ERROR', errorMessage), 
        stockCheckLoading: false 
      });
      throw error;
    }
  },

  getSuggestions: (orderId) => {
    return get().editingSuggestions[orderId] || null;
  },

  editOrder: async (orderId, editRequest) => {
    set({ editingLoading: true, error: null });
    try {
      console.log('✏️ Édition commande:', orderId, editRequest);
      const updatedOrder = await OrderEditingApiService.editOrder(orderId, editRequest);
      
      // Mettre à jour la commande dans le store
      set(state => {
        const orderIndex = state.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          const newOrders = [...state.orders];
          newOrders[orderIndex] = updatedOrder;
          
          // Mettre à jour aussi dans ordersByStatus
          const currentStatus = updatedOrder.status;
          const newOrdersByStatus = {
            ...state.ordersByStatus,
            [currentStatus]: state.ordersByStatus[currentStatus].map(o => 
              o.id === orderId ? updatedOrder : o
            )
          };
          
          return {
            orders: newOrders,
            ordersByStatus: ensureOrdersByStatusStructure(newOrdersByStatus),
            editingLoading: false
          };
        }
        return { editingLoading: false };
      });
      
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ 
        error: getUserFriendlyMessage('EDIT_ORDER_ERROR', errorMessage), 
        editingLoading: false 
      });
      throw error;
    }
  },

  acceptPartialOrder: async (orderId, acceptRequest) => {
    set({ editingLoading: true, error: null });
    try {
      console.log('✅🔪 Acceptation partielle commande:', orderId, acceptRequest);
      const updatedOrder = await OrderEditingApiService.acceptPartialOrder(orderId, acceptRequest);
      
      // Mettre à jour et déplacer la commande vers "accepted"
      set(state => {
        const orderIndex = state.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          const newOrders = [...state.orders];
          newOrders[orderIndex] = { ...updatedOrder, status: 'accepted' };
          
          const newOrdersByStatus = {
            ...state.ordersByStatus,
            pending: state.ordersByStatus.pending.filter(o => o.id !== orderId),
            accepted: [...state.ordersByStatus.accepted, newOrders[orderIndex]]
          };
          
          return {
            orders: newOrders,
            ordersByStatus: ensureOrdersByStatusStructure(newOrdersByStatus),
            editingLoading: false
          };
        }
        return { editingLoading: false };
      });
      
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ 
        error: getUserFriendlyMessage('PARTIAL_ACCEPT_ERROR', errorMessage), 
        editingLoading: false 
      });
      throw error;
    }
  },

  modifyOrderQuantities: async (orderId, modifyRequest) => {
    set({ editingLoading: true, error: null });
    try {
      console.log('🔢 Modification quantités commande:', orderId, modifyRequest);
      const updatedOrder = await OrderEditingApiService.modifyOrderQuantities(orderId, modifyRequest);
      
      // Mettre à jour la commande dans le store
      set(state => {
        const orderIndex = state.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          const newOrders = [...state.orders];
          newOrders[orderIndex] = updatedOrder;
          
          const currentStatus = updatedOrder.status;
          const newOrdersByStatus = {
            ...state.ordersByStatus,
            [currentStatus]: state.ordersByStatus[currentStatus].map(o => 
              o.id === orderId ? updatedOrder : o
            )
          };
          
          return {
            orders: newOrders,
            ordersByStatus: ensureOrdersByStatusStructure(newOrdersByStatus),
            editingLoading: false
          };
        }
        return { editingLoading: false };
      });
      
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ 
        error: getUserFriendlyMessage('MODIFY_QUANTITIES_ERROR', errorMessage), 
        editingLoading: false 
      });
      throw error;
    }
  },

  getOrderDetails: async (orderId) => {
    try {
      console.log('📋 Récupération détails commande:', orderId);
      return await OrderEditingApiService.getOrderDetails(orderId);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set({ 
        error: getUserFriendlyMessage('GET_ORDER_DETAILS_ERROR', errorMessage)
      });
      throw error;
    }
  },

  setEditingOrder: (order) => {
    set({ editingOrder: order });
  },

  // === MÉTHODES UTILITAIRES EXISTANTES (inchangées) ===
  
  updateOrderStatus: (orderId, status) => {
    set(state => {
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
      }
      return { orders: [...state.orders] };
    });
  },

  getPendingOrders: () => get().ordersByStatus.pending,
  
  getOrdersByStatus: (status) => {
    const ordersByStatus = get().ordersByStatus;
    return ordersByStatus[status as keyof typeof ordersByStatus] || [];
  },

  getAllOrdersFlat: () => get().orders,

  getOrdersStats: () => {
    const { ordersByStatus } = get();
    return {
      total: Object.values(ordersByStatus).flat().length,
      pending: ordersByStatus.pending.length,
      accepted: ordersByStatus.accepted.length,
      rejected: ordersByStatus.rejected.length,
      ready: ordersByStatus.ready.length,
      completed: ordersByStatus.completed.length,
    };
  },

  clearError: () => set({ error: null }),
}));
