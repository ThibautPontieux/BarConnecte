import React from 'react';
import { Check, X, Clock, Package, Coffee, CheckCircle } from 'lucide-react';
import type { Order } from '../../../types';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { formatPrice, formatTime } from '../../../utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, getOrderWorkflow } from '../../../types/Order';

interface OrderCardProps {
  order: Order;
  onAccept?: (orderId: number) => void;
  onReject?: (orderId: number) => void;
  onMarkReady?: (orderId: number) => void;
  onComplete?: (orderId: number) => void;
  showActions?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onAccept,
  onReject,
  onMarkReady,
  onComplete,
  showActions = true,
}) => {
  const workflow = getOrderWorkflow(order.status);

  const getStatusIcon = () => {
    switch (order.status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      case 'ready':
        return <Package className="w-4 h-4" />;
      case 'completed':
        return <Coffee className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = () => {
    const colorClass = ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.pending;
    const label = ORDER_STATUS_LABELS[order.status] || 'Inconnu';
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {getStatusIcon()}
        {label}
      </span>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    const actions = [];

    if (workflow.canAccept && onAccept) {
      actions.push(
        <Button
          key="accept"
          onClick={() => onAccept(order.id)}
          variant="success"
          icon={Check}
          size="sm"
          className="flex-1 md:flex-initial md:min-w-[100px]"
        >
          Accepter
        </Button>
      );
    }

    if (workflow.canReject && onReject) {
      actions.push(
        <Button
          key="reject"
          onClick={() => onReject(order.id)}
          variant="danger"
          icon={X}
          size="sm"
          className="flex-1 md:flex-initial md:min-w-[100px]"
        >
          Refuser
        </Button>
      );
    }

    if (workflow.canMarkReady && onMarkReady) {
      actions.push(
        <Button
          key="ready"
          onClick={() => onMarkReady(order.id)}
          variant="primary"
          icon={Package}
          size="sm"
          className="flex-1 md:flex-initial md:min-w-[100px]"
        >
          Prête
        </Button>
      );
    }

    if (workflow.canComplete && onComplete) {
      actions.push(
        <Button
          key="complete"
          onClick={() => onComplete(order.id)}
          variant="success"
          icon={Coffee}
          size="sm"
          className="flex-1 md:flex-initial md:min-w-[100px]"
        >
          Finaliser
        </Button>
      );
    }

    return actions.length > 0 ? (
      <div className="flex gap-2 justify-center md:justify-end mt-4">
        {actions}
      </div>
    ) : null;
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      {/* Layout desktop optimisé */}
      <div className="md:flex md:items-start md:justify-between md:gap-6">
        
        {/* Info commande - gauche sur desktop */}
        <div className="md:flex-1">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold">{order.customerName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-500 text-sm">{formatTime(order.timestamp)}</p>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500">#{order.id}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge()}
              <span className="text-xl font-bold text-amber-600 md:hidden">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          {/* Items de la commande */}
          <div className="mb-4 md:mb-0">
            <div className="space-y-1">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between py-1 text-sm md:text-base">
                  <span className="text-gray-700">
                    <span className="font-medium">{item.quantity}x</span> {item.name}
                  </span>
                  <span className="md:hidden font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Informations supplémentaires */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 flex justify-between">
                <span>{order.items.length} article(s)</span>
                <span>Commande #{order.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Partie droite sur desktop - Prix et actions */}
        <div className="md:flex md:flex-col md:items-end md:gap-4 md:min-w-[200px]">
          
          {/* Prix détaillé - visible seulement sur desktop */}
          <div className="hidden md:block">
            <div className="text-right mb-2 space-y-1">
              {order.items.map((item, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {formatPrice(item.price * item.quantity)}
                </div>
              ))}
            </div>
            <div className="text-xl font-bold text-amber-600 border-t pt-2">
              {formatPrice(order.total)}
            </div>
          </div>

          {/* Actions */}
          {renderActions()}
        </div>
      </div>

      {/* Actions sur mobile (en bas) */}
      <div className="md:hidden">
        {renderActions()}
      </div>
    </Card>
  );
};
