import { 
  type Drink, 
  type DrinkResponse, 
  DrinkCategory, 
  type Product, 
  DRINK_CATEGORY_NAMES,
  type CreateDrinkRequest,
  type OrderDto,
  type OrderDrinkDto
} from './types';
import type { CartItem } from '../types';

export class DrinkMapper {
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
      price: parseFloat(drink.price || '0'), // Conversion string -> number
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
      price: product.price.toString(), // Conversion number -> string
      category,
      description: product.description,
    };
  }

  // Convertir CartItem[] vers OrderDto (pour les commandes)
  static cartToOrderDto(cartItems: CartItem[], customerName: string): OrderDto {
    const drinks: OrderDrinkDto[] = cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity
    }));

    return {
      drinks
    };
  }

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
}
