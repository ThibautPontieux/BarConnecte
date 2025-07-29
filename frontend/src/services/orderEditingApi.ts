import { adminApi } from './api';
import type { 
  StockCheckResult, 
  EditOrderRequest, 
  AcceptPartialOrderRequest, 
  ModifyQuantitiesRequest,
  OrderEditSuggestions,
  Order
} from '../types/Order';

export class OrderEditingApiService {
  
  // === VÉRIFICATION DE STOCK ===
  
  /**
   * Vérifie le stock détaillé d'une commande
   * GET /admin/orders/{id}/stock-check
   */
  static async checkOrderStock(orderId: number): Promise<StockCheckResult> {
    console.log('🔍 Vérification stock pour commande:', orderId);
    
    try {
      const response = await adminApi.get<StockCheckResult>(`/orders/${orderId}/stock-check`);
      console.log('✅ Stock vérifié:', response.data);
      
      // Conversion des dates string vers Date objects
      const result: StockCheckResult = {
        ...response.data,
        checkedAt: new Date(response.data.checkedAt)
      };
      
      return result;
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
    console.log('💡 Récupération suggestions pour commande:', orderId);
    
    try {
      const response = await adminApi.get<OrderEditSuggestions>(`/orders/${orderId}/suggestions`);
      console.log('✅ Suggestions récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération suggestions:', error);
      throw new Error('Impossible de générer des suggestions pour cette commande');
    }
  }

  // === ÉDITION DE COMMANDES ===

  /**
   * Édite complètement une commande (remplace tous les articles)
   * PUT /admin/orders/{id}/edit
   */
  static async editOrder(orderId: number, editRequest: EditOrderRequest): Promise<Order> {
    console.log('✏️ Édition complète commande:', orderId, editRequest);
    
    try {
      // Validation côté client
      if (!editRequest.reason.trim()) {
        throw new Error('Une raison doit être fournie pour la modification');
      }
      
      if (editRequest.items.length === 0) {
        throw new Error('Au moins un article doit être présent dans la commande');
      }
      
      if (editRequest.items.some(item => item.quantity <= 0)) {
        throw new Error('Toutes les quantités doivent être supérieures à 0');
      }

      const response = await adminApi.put<any>(`/orders/${orderId}/edit`, editRequest);
      console.log('✅ Commande éditée:', response.data);
      
      // Convertir la réponse backend vers le format frontend
      return this.convertExtendedOrderResponse(response.data);
    } catch (error: any) {
      console.error('❌ Erreur édition commande:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      
      throw new Error('Impossible d\'éditer cette commande');
    }
  }

  /**
   * Accepte une commande en retirant certains articles
   * POST /admin/orders/{id}/accept-partial
   */
  static async acceptPartialOrder(
    orderId: number, 
    acceptRequest: AcceptPartialOrderRequest
  ): Promise<Order> {
    console.log('✅🔪 Acceptation partielle commande:', orderId, acceptRequest);
    
    try {
      // Validation côté client
      if (!acceptRequest.reason.trim()) {
        throw new Error('Une raison doit être fournie pour les retraits');
      }
      
      if (acceptRequest.itemsToRemove.length === 0) {
        throw new Error('Au moins un article doit être spécifié pour le retrait');
      }

      const response = await adminApi.post<any>(`/orders/${orderId}/accept-partial`, acceptRequest);
      console.log('✅ Commande acceptée partiellement:', response.data);
      
      return this.convertExtendedOrderResponse(response.data);
    } catch (error: any) {
      console.error('❌ Erreur acceptation partielle:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      
      throw new Error('Impossible d\'accepter partiellement cette commande');
    }
  }

  /**
   * Modifie les quantités d'articles existants
   * PUT /admin/orders/{id}/modify-quantities
   */
  static async modifyOrderQuantities(
    orderId: number, 
    modifyRequest: ModifyQuantitiesRequest
  ): Promise<Order> {
    console.log('🔢 Modification quantités commande:', orderId, modifyRequest);
    
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

      const response = await adminApi.put<any>(`/orders/${orderId}/modify-quantities`, modifyRequest);
      console.log('✅ Quantités modifiées:', response.data);
      
      return this.convertExtendedOrderResponse(response.data);
    } catch (error: any) {
      console.error('❌ Erreur modification quantités:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      
      throw new Error('Impossible de modifier les quantités de cette commande');
    }
  }

  /**
   * Récupère les détails complets d'une commande
   * GET /admin/orders/{id}
   */
  static async getOrderDetails(orderId: number): Promise<Order> {
    console.log('📋 Récupération détails commande:', orderId);
    
    try {
      const response = await adminApi.get<any>(`/orders/${orderId}`);
      console.log('✅ Détails récupérés:', response.data);
      
      return this.convertExtendedOrderResponse(response.data);
    } catch (error) {
      console.error('❌ Erreur récupération détails:', error);
      throw new Error('Impossible de récupérer les détails de cette commande');
    }
  }

  // === MÉTHODES UTILITAIRES ===

  /**
   * Convertit une ExtendedOrderResponse du backend vers un Order frontend
   */
  private static convertExtendedOrderResponse(backendOrder: any): Order {
    return {
      id: backendOrder.id,
      customerName: backendOrder.customerName,
      status: backendOrder.status.toLowerCase() as Order['status'],
      total: backendOrder.totalAmount,
      timestamp: new Date(backendOrder.createdAt),
      
      // Conversion des items
      items: backendOrder.items.map((item: any, index: number) => ({
        id: Date.now() + index, // ID temporaire pour les items
        name: item.drinkName,
        price: item.unitPrice,
        stock: 0, // Non disponible dans la réponse
        category: 'Unknown', // Non disponible dans la réponse
        quantity: item.quantity,
      })),
      
      // Nouvelles propriétés d'édition
      isPartiallyModified: backendOrder.isPartiallyModified,
      modificationReason: backendOrder.modificationReason,
      lastModifiedAt: backendOrder.lastModifiedAt 
        ? new Date(backendOrder.lastModifiedAt) 
        : undefined,
    };
  }

  /**
   * Valide une requête d'édition côté client
   */
  static validateEditRequest(editRequest: EditOrderRequest): string | null {
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
   * Crée une requête d'édition basée sur des modifications d'articles
   */
  static createEditRequestFromOrder(
    order: Order, 
    modifiedItems: Array<{drinkId: number, quantity: number}>, 
    reason: string
  ): EditOrderRequest {
    return {
      items: modifiedItems.map(item => ({
        drinkId: item.drinkId,
        quantity: item.quantity
      })),
      reason: reason.trim()
    };
  }

  /**
   * Crée une requête d'acceptation partielle basée sur les items à retirer
   */
  static createPartialAcceptRequest(
    itemsToRemove: number[], 
    reason: string
  ): AcceptPartialOrderRequest {
    return {
      itemsToRemove,
      reason: reason.trim()
    };
  }

  /**
   * Crée une requête de modification de quantités
   */
  static createQuantityModifyRequest(
    quantityChanges: Record<number, number>, 
    reason: string
  ): ModifyQuantitiesRequest {
    return {
      quantityChanges,
      reason: reason.trim()
    };
  }
}
