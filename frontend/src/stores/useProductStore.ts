import { create } from 'zustand';
import type { Product } from '../types';
import { AdminApiService } from '../services/adminApi';
import { PublicApiService } from '../services/publicApi';
import { DrinkMapper } from '../services/mappers';

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  
  fetchProducts: (usePublicApi?: boolean) => Promise<void>;
  fetchProductsByCategory: (category: string) => Promise<void>;
  setProducts: (products: Product[]) => void;
  updateStock: (id: number, newStock: number) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (usePublicApi = false) => {
    console.log(`fetchProducts démarré avec usePublicApi: ${usePublicApi}`);
    set({ loading: true, error: null });
    
    try {
      if (usePublicApi) {
        console.log('Appel API Public: /api/public');
        const drinkResponses = await PublicApiService.getMenu();
        console.log('Réponse API Public:', drinkResponses);
        
        const products = drinkResponses.map((drink, index) => 
          DrinkMapper.drinkResponseToProduct(drink, index + 1)
        );
        console.log('Produits mappés:', products);
        
        set({ products, loading: false });
      } else {
        console.log('Appel API Admin: /api/admin/drinks/all');
        const drinks = await AdminApiService.getAllDrinks();
        console.log('Réponse API Admin:', drinks);
        
        const products = drinks.map((drink) => 
          DrinkMapper.drinkResponseToProduct(drink)
        );

        console.log('Produits mappés (Admin):', products);
        
        set({ products, loading: false });
      }
    } catch (error) {
      console.error('Erreur dans fetchProducts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des produits';
      set({ 
        error: errorMessage,
        loading: false 
      });
    }
  },

  fetchProductsByCategory: async (category: string) => {
    console.log(`🔍 fetchProductsByCategory: ${category}`);
    set({ loading: true, error: null });
    try {
      const drinks = await PublicApiService.getDrinksByCategory(category);
      const products = drinks.map(DrinkMapper.drinkToProduct);
      set({ products, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement par catégorie',
        loading: false 
      });
    }
  },

  setProducts: (products) => {
    console.log('setProducts appelé avec:', products.length, 'produits');
    set({ products });
  },

  updateStock: async (id, newStock) => {
    console.log(`updateStock: produit ${id}, nouveau stock: ${newStock}`);
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

  addProduct: async (productData) => {
    console.log('addProduct:', productData);
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
    console.log(`deleteProduct: ${id}`);
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
