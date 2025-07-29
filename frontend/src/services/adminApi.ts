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

  // === GESTION DES COMMANDES (AVEC ROUTE GÉNÉRIQUE) ===
  
  // GET /admin/orders/{status} - Récupérer les commandes par statut (NOUVELLE ROUTE GÉNÉRIQUE)
  static async getOrdersByStatus(status: 'pending' | 'accepted' | 'rejected' | 'ready' | 'completed'): Promise<OrderResponse[]> {
    console.log(`📋 Récupération des commandes avec statut: ${status}`);
    const response = await adminApi.get<OrderResponse[]>(`/orders/${status}`);
    console.log(`📊 Commandes ${status} reçues:`, response.data.length);
    return response.data;
  }

  // GET /admin/orders/pending - Récupérer les commandes en attente (LEGACY - utilise la route générique)
  static async getPendingOrders(): Promise<OrderResponse[]> {
    return this.getOrdersByStatus('pending');
  }

  // GET /admin/orders/accepted - Récupérer les commandes acceptées
  static async getAcceptedOrders(): Promise<OrderResponse[]> {
    return this.getOrdersByStatus('accepted');
  }

  // GET /admin/orders/ready - Récupérer les commandes prêtes
  static async getReadyOrders(): Promise<OrderResponse[]> {
    return this.getOrdersByStatus('ready');
  }

  // GET /admin/orders/completed - Récupérer les commandes terminées
  static async getCompletedOrders(): Promise<OrderResponse[]> {
    return this.getOrdersByStatus('completed');
  }

  // GET /admin/orders/rejected - Récupérer les commandes refusées
  static async getRejectedOrders(): Promise<OrderResponse[]> {
    return this.getOrdersByStatus('rejected');
  }

  // POST /admin/orders/{id}/accept - Accepter une commande
  static async acceptOrder(orderId: number): Promise<OrderResponse> {
    console.log('✅ Acceptation commande via API:', orderId);
    const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/accept`);
    console.log('✅ Commande acceptée:', response.data);
    return response.data;
  }

  // POST /admin/orders/{id}/reject - Refuser une commande
  static async rejectOrder(orderId: number): Promise<OrderResponse> {
    console.log('❌ Refus commande via API:', orderId);
    const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/reject`);
    console.log('❌ Commande refusée:', response.data);
    return response.data;
  }

  // POST /admin/orders/{id}/ready - Marquer une commande comme prête
  static async markOrderReady(orderId: number): Promise<OrderResponse> {
    console.log('📦 Marquage commande prête via API:', orderId);
    const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/ready`);
    console.log('📦 Commande marquée prête:', response.data);
    return response.data;
  }

  // GET /admin/orders/{id}/complete - Finaliser une commande
  static async completeOrder(orderId: number): Promise<OrderResponse> {
    console.log('🏁 Finalisation commande via API:', orderId);
    const response = await adminApi.get<OrderResponse>(`/orders/${orderId}/complete`);
    console.log('🏁 Commande finalisée:', response.data);
    return response.data;
  }

  // === MÉTHODES UTILITAIRES BOISSONS ===
  
  static async updateDrinkQuantity(id: number, quantity: number): Promise<void> {
    await this.updateDrink(id, { quantity });
  }

  static async updateDrinkPrice(id: number, price: string): Promise<void> {
    await this.updateDrink(id, { price });
  }

  // === MÉTHODES UTILITAIRES COMMANDES AVANCÉES ===
  
  // Récupérer toutes les commandes (tous statuts confondus)
  static async getAllOrders(): Promise<{[status: string]: OrderResponse[]}> {
    console.log('📋 Récupération de toutes les commandes...');
    
    try {
      const [pending, accepted, ready, completed, rejected] = await Promise.all([
        this.getOrdersByStatus('pending'),
        this.getOrdersByStatus('accepted'),
        this.getOrdersByStatus('ready'),
        this.getOrdersByStatus('completed'),
        this.getOrdersByStatus('rejected'),
      ]);

      return {
        pending,
        accepted,
        ready,
        completed,
        rejected,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de toutes les commandes:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des commandes
  static async getOrdersStats(): Promise<{
    total: number;
    pending: number;
    accepted: number;
    ready: number;
    completed: number;
    rejected: number;
  }> {
    try {
      const allOrders = await this.getAllOrders();
      
      return {
        pending: allOrders.pending.length,
        accepted: allOrders.accepted.length,
        ready: allOrders.ready.length,
        completed: allOrders.completed.length,
        rejected: allOrders.rejected.length,
        total: Object.values(allOrders).flat().length,
      };
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  }

  // Traiter une commande (accepter + marquer prête + compléter) - Workflow complet
  static async processOrderWorkflow(orderId: number): Promise<OrderResponse> {
    try {
      console.log(`🔄 Début du workflow pour commande ${orderId}`);
      
      // 1. Accepter
      await this.acceptOrder(orderId);
      console.log(`✅ Étape 1/3: Commande ${orderId} acceptée`);
      
      // 2. Marquer comme prête
      await this.markOrderReady(orderId);
      console.log(`📦 Étape 2/3: Commande ${orderId} marquée prête`);
      
      // 3. Finaliser
      const completedOrder = await this.completeOrder(orderId);
      console.log(`🏁 Étape 3/3: Commande ${orderId} finalisée`);
      
      return completedOrder;
    } catch (error) {
      console.error(`❌ Erreur lors du traitement de la commande ${orderId}:`, error);
      throw error;
    }
  }

  // Rechercher des commandes par nom de client
  static async searchOrdersByCustomer(customerName: string): Promise<OrderResponse[]> {
    try {
      console.log(`🔍 Recherche commandes pour client: ${customerName}`);
      
      // Récupérer toutes les commandes et filtrer côté client
      // (En attendant une route de recherche côté backend)
      const allOrders = await this.getAllOrders();
      const allOrdersList = Object.values(allOrders).flat();
      
      const filteredOrders = allOrdersList.filter(order => 
        order.customerName.toLowerCase().includes(customerName.toLowerCase())
      );
      
      console.log(`📊 ${filteredOrders.length} commandes trouvées pour "${customerName}"`);
      return filteredOrders;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      throw error;
    }
  }
}
