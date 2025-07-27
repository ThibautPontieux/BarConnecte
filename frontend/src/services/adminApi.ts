import { adminApi } from './api';
import type { 
  ApiWrapper, 
  Drink, 
  CreateDrinkRequest, 
  UpdateDrinkRequest, 
  GetMenuResponse, 
  DrinkResponse
} from './types';

export class AdminApiService {
  // GET /admin/drinks/all - Récupérer toutes les boissons
  static async getAllDrinks(): Promise<DrinkResponse[]> {
    const response = await adminApi.get<ApiWrapper<GetMenuResponse>>('/drinks');
    console.log(response)
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

  // Méthodes utilitaires
  static async updateDrinkQuantity(id: number, quantity: number): Promise<void> {
    await this.updateDrink(id, { quantity });
  }

  static async updateDrinkPrice(id: number, price: string): Promise<void> {
    await this.updateDrink(id, { price });
  }
}
