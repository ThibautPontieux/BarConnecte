import { adminApi } from './api';
import type { 
  ApiWrapper, 
  Drink, 
  CreateDrinkRequest, 
  UpdateDrinkRequest, 
  GetMenuResponse, 
  DrinkResponse,
  OrderResponse
} from './types';

export class AdminApiService {
  // === GESTION DES BOISSONS ===
  
  // GET /admin/drinks - Récupérer toutes les boissons
  static async getAllDrinks(): Promise<DrinkResponse[]> {
    const response = await adminApi.get<ApiWrapper<GetMenuResponse>>('/drinks');
    console.log('Admin API getAllDrinks response:', response);
    return response.data.data?.drinks || [];
  }

  // GET /admin/drinks/{drinkName} - Récupérer une boisson par nom
  static async getDrinkByName(drinkName: string): Promise<{drink: string}> {
    const response = await adminApi.get<ApiWrapper<{drink: string}>>(`/drinks/${encodeURIComponent(drinkName)}`);
    return response.data.data;
  }

  // POST /admin/drinks - Créer une boisson
  static async createDrink(drink: CreateDrinkRequest): Promise<Drink> {
    const requestBody: ApiWrapper<CreateDrinkRequest> = {
      success: true,
      data: drink
    };
    
    const response = await adminApi.post<Drink>('/drinks', requestBody);
    return response.data;
  }

  // PUT /admin/drinks/{id} - Modifier une boisson
  static async updateDrink(id: number, updates: UpdateDrinkRequest): Promise<void> {
    const requestBody: ApiWrapper<UpdateDrinkRequest> = {
      success: true,
      data: updates
    };
    
    await adminApi.put(`/drinks/${id}`, requestBody);
  }

  // DELETE /admin/drinks/{id} - Supprimer une boisson
  static async deleteDrink(id: number): Promise<void> {
    await adminApi.delete(`/drinks/${id}`);
  }

  // === GESTION DES COMMANDES (NOUVEAUX ENDPOINTS) ===
  
  // GET /admin/orders/pending - Récupérer les commandes en attente
  static async getPendingOrders(): Promise<OrderResponse[]> {
    const response = await adminApi.get<OrderResponse[]>('/orders/pending');
    return response.data;
  }

  // GET /admin/orders/{status} - Récupérer les commandes par statut
  static async getOrdersByStatus(status: 'pending' | 'accepted' | 'rejected' | 'ready' | 'completed'): Promise<OrderResponse[]> {
    const response = await adminApi.get<OrderResponse[]>(`/orders/${status}`);
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

  // POST /admin/orders/{id}/ready - Marquer une commande comme prête
  static async markOrderReady(orderId: number): Promise<OrderResponse> {
    const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/ready`);
    return response.data;
  }

  // GET /admin/orders/{id}/complete - Finaliser une commande
  static async completeOrder(orderId: number): Promise<OrderResponse> {
    const response = await adminApi.get<OrderResponse>(`/orders/${orderId}/complete`);
    return response.data;
  }

  // === MÉTHODES UTILITAIRES BOISSONS ===
  
  static async updateDrinkQuantity(id: number, quantity: number): Promise<void> {
    await this.updateDrink(id, { quantity });
  }

  static async updateDrinkPrice(id: number, price: string): Promise<void> {
    await this.updateDrink(id, { price });
  }

  // === MÉTHODES UTILITAIRES COMMANDES ===
  
  // Traiter une commande (accepter + marquer prête + compléter)
  static async processOrderWorkflow(orderId: number): Promise<OrderResponse> {
    try {
      // 1. Accepter
      await this.acceptOrder(orderId);
      
      // 2. Marquer comme prête
      await this.markOrderReady(orderId);
      
      // 3. Finaliser
      const completedOrder = await this.completeOrder(orderId);
      
      return completedOrder;
    } catch (error) {
      console.error('Erreur lors du traitement de la commande:', error);
      throw error;
    }
  }
}
