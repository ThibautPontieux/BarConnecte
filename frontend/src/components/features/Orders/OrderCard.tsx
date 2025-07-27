import React from 'react';
import { Check, X } from 'lucide-react';
import type { Order } from '../../../types';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { formatPrice, formatTime } from '../../../utils/formatters';

interface OrderCardProps {
  order: Order;
  onAccept: (orderId: number) => void;
  onReject: (orderId: number) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onAccept,
  onReject,
}) => {
  return (
    <Card className="p-6">
      {/* Layout desktop optimisé */}
      <div className="md:flex md:items-center md:justify-between md:gap-6">
        
        {/* Info commande - gauche sur desktop */}
        <div className="md:flex-1">
          <div className="flex justify-between items-start mb-4 md:mb-2">
            <div>
              <h3 className="text-lg font-semibold">{order.customerName}</h3>
              <p className="text-gray-500 text-sm">{formatTime(order.timestamp)}</p>
            </div>
            <span className="text-xl font-bold text-amber-600 md:hidden">
              {formatPrice(order.total)}
            </span>
          </div>

          <div className="mb-4 md:mb-0">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-1 text-sm md:text-base">
                <span>{item.quantity}x {item.name}</span>
                <span className="md:hidden">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Partie droite sur desktop - Prix et actions */}
        <div className="md:flex md:flex-col md:items-end md:gap-4 md:min-w-[200px]">
          
          {/* Prix - visible seulement sur desktop */}
          <div className="hidden md:block">
            <div className="text-right mb-2">
              {order.items.map((item) => (
                <div key={item.id} className="text-sm text-gray-600">
                  {formatPrice(item.price * item.quantity)}
                </div>
              ))}
            </div>
            <div className="text-xl font-bold text-amber-600 border-t pt-2">
              {formatPrice(order.total)}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 justify-center md:justify-end">
            <Button
              onClick={() => onAccept(order.id)}
              variant="success"
              icon={Check}
              className="flex-1 max-w-[120px] md:flex-initial md:min-w-[100px]"
              size="sm"
            >
              Accepter
            </Button>
            <Button
              onClick={() => onReject(order.id)}
              variant="danger"
              icon={X}
              className="flex-1 max-w-[120px] md:flex-initial md:min-w-[100px]"
              size="sm"
            >
              Refuser
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
