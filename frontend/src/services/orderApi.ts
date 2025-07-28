import { publicApi, adminApi } from './api';
import { 
  CreateOrderRequest,
  OrderResponse,
  Order,
  OrderStatus 
} from '../types/Order';

export class OrderApiService {
  // === API PUBLIC (pour les clients) ===
  
  // POST /public/orders - Créer une commande
  static async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    const response = await publicApi.post<OrderResponse>('/orders', orderData);
    return response.data;
  }

  // GET /public/orders/{id} - Récupérer le statut d'une commande
  static async getOrderStatus(orderId: number): Promise<OrderResponse> {
    const response = await publicApi.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
  }

  // === API ADMIN (pour les barmans) ===

  // GET /admin/orders/pending - Récupérer les commandes en attente
  static async getPendingOrders(): Promise<OrderResponse[]> {
    const response = await adminApi.get<OrderResponse[]>('/orders/pending');
    return response.data;
  }

  // POST /admin/orders/{id}/accept - Accepter une commande
  static async acceptOrder(orderId: number): Promise<OrderResponse> {
    const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/accept`);
    return response.data;
  }

  // POST /admin/orders/{id}/reject - Refuser une commande
  static async rejectOrder(orderId: number): Promise<OrderResponse> {
    const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/reject`);
    return response.data;
  }

  // POST /admin/orders/{id}/ready - Marquer comme prête
  static async markOrderReady(orderId: number): Promise<OrderResponse> {
    const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/ready`);
    return response.data;
  }

  // POST /admin/orders/{id}/complete - Marquer comme terminée
  static async completeOrder(orderId: number): Promise<OrderResponse> {
    const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/complete`);
    return response.data;
  }

  // Méthodes utilitaires
  static mapOrderResponse(response: OrderResponse): Order {
    return {
      id: response.id,
      customerName: response.customerName,
      status: response.status as OrderStatus,
      totalAmount: response.totalAmount,
      createdAt: new Date(response.createdAt),
      items: response.items,
    };
  }

  static getStatusDisplayName(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'En attente';
      case OrderStatus.Accepted:
        return 'Acceptée';
      case OrderStatus.Rejected:
        return 'Refusée';
      case OrderStatus.Ready:
        return 'Prête';
      case OrderStatus.Completed:
        return 'Terminée';
      default:
        return status;
    }
  }

  static getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'text-yellow-600 bg-yellow-100';
      case OrderStatus.Accepted:
        return 'text-blue-600 bg-blue-100';
      case OrderStatus.Rejected:
        return 'text-red-600 bg-red-100';
      case OrderStatus.Ready:
        return 'text-green-600 bg-green-100';
      case OrderStatus.Completed:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}
