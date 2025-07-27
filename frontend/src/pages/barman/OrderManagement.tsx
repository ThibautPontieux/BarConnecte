import React, { useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useOrderStore } from '../../stores/useOrderStore';
import { useProductStore } from '../../stores/useProductStore';
import { OrderCard } from '../../components/features/Orders/OrderCard';

export const OrderManagement: React.FC = () => {
  const { updateOrderStatus, getPendingOrders } = useOrderStore();
  const updateStock = useProductStore((state) => state.updateStock);
  const pendingOrders = getPendingOrders();

  // Log des commandes pour debug
  useEffect(() => {
    console.log('📋 OrderManagement: Commandes en attente:', pendingOrders);
  }, [pendingOrders]);

  const handleAcceptOrder = (orderId: number) => {
    const order = pendingOrders.find((o) => o.id === orderId);
    if (order) {
      console.log('✅ Acceptation commande:', order);
      // Mettre à jour le stock
      order.items.forEach((item) => {
        updateStock(item.id, item.stock - item.quantity);
      });
      updateOrderStatus(orderId, 'accepted');
    }
  };

  const handleRejectOrder = (orderId: number) => {
    console.log('❌ Refus commande:', orderId);
    updateOrderStatus(orderId, 'rejected');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Commandes en attente ({pendingOrders.length})
      </h1>

      {pendingOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune commande en attente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
          {pendingOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={handleAcceptOrder}
              onReject={handleRejectOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
};
