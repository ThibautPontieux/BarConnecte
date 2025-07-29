export interface ApiWrapper<T> {
  success: boolean;
  data: T;
  errorMessage?: string;
}

// === TYPES POUR LES DRINKS ===
export interface Drink {
  id: number;
  name: string;
  quantity: number;
  price: number;          // number côté admin API
  category: DrinkCategory;
  description?: string;
}

export interface DrinkResponse {
  id: number;
  name: string;
  quantity: number;
  price: string;          // string côté public API
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
  [DrinkCategory.Bieres]: 'Bières',
  [DrinkCategory.Spiritueux]: 'Spiritueux',
  [DrinkCategory.Cocktails]: 'Cocktails',
  [DrinkCategory.Vins]: 'Vins',
  [DrinkCategory.Champagnes]: 'Champagnes',
  [DrinkCategory.Cafe]: 'Café',
  [DrinkCategory.Sodas]: 'Sodas',
  [DrinkCategory.Eaux]: 'Eaux',
  [DrinkCategory.Jus]: 'Jus',
};

// === TYPES POUR LES COMMANDES ===
export interface OrderResponse {
  id: number;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderItemResponse {
  drinkName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderRequest {
  customerName: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  drinkId: number;
  quantity: number;
}

// === TYPES LEGACY (pour compatibilité) ===
export interface OrderDrinkDto {
  name: string;
  quantity: number;
}

export interface OrderDto {
  drinks: OrderDrinkDto[];
}

// === TYPES API RESPONSES ===
export interface GetMenuResponse {
  drinks: DrinkResponse[];
}

export interface DrinkListApiWrapper extends ApiWrapper<Drink[]> {}
export interface GetMenuResponseApiWrapper extends ApiWrapper<GetMenuResponse> {}
export interface StringApiWrapper extends ApiWrapper<string> {}

// === TYPES POUR LES REQUÊTES ADMIN ===
export interface CreateDrinkRequest {
  name: string;
  quantity: number;
  price: string;          // string selon l'API
  category: DrinkCategory;
  description?: string;
}

export interface UpdateDrinkRequest {
  name?: string;
  quantity?: number;
  price?: string;         // string selon l'API
  category?: DrinkCategory;
  description?: string;
}

// === TYPES INTERNES FRONTEND ===
export interface Product {
  id: number;
  name: string;
  price: number;          // number pour le frontend
  stock: number;
  category: string;
  description?: string;
}
