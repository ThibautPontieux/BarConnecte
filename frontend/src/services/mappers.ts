import { 
  type Drink, 
  type DrinkResponse, 
  DrinkCategory, 
  type Product, 
  DRINK_CATEGORY_NAMES,
  type CreateDrinkRequest,
  type OrderDto,
  type OrderDrinkDto,
  type CreateOrderRequest,
  type CreateOrderItemRequest,
  type OrderResponse
} from './types';
import type { CartItem, Order } from '../types';

export class DrinkMapper {
  // === CONVERSION DRINKS ===
  
  // Convertir DrinkResponse (API Public) vers Product (frontend)
  static drinkResponseToProduct(drink: DrinkResponse, id: number = 0): Product {
    return {
      id,
      name: drink.name,
      price: parseFloat(drink.price || '0'), // Conversion string -> number
      stock: drink.quantity,
      category: DRINK_CATEGORY_NAMES[drink.category] || 'Autre',
      description: drink.description,
    };
  }

  // Convertir Drink (API Admin) vers Product (frontend)
  static drinkToProduct(drink: Drink): Product {
    return {
      id: drink.id,
      name: drink.name,
      price: drink.price, // Déjà un number côté admin
      stock: drink.quantity,
      category: DRINK_CATEGORY_NAMES[drink.category] || 'Autre',
      description: drink.description,
    };
  }

  // Convertir Product (frontend) vers CreateDrinkRequest (API)
  static productToCreateDrinkRequest(product: Omit<Product, 'id'>): CreateDrinkRequest {
    const categoryEntry = Object.entries(DRINK_CATEGORY_NAMES)
      .find(([_, name]) => name === product.category);
    
    const category = categoryEntry 
      ? parseInt(categoryEntry[0]) as DrinkCategory
      : DrinkCategory.Bieres;

    return {
      name: product.name,
      quantity: product.stock,
      price: product.price.toString(), // Conversion number -> string pour l'API
      category,
      description: product.description,
    };
  }

  // === CONVERSION COMMANDES ===
  
  // Convertir CartItem[] vers CreateOrderRequest (NOUVELLE API)
  static cartToCreateOrderRequest(cartItems: CartItem[], customerName: string): CreateOrderRequest {
    const items: CreateOrderItemRequest[] = cartItems.map(item => ({
      drinkId: item.id,
      quantity: item.quantity
    }));

    return {
      customerName,
      items
    };
  }

  // Convertir CartItem[] vers OrderDto (ANCIENNE API - pour compatibilité)
  static cartToOrderDto(cartItems: CartItem[], customerName: string): OrderDto {
    const drinks: OrderDrinkDto[] = cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity
    }));

    return {
      drinks
    };
  }

  // Convertir OrderResponse vers Order (frontend)
  static orderResponseToOrder(orderResponse: OrderResponse): Order {
    return {
      id: orderResponse.id,
      items: orderResponse.items.map(item => ({
        id: Date.now() + Math.random(), // ID temporaire pour les items
        name: item.drinkName,
        price: item.unitPrice,
        stock: 0, // Non disponible dans la réponse
        category: 'Unknown', // Non disponible dans la réponse
        quantity: item.quantity,
        description: undefined,
      })),
      total: orderResponse.totalAmount,
      status: orderResponse.status as 'pending' | 'accepted' | 'rejected' | 'ready' | 'completed',
      customerName: orderResponse.customerName,
      timestamp: new Date(orderResponse.createdAt),
    };
  }

  // Convertir Order (frontend) vers CreateOrderRequest
  static orderToCreateOrderRequest(order: Omit<Order, 'id' | 'timestamp'>): CreateOrderRequest {
    return {
      customerName: order.customerName,
      items: order.items.map(item => ({
        drinkId: item.id,
        quantity: item.quantity
      }))
    };
  }

  // === UTILITAIRES CATÉGORIES ===
  
  // Convertir nom de catégorie vers DrinkCategory enum
  static categoryNameToEnum(categoryName: string): DrinkCategory {
    const entry = Object.entries(DRINK_CATEGORY_NAMES)
      .find(([_, name]) => name === categoryName);
    
    return entry ? parseInt(entry[0]) as DrinkCategory : DrinkCategory.Bieres;
  }

  // Obtenir le nom de catégorie depuis l'enum
  static categoryEnumToName(category: DrinkCategory): string {
    return DRINK_CATEGORY_NAMES[category] || 'Autre';
  }

  // === MÉTHODES DE VALIDATION ===
  
  // Valider les données d'une commande avant envoi
  static validateOrderData(order: CreateOrderRequest): boolean {
    if (!order.customerName || order.customerName.trim().length === 0) {
      return false;
    }
    
    if (!order.items || order.items.length === 0) {
      return false;
    }
    
    for (const item of order.items) {
      if (!item.drinkId || item.quantity <= 0) {
        return false;
      }
    }
    
    return true;
  }

  // Calculer le total d'une commande depuis le panier
  static calculateOrderTotal(cartItems: CartItem[]): number {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  // === MÉTHODES DE TRANSFORMATION BATCH ===
  
  // Convertir un tableau de DrinkResponse vers Product[]
  static drinkResponsesToProducts(drinks: DrinkResponse[]): Product[] {
    return drinks.map((drink, index) => 
      this.drinkResponseToProduct(drink, index + 1)
    );
  }

  // Convertir un tableau de Drink vers Product[]
  static drinksToProducts(drinks: Drink[]): Product[] {
    return drinks.map(drink => this.drinkToProduct(drink));
  }

  // Convertir un tableau d'OrderResponse vers Order[]
  static orderResponsesToOrders(orderResponses: OrderResponse[]): Order[] {
    return orderResponses.map(orderResponse => 
      this.orderResponseToOrder(orderResponse)
    );
  }
}
