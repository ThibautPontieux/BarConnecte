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
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{order.customerName}</h3>
          <p className="text-gray-500 text-sm">{formatTime(order.timestamp)}</p>
        </div>
        <span className="text-xl font-bold text-amber-600">
          {formatPrice(order.total)}
        </span>
      </div>

      <div className="mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-1">
            <span>{item.quantity}x {item.name}</span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onAccept(order.id)}
          variant="success"
          icon={Check}
          className="flex-1"
        >
          Accepter
        </Button>
        <Button
          onClick={() => onReject(order.id)}
          variant="danger"
          icon={X}
          className="flex-1"
        >
          Refuser
        </Button>
      </div>
    </Card>
  );
};
