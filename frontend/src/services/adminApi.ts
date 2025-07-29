import { adminApi } from './api';
import type { 
  Drink, 
  CreateDrinkRequest, 
  UpdateDrinkRequest,
  OrderResponse,
  StockCheckResult, 
  EditOrderRequest, 
  AcceptPartialOrderRequest, 
  ModifyQuantitiesRequest,
  OrderEditSuggestions
} from './types';

export class AdminApiService {
  
  // === GESTION DES BOISSONS (existant) ===
  
  static async getDrinks(): Promise<Drink[]> {
    const response = await adminApi.get<Drink[]>('/drinks');
    return response.data;
  }

  static async createDrink(drink: CreateDrinkRequest): Promise<Drink> {
    const response = await adminApi.post<Drink>('/drinks', drink);
    return response.data;
  }

  static async updateDrink(id: number, updates: UpdateDrinkRequest): Promise<Drink> {
    const response = await adminApi.put<Drink>(`/drinks/${id}`, updates);
    return response.data;
  }

  static async deleteDrink(id: number): Promise<void> {
    await adminApi.delete(`/drinks/${id}`);
  }

  // === GESTION DES COMMANDES (existant + étendu) ===

  // Méthodes existantes pour la gestion basique des commandes
  static async getOrdersByStatus(status: string): Promise<OrderResponse[]> {
    console.log('📋 Récupération commandes par statut:', status);
    const response = await adminApi.get<OrderResponse[]>(`/orders/${status}`);
    console.log('✅ Commandes récupérées:', response.data.length);
    return response.data;
  }

  static async acceptOrder(orderId: number): Promise<OrderResponse> {
    console.log('✅ Acceptation commande via API:', orderId);
    const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/accept`);
    console.log('✅ Commande acceptée:', response.data);
    return response.data;
  }

  static async rejectOrder(orderId: number): Promise<OrderResponse> {
    console.log('❌ Refus commande via API:', orderId);
    const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/reject`);
    console.log('❌ Commande refusée:', response.data);
    return response.data;
  }

  static async markOrderReady(orderId: number): Promise<OrderResponse> {
    console.log('📦 Marquage commande prête via API:', orderId);
    const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/ready`);
    console.log('📦 Commande marquée prête:', response.data);
    return response.data;
  }

  static async completeOrder(orderId: number): Promise<OrderResponse> {
    console.log('🏁 Finalisation commande via API:', orderId);
    const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/complete`);
    console.log('🏁 Commande finalisée:', response.data);
    return response.data;
  }

  // === NOUVELLES MÉTHODES POUR L'ÉDITION DE COMMANDES ===

  /**
   * Vérifie le stock détaillé d'une commande
   * GET /admin/orders/{id}/stock-check
   */
  static async checkOrderStock(orderId: number): Promise<StockCheckResult> {
    console.log('🔍 Vérification stock commande:', orderId);
    
    try {
      const response = await adminApi.get<any>(`/orders/${orderId}/stock-check`);
      console.log('✅ Réponse vérification stock:', response.data);
      
      // Transformation de la réponse backend vers le format frontend
      const stockCheck: StockCheckResult = {
        isFullyAvailable: response.data.isFullyAvailable,
        checkedAt: new Date(response.data.checkedAt),
        issues: response.data.issues.map((issue: any) => ({
          drinkId: issue.drinkId,
          drinkName: issue.drinkName,
          requestedQuantity: issue.requestedQuantity,
          availableQuantity: issue.availableQuantity,
          type: issue.type as 'OutOfStock' | 'InsufficientStock',
          missingQuantity: issue.missingQuantity
        }))
      };
      
      return stockCheck;
    } catch (error) {
      console.error('❌ Erreur vérification stock:', error);
      throw new Error('Impossible de vérifier le stock de cette commande');
    }
  }

  /**
   * Obtient des suggestions d'édition automatiques
   * GET /admin/orders/{id}/suggestions
   */
  static async getOrderEditSuggestions(orderId: number): Promise<OrderEditSuggestions> {
    console.log('💡 Récupération suggestions édition:', orderId);
    
    try {
      const response = await adminApi.get<OrderEditSuggestions>(`/orders/${orderId}/suggestions`);
      console.log('✅ Suggestions récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération suggestions:', error);
      throw new Error('Impossible de générer des suggestions pour cette commande');
    }
  }

  /**
   * Récupère les détails complets d'une commande
   * GET /admin/orders/{id}
   */
  static async getOrderDetails(orderId: number): Promise<OrderResponse> {
    console.log('📋 Récupération détails commande:', orderId);
    
    try {
      const response = await adminApi.get<OrderResponse>(`/orders/${orderId}`);
      console.log('✅ Détails commande récupérés:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération détails:', error);
      throw new Error('Impossible de récupérer les détails de cette commande');
    }
  }

  /**
   * Édite complètement une commande
   * PUT /admin/orders/{id}/edit
   */
  static async editOrder(orderId: number, editRequest: EditOrderRequest): Promise<OrderResponse> {
    console.log('✏️ Édition commande:', orderId, editRequest);
    
    try {
      // Validation côté client
      const validationError = this.validateEditRequest(editRequest);
      if (validationError) {
        throw new Error(validationError);
      }

      const response = await adminApi.put<OrderResponse>(`/orders/${orderId}/edit`, editRequest);
      console.log('✅ Commande éditée avec succès:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur édition commande:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      
      throw new Error(error.message || 'Impossible d\'éditer cette commande');
    }
  }

  /**
   * Accepte une commande en retirant certains articles
   * POST /admin/orders/{id}/accept-partial
   */
  static async acceptPartialOrder(
    orderId: number, 
    acceptRequest: AcceptPartialOrderRequest
  ): Promise<OrderResponse> {
    console.log('✅🔪 Acceptation partielle:', orderId, acceptRequest);
    
    try {
      // Validation côté client
      if (!acceptRequest.reason.trim()) {
        throw new Error('Une raison doit être fournie pour les retraits');
      }
      
      if (acceptRequest.itemsToRemove.length === 0) {
        throw new Error('Au moins un article doit être spécifié pour le retrait');
      }

      const response = await adminApi.post<OrderResponse>(`/orders/${orderId}/accept-partial`, acceptRequest);
      console.log('✅ Commande acceptée partiellement:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur acceptation partielle:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      
      throw new Error(error.message || 'Impossible d\'accepter partiellement cette commande');
    }
  }

  /**
   * Modifie les quantités d'articles existants
   * PUT /admin/orders/{id}/modify-quantities
   */
  static async modifyOrderQuantities(
    orderId: number, 
    modifyRequest: ModifyQuantitiesRequest
  ): Promise<OrderResponse> {
    console.log('🔢 Modification quantités:', orderId, modifyRequest);
    
    try {
      // Validation côté client
      if (!modifyRequest.reason.trim()) {
        throw new Error('Une raison doit être fournie pour les modifications');
      }
      
      if (Object.keys(modifyRequest.quantityChanges).length === 0) {
        throw new Error('Au moins une modification de quantité doit être spécifiée');
      }
      
      if (Object.values(modifyRequest.quantityChanges).some(qty => qty < 0)) {
        throw new Error('Les quantités ne peuvent pas être négatives');
      }

      const response = await adminApi.put<OrderResponse>(`/orders/${orderId}/modify-quantities`, modifyRequest);
      console.log('✅ Quantités modifiées:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur modification quantités:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      
      throw new Error(error.message || 'Impossible de modifier les quantités de cette commande');
    }
  }

  // === MÉTHODES UTILITAIRES ===

  /**
   * Valide une requête d'édition côté client
   */
  private static validateEditRequest(editRequest: EditOrderRequest): string | null {
    if (!editRequest.reason.trim()) {
      return 'Une raison doit être fournie pour la modification';
    }
    
    if (editRequest.items.length === 0) {
      return 'Au moins un article doit être présent dans la commande modifiée';
    }
    
    if (editRequest.items.some(item => item.quantity <= 0)) {
      return 'Toutes les quantités doivent être supérieures à 0';
    }
    
    if (editRequest.reason.length > 500) {
      return 'La raison ne peut pas dépasser 500 caractères';
    }
    
    return null; // Validation réussie
  }

  /**
   * Méthodes utilitaires pour la gestion des boissons (existantes)
   */
  static async updateDrinkQuantity(id: number, quantity: number): Promise<void> {
    await this.updateDrink(id, { quantity });
  }

  static async updateDrinkPrice(id: number, price: string): Promise<void> {
    await this.updateDrink(id, { price });
  }

  /**
   * Récupère toutes les commandes (tous statuts confondus)
   */
  static async getAllOrders(): Promise<OrderResponse[]> {
    console.log('📋 Récupération de toutes les commandes...');
    
    const statuses = ['pending', 'accepted', 'rejected', 'ready', 'completed'];
    const promises = statuses.map(status => this.getOrdersByStatus(status));
    
    try {
      const results = await Promise.all(promises);
      const allOrders = results.flat();
      
      console.log(`✅ ${allOrders.length} commandes récupérées au total`);
      return allOrders;
    } catch (error) {
      console.error('❌ Erreur récupération toutes commandes:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques des commandes
   */
  static async getOrdersStatistics(): Promise<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    ready: number;
    completed: number;
  }> {
    const orders = await this.getAllOrders();
    
    const stats = {
      total: orders.length,
      pending: 0,
      accepted: 0,
      rejected: 0,
      ready: 0,
      completed: 0
    };

    orders.forEach(order => {
      const status = order.status.toLowerCase();
      if (stats.hasOwnProperty(status)) {
        (stats as any)[status]++;
      }
    });

    return stats;
  }
}
