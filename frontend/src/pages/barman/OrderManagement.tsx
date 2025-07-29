import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Package, Coffee, RefreshCw } from 'lucide-react';
import { useOrderStore } from '../../stores/useOrderStore';
import { useProductStore } from '../../stores/useProductStore';
import { OrderCard } from '../../components/features/Orders/OrderCard';
import { Badge } from '../../components/ui/Badge';
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

  // Obtenir les commandes de l'onglet actif
  const activeOrders = ordersByStatus[activeTab] || [];

  // Gestion des actions sur les commandes
  const handleAcceptOrder = async (orderId: number) => {
    try {
      const order = activeOrders.find(o => o.id === orderId);
      if (order) {
        console.log('✅ Acceptation commande:', order);
        
        // Accepter la commande via l'API
        await acceptOrder(orderId);
        
        // Mettre à jour le stock local
        order.items.forEach((item) => {
          updateStock(item.id, Math.max(0, item.stock - item.quantity));
        });
      }
    } catch (error) {
      console.error('Erreur acceptation commande:', error);
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    try {
      console.log('❌ Refus commande:', orderId);
      await rejectOrder(orderId);
    } catch (error) {
      console.error('Erreur refus commande:', error);
    }
  };

  const handleMarkReady = async (orderId: number) => {
    try {
      console.log('📦 Commande prête:', orderId);
      await markOrderReady(orderId);
    } catch (error) {
      console.error('Erreur marquage prêt:', error);
    }
  };

  const handleComplete = async (orderId: number) => {
    try {
      console.log('✅ Finalisation commande:', orderId);
      await completeOrder(orderId);
    } catch (error) {
      console.error('Erreur finalisation:', error);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Refresh manuel des commandes...');
    refreshOrdersData();
    setLastRefresh(new Date());
  };

  // Configuration des onglets avec les nouvelles données
  const tabs = [
    {
      key: 'pending' as TabType,
      label: 'En attente',
      icon: Clock,
      count: stats.pending,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      key: 'accepted' as TabType,
      label: 'Acceptées',
      icon: CheckCircle,
      count: stats.accepted,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      key: 'ready' as TabType,
      label: 'Prêtes',
      icon: Package,
      count: stats.ready,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      key: 'completed' as TabType,
      label: 'Terminées',
      icon: Coffee,
      count: stats.completed,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      key: 'rejected' as TabType,
      label: 'Refusées',
      icon: XCircle,
      count: stats.rejected,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const activeTabConfig = tabs.find(tab => tab.key === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* En-tête avec statistiques */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coffee className="w-6 h-6" />
            Gestion des commandes
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Statistiques globales */}
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
              <span>Total: <strong>{stats.total}</strong></span>
              <span>•</span>
              <span>En attente: <strong className="text-yellow-600">{stats.pending}</strong></span>
              <span>•</span>
              <span className="text-xs">
                Dernière mise à jour: {lastRefresh.toLocaleTimeString('fr-FR')}
              </span>
            </div>
            
            {/* Bouton refresh */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Actualiser les commandes"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Actualiser</span>
            </button>
          </div>
        </div>
        
        {/* Affichage des erreurs */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <span><strong>Erreur:</strong> {error}</span>
              <button
                onClick={clearError}
                className="text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation par onglets */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                    ${isActive
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : tab.color}`} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <Badge 
                      variant={isActive ? 'warning' : 'default'}
                      className="ml-1"
                    >
                      {tab.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des commandes...</p>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            {activeTabConfig && (
              <>
                <div className={`w-16 h-16 rounded-full ${activeTabConfig.bgColor} flex items-center justify-center mx-auto mb-4`}>
                  <activeTabConfig.icon className={`w-8 h-8 ${activeTabConfig.color}`} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune commande {activeTabConfig.label.toLowerCase()}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'pending' && "Les nouvelles commandes apparaîtront ici"}
                  {activeTab === 'accepted' && "Les commandes acceptées en cours de préparation"}
                  {activeTab === 'ready' && "Les commandes prêtes à être récupérées"}
                  {activeTab === 'completed' && "L'historique des commandes terminées"}
                  {activeTab === 'rejected' && "Les commandes qui ont été refusées"}
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Résumé des commandes affichées */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {activeOrders.length} commande{activeOrders.length > 1 ? 's' : ''} {activeTabConfig?.label.toLowerCase()}
                  </span>
                  {activeTab === 'pending' && activeOrders.length > 0 && (
                    <span className="text-sm text-amber-600 font-medium">
                      ⚠️ Nécessite votre attention
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Total commandes: {stats.total}
                </div>
              </div>
            </div>

            {/* Liste des commandes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
              {activeOrders.map((order) => (
                <EnhancedOrderCard
                  key={order.id}
                  order={order}
                  onAccept={handleAcceptOrder}
                  onReject={handleRejectOrder}
                  onMarkReady={handleMarkReady}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bouton de rechargement flottant (mobile) */}
      <div className="fixed bottom-4 right-4 md:hidden">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full shadow-lg transition-colors disabled:opacity-50"
          title="Actualiser les commandes"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

// Composant OrderCard amélioré avec toutes les actions
interface EnhancedOrderCardProps {
  order: Order;
  onAccept: (orderId: number) => void;
  onReject: (orderId: number) => void;
  onMarkReady: (orderId: number) => void;
  onComplete: (orderId: number) => void;
}

const EnhancedOrderCard: React.FC<EnhancedOrderCardProps> = ({
  order,
  onAccept,
  onReject,
  onMarkReady,
  onComplete,
}) => {
  const getStatusBadge = (status: Order['status']) => {
    const config = {
      pending: { label: 'En attente', variant: 'warning' as const, icon: Clock },
      accepted: { label: 'Acceptée', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Refusée', variant: 'danger' as const, icon: XCircle },
      ready: { label: 'Prête', variant: 'success' as const, icon: Package },
      completed: { label: 'Terminée', variant: 'default' as const, icon: Coffee },
    };
    
    // Vérification et valeur par défaut
    const statusConfig = config[status] || {
      label: `Statut: ${status}`,
      variant: 'default' as const,
      icon: Clock
    };
    
    console.log('🏷️ Status reçu:', status, 'Config trouvée:', statusConfig);
    
    const { label, variant, icon: StatusIcon } = statusConfig;
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <StatusIcon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const getActions = () => {
    switch (order.status) {
      case 'pending':
        return (
          <>
            <button
              onClick={() => onAccept(order.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Accepter
            </button>
            <button
              onClick={() => onReject(order.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Refuser
            </button>
          </>
        );
      case 'accepted':
        return (
          <button
            onClick={() => onMarkReady(order.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Package className="w-4 h-4" />
            Marquer prête
          </button>
        );
      case 'ready':
        return (
          <button
            onClick={() => onComplete(order.id)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Coffee className="w-4 h-4" />
            Finaliser
          </button>
        );
      default:
        return null;
    }
  };

  const getTimeDisplay = () => {
    const now = new Date();
    const orderTime = order.timestamp;
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else {
      return orderTime.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{order.customerName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500 text-sm">{getTimeDisplay()}</p>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500">#{order.id}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(order.status)}
          <span className="text-xl font-bold text-amber-600">
            {order.total.toFixed(2)}€
          </span>
        </div>
      </div>

      <div className="mb-4">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between py-1 text-sm">
            <span className="text-gray-700">
              <span className="font-medium">{item.quantity}x</span> {item.name}
            </span>
            <span className="font-medium">
              {(item.price * item.quantity).toFixed(2)}€
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        {getActions()}
      </div>
    </div>
  );
};
