import { create } from 'zustand';
import type { Product } from '../types';
import { AdminApiService } from '../services/adminApi';
import { PublicApiService } from '../services/publicApi';
import { DrinkMapper } from '../services/mappers';

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: (usePublicApi?: boolean) => Promise<void>;
  fetchProductsByCategory: (category: string, usePublicApi?: boolean) => Promise<void>;
  setProducts: (products: Product[]) => void;
  updateStock: (id: number, newStock: number) => Promise<void>;
  updatePrice: (id: number, newPrice: number) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (usePublicApi = false) => {
    set({ loading: true, error: null });
    try {
      if (usePublicApi) {
        const drinkResponses = await PublicApiService.getMenu();
        const products = drinkResponses.map((drink, index) => 
          DrinkMapper.drinkResponseToProduct(drink, index + 1)
        );
        set({ products, loading: false });
      } else {
        const drinkResponses = await AdminApiService.getAllDrinks();
        const products = drinkResponses.map((drink, index) => 
          DrinkMapper.drinkResponseToProduct(drink, index + 1)
        );
        set({ products, loading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des produits',
        loading: false 
      });
    }
  },

  fetchProductsByCategory: async (category: string, usePublicApi = false) => {
    set({ loading: true, error: null });
    try {
      if (usePublicApi) {
        const drinks = await PublicApiService.getDrinksByCategory(category);
        const products = drinks.map(DrinkMapper.drinkToProduct);
        set({ products, loading: false });
      } else {
        // Pour l'admin, on récupère tout et on filtre côté frontend
        await get().fetchProducts(false);
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des produits par catégorie',
        loading: false 
      });
    }
  },

  setProducts: (products) => set({ products }),

  updateStock: async (id, newStock) => {
    try {
      await AdminApiService.updateDrinkQuantity(id, newStock);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, stock: newStock } : p
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du stock' });
    }
  },

  updatePrice: async (id, newPrice) => {
    try {
      await AdminApiService.updateDrinkPrice(id, newPrice.toString());
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, price: newPrice } : p
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du prix' });
    }
  },

  addProduct: async (productData) => {
    try {
      const createRequest = DrinkMapper.productToCreateDrinkRequest(productData);
      const newDrink = await AdminApiService.createDrink(createRequest);
      const newProduct = DrinkMapper.drinkToProduct(newDrink);
      
      set((state) => ({
        products: [...state.products, newProduct],
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du produit' });
    }
  },

  deleteProduct: async (id) => {
    try {
      await AdminApiService.deleteDrink(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erreur lors de la suppression du produit' });
    }
  },

  clearError: () => set({ error: null }),
}));
