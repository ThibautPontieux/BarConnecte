import React, { useState, useMemo } from 'react';
import { useProductStore } from '../../stores/useProductStore';
import { useCartStore } from '../../stores/useCartStore';
import { Header } from '../../components/layout/Header';
import { CategoryFilter } from '../../components/layout/CategoryFilter';
import { ProductGrid } from '../../components/features/Products/ProductGrid';
import { CartSummary } from '../../components/features/Cart/CartSummary';

export const BarView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const products = useProductStore((state) => state.products);
  const addToCart = useCartStore((state) => state.addToCart);

  const filteredProducts = useMemo(() => {
    return selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

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
