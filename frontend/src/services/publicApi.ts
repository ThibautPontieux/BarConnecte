import { publicApi } from './api';
import type { 
  GetMenuResponseApiWrapper, 
  DrinkListApiWrapper, 
  StringApiWrapper,
  OrderDto,
  DrinkResponse,
  Drink,
  OrderResponse,
  CreateOrderRequest
} from './types';

export class PublicApiService {
  // === ENDPOINTS MENU ===
  
  // GET /public - Récupérer tout le menu
  static async getMenu(): Promise<DrinkResponse[]> {
    const response = await publicApi.get<GetMenuResponseApiWrapper>('/');
    return response.data.data?.drinks || [];
  }

  // GET /public/{category} - Récupérer les boissons par catégorie
  static async getDrinksByCategory(category: string): Promise<Drink[]> {
    const response = await publicApi.get<DrinkListApiWrapper>(`/${encodeURIComponent(category)}`);
    return response.data.data || [];
  }

  // === ENDPOINTS COMMANDES (NOUVEAUX) ===
  
  // POST /public/orders - Créer une commande (NOUVELLE API)
  static async createOrder(order: CreateOrderRequest): Promise<OrderResponse> {
    const response = await publicApi.post<OrderResponse>('/orders', order);
    return response.data;
  }

  // GET /public/orders/{orderId} - Suivre une commande
  static async getOrderById(orderId: number): Promise<OrderResponse> {
    const response = await publicApi.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
  }

  // === MÉTHODES UTILITAIRES ===
  
  static async getAvailableProducts(): Promise<DrinkResponse[]> {
    return this.getMenu();
  }

  static async getProductsByCategory(categoryName: string): Promise<Drink[]> {
    return this.getDrinksByCategory(categoryName);
  }

  // Méthode pour vérifier la disponibilité avant commande
  static async checkAvailability(items: { drinkId: number; quantity: number }[]): Promise<boolean> {
    try {
      const menu = await this.getMenu();
      
      for (const item of items) {
        const drink = menu.find(d => d.name === `drink_${item.drinkId}`); // Adaptation selon votre logique
        if (!drink || drink.quantity < item.quantity) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      return false;
    }
  }
}
