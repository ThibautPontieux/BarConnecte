import { useMemo } from 'react';
import { useProductStore } from '../stores/useProductStore';

export const useCategories = () => {
  const products = useProductStore((state) => state.products);
  
  return useMemo(() => {
    const categories = Array.from(new Set(products.map((p) => p.category)));
    return ['all', ...categories];
  }, [products]);
};
