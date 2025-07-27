import React, { useState, useMemo, useEffect } from 'react';
import { useProductStore } from '../../stores/useProductStore';
import { useCartStore } from '../../stores/useCartStore';
import { Header } from '../../components/layout/Header';
import { CategoryFilter } from '../../components/layout/CategoryFilter';
import { ProductGrid } from '../../components/features/Products/ProductGrid';
import { CartSummary } from '../../components/features/Cart/CartSummary';

export const BarView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Store hooks
  const { products, loading, error, fetchProducts } = useProductStore();
  const addToCart = useCartStore((state) => state.addToCart);

  // Chargement automatique des données au montage
  useEffect(() => {
    console.log('🚀 BarView: Chargement des produits depuis l\'API Public...');
    fetchProducts(true); // true = utilise l'API Public pour les clients
  }, [fetchProducts]);

  // Debug
  useEffect(() => {
    console.log('📊 BarView state:', { 
      productsCount: products.length, 
      loading, 
      error,
      products: products.slice(0, 2) // Log des 2 premiers produits
    });
  }, [products, loading, error]);

  const filteredProducts = useMemo(() => {
    return selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Affichage de l'état de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Le Bar Connecté" showCart />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du menu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Le Bar Connecté" showCart />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">❌ Erreur: {error}</p>
            <button
              onClick={() => fetchProducts(true)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="Le Bar Connecté" showCart />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
      <CartSummary />
    </div>
  );
};
