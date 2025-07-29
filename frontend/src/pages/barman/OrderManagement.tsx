import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Package, Coffee, RefreshCw } from 'lucide-react';
import { useOrderStore } from '../../stores/useOrderStore';
import { useProductStore } from '../../stores/useProductStore';
import { OrderCard } from '../../components/features/Orders/OrderCard';
import { Badge } from '../../components/ui/Badge';
import { ErrorDisplay } from '../../components/ui/ErrorDisplay';
import type { Order } from '../../types';

type TabType = 'pending' | 'accepted' | 'ready' | 'completed' | 'rejected';

export const OrderManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const { 
    ordersByStatus,
    loading,
    error,
    fetchAllOrders,
    refreshOrdersData,
    acceptOrder,
    rejectOrder,
    markOrderReady,
    completeOrder,
    getOrdersStats,
    clearError
  } = useOrderStore();
  
  const updateStock = useProductStore((state) => state.updateStock);

  // Chargement initial de toutes les commandes
  useEffect(() => {
    console.log('📋 OrderManagement: Chargement initial de toutes les commandes...');
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh des commandes...');
      refreshOrdersData();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshOrdersData]);

  // Statistiques des commandes
  const stats = getOrdersStats();
  const activeOrders = ordersByStatus[activeTab] || [];

  // Gestion des actions sur les commandes avec gestion d'erreurs améliorée
  const handleAcceptOrder = async (orderId: number) => {
    clearError(); // Reset de l'erreur précédente
    
    try {
      const order = activeOrders.find(o => o.id === orderId);
      if (!order) {
        console.error('Commande non trouvée:', orderId);
        return;
      }

      console.log('🔄 Tentative d\'acceptation de la commande:', orderId);
      await acceptOrder(orderId);
      
      // Si succès, optionnel: notification ou feedback positif
      console.log('✅ Commande acceptée avec succès');
      
    } catch (error) {
      // L'erreur est déjà gérée dans le store
      console.error('❌ Échec de l\'acceptation:', error);
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    clearError();
    
    try {
      await rejectOrder(orderId);
      console.log('✅ Commande refusée avec succès');
    } catch (error) {
      console.error('❌ Échec du refus:', error);
    }
  };

  const handleMarkReady = async (orderId: number) => {
    clearError();
    
    try {
      await markOrderReady(orderId);
      console.log('✅ Commande marquée comme prête');
    } catch (error) {
      console.error('❌ Échec du marquage:', error);
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    clearError();
    
    try {
      await completeOrder(orderId);
      console.log('✅ Commande finalisée avec succès');
    } catch (error) {
      console.error('❌ Échec de la finalisation:', error);
    }
  };

  // Actions retry pour différents types d'erreurs
  const handleRetryFetch = () => {
    console.log('🔄 Retry: rechargement des commandes...');
    fetchAllOrders();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header avec stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coffee className="w-6 h-6" />
            Gestion des commandes
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Dernière MAJ: {lastRefresh.toLocaleTimeString()}
            </div>
            <button
              onClick={handleRetryFetch}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Affichage d'erreur amélioré */}
        {error && (
          <ErrorDisplay
            error={error}
            onRetry={handleRetryFetch}
            onDismiss={clearError}
            variant="banner"
            showDetails={process.env.NODE_ENV === 'development'}
          />
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">En attente</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.accepted}</div>
            <div className="text-sm text-gray-600">Acceptées</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
            <div className="text-sm text-gray-600">Prêtes</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Terminées</div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { key: 'pending', label: 'En attente', icon: Clock, count: stats.pending },
            { key: 'accepted', label: 'Acceptées', icon: CheckCircle, count: stats.accepted },
            { key: 'ready', label: 'Prêtes', icon: Package, count: stats.ready },
            { key: 'completed', label: 'Terminées', icon: CheckCircle, count: stats.completed },
            { key: 'rejected', label: 'Refusées', icon: XCircle, count: stats.rejected },
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as TabType)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 whitespace-nowrap ${
                activeTab === key
                  ? 'border-amber-500 text-amber-600 bg-amber-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <Badge variant="secondary">{count}</Badge>
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {loading && activeOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des commandes...</p>
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Coffee className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune commande {activeTab === 'pending' ? 'en attente' : activeTab}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAccept={() => handleAcceptOrder(order.id)}
                  onReject={() => handleRejectOrder(order.id)}
                  onMarkReady={() => handleMarkReady(order.id)}
                  onComplete={() => handleCompleteOrder(order.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
