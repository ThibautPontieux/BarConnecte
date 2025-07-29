// frontend/src/pages/admin/Dashboard.tsx (version mise à jour)

import React, { useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useProductStore } from '../../stores/useProductStore';
import { ErrorDisplay, useErrorHandler } from '../../components/ui/ErrorDisplay';
import { AddProductForm } from './AddProductForm';
import { ProductManagement } from './ProductManagement';

export const Dashboard: React.FC = () => {
  const { products, loading, error, fetchProducts, clearError } = useProductStore();
  const { handleError, retry } = useErrorHandler();

  // Chargement automatique des données au montage
  useEffect(() => {
    console.log('🚀 Dashboard: Chargement des produits depuis l\'API Admin...');
    const loadProducts = async () => {
      try {
        await fetchProducts(false); // false = utilise l'API Admin pour l'administration
      } catch (err) {
        handleError(err);
      }
    };
    
    loadProducts();
  }, [fetchProducts, handleError]);

  // Fonction de retry personnalisée
  const handleRetryFetchProducts = () => {
    retry(() => fetchProducts(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6" />
        Administration
      </h1>

      {/* Affichage des erreurs avec le nouveau composant */}
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={handleRetryFetchProducts}
          onDismiss={clearError}
          variant="banner"
          showDetails={process.env.NODE_ENV === 'development'}
        />
      )}

      {/* Loading state */}
      {loading && products.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-700">Chargement des produits...</span>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="space-y-6">
        <AddProductForm />
        <ProductManagement />
      </div>

      {/* Stats rapides (optionnel) */}
      {products.length > 0 && !loading && (
        <div className="mt-8 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Statistiques rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              <div className="text-sm text-gray-600">Produits total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => p.quantity > 0).length}
              </div>
              <div className="text-sm text-gray-600">En stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => p.quantity === 0).length}
              </div>
              <div className="text-sm text-gray-600">Rupture</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.quantity > 0 && p.quantity <= 5).length}
              </div>
              <div className="text-sm text-gray-600">Stock faible</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
