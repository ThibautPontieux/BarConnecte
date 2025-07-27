import React, { useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useProductStore } from '../../stores/useProductStore';
import { AddProductForm } from './AddProductForm';
import { ProductManagement } from './ProductManagement';

export const Dashboard: React.FC = () => {
  const { products, loading, error, fetchProducts } = useProductStore();

  // Chargement automatique des données au montage
  useEffect(() => {
    console.log('🚀 Dashboard: Chargement des produits depuis l\'API Admin...');
    fetchProducts(false); // false = utilise l'API Admin pour l'administration
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6" />
        Administration
      </h1>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Erreur:</strong> {error}
          <button
            onClick={() => fetchProducts(false)}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Réessayer
          </button>
        </div>
      )}

      <AddProductForm />
      <ProductManagement />
    </div>
  );
};
