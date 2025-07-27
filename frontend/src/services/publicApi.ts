import { publicApi } from './api';
import type { 
  GetMenuResponseApiWrapper, 
  DrinkListApiWrapper, 
  StringApiWrapper,
  OrderDto,
  DrinkResponse,
  Drink 
} from './types';

export class PublicApiService {
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

  // POST /public/order - Créer une commande
  static async createOrder(order: OrderDto): Promise<string> {
    const response = await publicApi.post<StringApiWrapper>('/order', order);
    return response.data.data || '';
  }

  // Méthodes utilitaires
  static async getAvailableProducts(): Promise<DrinkResponse[]> {
    return this.getMenu();
  }

  static async getProductsByCategory(categoryName: string): Promise<Drink[]> {
    // Convertir le nom de catégorie en valeur enum si nécessaire
    return this.getDrinksByCategory(categoryName);
  }
}
