import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Package, Coffee } from 'lucide-react';
import { useOrderStore } from '../../stores/useOrderStore';
import { useProductStore } from '../../stores/useProductStore';
import { OrderCard } from '../../components/features/Orders/OrderCard';
import { Badge } from '../../components/ui/Badge';
import type { Order } from '../../types';

type TabType = 'pending' | 'accepted' | 'ready' | 'completed';

export const OrderManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  
  const { 
    orders,
    loading,
    error,
    fetchOrders: fetchPendingOrders,
    acceptOrder,
    rejectOrder,
    markOrderReady,
    completeOrder,
    getOrdersByStatus,
    clearError
  } = useOrderStore();
  
  const updateStock = useProductStore((state) => state.updateStock);

  // Chargement initial des commandes
  useEffect(() => {
    console.log('📋 OrderManagement: Chargement des commandes...');
    fetchPendingOrders();
  }, [fetchPendingOrders]);

  // Log des commandes pour debug
  useEffect(() => {
    console.log('📊 OrderManagement state:', { 
      ordersCount: orders.length, 
      loading, 
      error,
      activeTab 
    });
  }, [orders, loading, error, activeTab]);

  // Filtrer les commandes selon l'onglet actif
  const filteredOrders = getOrdersByStatus(activeTab);

  // Gestion des actions sur les commandes
  const handleAcceptOrder = async (orderId: number) => {
    try {
      const order = orders.find(o => o.id === orderId);
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

  // Configuration des onglets
  const tabs = [
    {
      key: 'pending' as TabType,
      label: 'En attente',
      icon: Clock,
      count: getOrdersByStatus('pending').length,
      color: 'text-yellow-600',
    },
    {
      key: 'accepted' as TabType,
      label: 'Acceptées',
      icon: CheckCircle,
      count: getOrdersByStatus('accepted').length,
      color: 'text-blue-600',
    },
    {
      key: 'ready' as TabType,
      label: 'Prêtes',
      icon: Package,
      count: getOrdersByStatus('ready').length,
      color: 'text-green-600',
    },
    {
      key: 'completed' as TabType,
      label: 'Terminées',
      icon: Coffee,
      count: getOrdersByStatus('completed').length,
      color: 'text-gray-600',
    },
  ];

  const activeTabConfig = tabs.find(tab => tab.key === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Coffee className="w-6 h-6" />
          Gestion des commandes
        </h1>
        
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
                    whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                    ${isActive
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : tab.color}`} />
                  {tab.label}
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
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            {activeTabConfig && (
              <>
                <activeTabConfig.icon className={`w-12 h-12 mx-auto mb-4 ${activeTabConfig.color}`} />
                <p className="text-gray-500">
                  Aucune commande {activeTabConfig.label.toLowerCase()}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
            {filteredOrders.map((order) => (
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
        )}
      </div>

      {/* Bouton de rechargement */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={fetchPendingOrders}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full shadow-lg transition-colors disabled:opacity-50"
          title="Actualiser les commandes"
        >
          <Clock className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
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
      pending: { label: 'En attente', variant: 'warning' as const },
      accepted: { label: 'Acceptée', variant: 'default' as const },
      rejected: { label: 'Refusée', variant: 'danger' as const },
      ready: { label: 'Prête', variant: 'success' as const },
      completed: { label: 'Terminée', variant: 'default' as const },
    };
    
    const { label, variant } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getActions = () => {
    switch (order.status) {
      case 'pending':
        return (
          <>
            <button
              onClick={() => onAccept(order.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Accepter
            </button>
            <button
              onClick={() => onReject(order.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Marquer prête
          </button>
        );
      case 'ready':
        return (
          <button
            onClick={() => onComplete(order.id)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Coffee className="w-4 h-4" />
            Finaliser
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{order.customerName}</h3>
          <p className="text-gray-500 text-sm">
            {order.timestamp.toLocaleTimeString('fr-FR')}
          </p>
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
            <span>{item.quantity}x {item.name}</span>
            <span>{(item.price * item.quantity).toFixed(2)}€</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        {getActions()}
      </div>
    </div>
  );
};
