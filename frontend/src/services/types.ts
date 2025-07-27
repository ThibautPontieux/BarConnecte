export interface ApiWrapper<T> {
  success: boolean;
  data: T;
  errorMessage?: string;
}

// Types pour les Drinks (selon tes nouvelles APIs)
export interface Drink {
  id: number;
  name: string;
  quantity: number;
  price: string;          // string selon ton API
  category: DrinkCategory;
  description?: string;
}

export interface DrinkResponse {
  name: string;
  quantity: number;
  price: string;          // string selon ton API
  category: DrinkCategory;
  description?: string;
}

export enum DrinkCategory {
  Bieres = 0,
  Spiritueux = 1,
  Cocktails = 2,
  Vins = 3,
  Champagnes = 4,
  Cafe = 5,
  Sodas = 6,
  Eaux = 7,
  Jus = 8,
}

// Mapping des catégories
export const DRINK_CATEGORY_NAMES: Record<DrinkCategory, string> = {
  [DrinkCategory.Bieres]: 'Bires',
  [DrinkCategory.Spiritueux]: 'Spiritueux',
  [DrinkCategory.Cocktails]: 'Cocktails',
  [DrinkCategory.Vins]: 'Vins',
  [DrinkCategory.Champagnes]: 'Champagnes',
  [DrinkCategory.Cafe]: 'Café',
  [DrinkCategory.Sodas]: 'Sodas',
  [DrinkCategory.Eaux]: 'Eaux',
  [DrinkCategory.Jus]: 'Jus',
};

// Types pour les commandes
export interface OrderDrinkDto {
  name: string;
  quantity: number;
}

export interface OrderDto {
  drinks: OrderDrinkDto[];
}

// Types API responses
export interface GetMenuResponse {
  drinks: DrinkResponse[];
}

export interface DrinkListApiWrapper extends ApiWrapper<Drink[]> {}
export interface GetMenuResponseApiWrapper extends ApiWrapper<GetMenuResponse> {}
export interface StringApiWrapper extends ApiWrapper<string> {}

// Types pour les requêtes Admin
export interface CreateDrinkRequest {
  name: string;
  quantity: number;
  price: string;          // string selon ton API
  category: DrinkCategory;
  description?: string;
}

export interface UpdateDrinkRequest {
  name?: string;
  quantity?: number;
  price?: string;         // string selon ton API
}

// Types internes pour le frontend
export interface Product {
  id: number;
  name: string;
  price: number;          // number pour le frontend
  stock: number;
  category: string;
  description?: string;
}
