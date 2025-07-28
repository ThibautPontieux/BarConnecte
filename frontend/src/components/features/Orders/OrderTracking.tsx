import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Clock, CheckCircle, Package, Coffee, X } from 'lucide-react';
import { useOrderStore } from '../../../stores/useOrderStore';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { formatPrice, formatTime } from '../../../utils/formatters';
import { ORDER_STATUS_LABELS } from '../../../types/Order';
import type { Order } from '../../../types';

export const OrderTracking: React.FC = () => {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const { getOrderById, error } = useOrderStore();

  const handleSearchOrder = async () => {
    const orderId = parseInt(orderIdInput.trim());
    if (!orderId || isNaN(orderId)) return;

    setIsSearching(true);
    try {
      const order = await getOrderById(orderId);
      setTrackedOrder(order);
    } catch (error) {
      console.error('Erreur recherche commande:', error);
      setTrackedOrder(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchOrder();
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { key: 'pending', label: 'Reçue', icon: Clock },
      { key: 'accepted', label: 'En préparation', icon: CheckCircle },
      { key: 'ready', label: 'Prête', icon: Package },
      { key: 'completed', label: 'Terminée', icon: Coffee },
    ];

    return steps;
  };

  const getStepStatus = (stepKey: string, orderStatus: Order['status']) => {
    const statusOrder = ['pending', 'accepted', 'ready', 'completed'];
    const currentIndex = statusOrder.indexOf(orderStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (orderStatus === 'rejected') {
      return stepIndex === 0 ? 'completed' : 'disabled';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const renderProgressBar = (order: Order) => {
    const steps = getProgressSteps();

    if (order.status === 'rejected') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 text-red-800">
            <X className="w-6 h-6" />
            <div>
              <p className="font-semibold">Commande refusée</p>
              <p className="text-sm">Votre commande n'a pas pu être traitée</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Progression de votre commande</h4>
        
        <div className="flex items-center">
          {steps.map((step, index) => {
            const status = getStepStatus(step.key, order.status);
            const Icon = step.icon;
            
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                      ${status === 'completed' 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : status === 'current'
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`
                      mt-2 text-xs text-center font-medium
                      ${status === 'completed' || status === 'current' 
                        ? 'text-gray-900' 
                        : 'text-gray-400'
                      }
                    `}
                  >
                    {step.label}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-4 transition-colors
                      ${getStepStatus(steps[index + 1].key, order.status) === 'completed'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                      }
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Suivi de commande</h2>
        
        {/* Recherche */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Numéro de commande"
              value={orderIdInput}
              onChange={setOrderIdInput}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSearchOrder}
              disabled={!orderIdInput.trim() || isSearching}
              icon={isSearching ? RefreshCw : Search}
              variant="primary"
            >
              {isSearching ? 'Recherche...' : 'Rechercher'}
            </Button>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Résultats */}
        {trackedOrder ? (
          <div>
            {/* Informations commande */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Commande #{trackedOrder.id}</h3>
                  <p className="text-gray-600">{trackedOrder.customerName}</p>
                  <p className="text-sm text-gray-500">
                    Passée le {formatTime(trackedOrder.timestamp)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={
                      trackedOrder.status === 'completed' ? 'success' :
                      trackedOrder.status === 'rejected' ? 'danger' :
                      trackedOrder.status === 'ready' ? 'success' : 'warning'
                    }
                  >
                    {ORDER_STATUS_LABELS[trackedOrder.status]}
                  </Badge>
                  <p className="text-xl font-bold text-amber-600 mt-1">
                    {formatPrice(trackedOrder.total)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Détail de la commande</h4>
                {trackedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-1 text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Barre de progression */}
            {renderProgressBar(trackedOrder)}

            {/* Instructions selon le statut */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              {trackedOrder.status === 'pending' && (
                <div className="text-blue-800">
                  <p className="font-semibold">Commande reçue</p>
                  <p className="text-sm">Votre commande est en attente de validation par le barman.</p>
                </div>
              )}
              {trackedOrder.status === 'accepted' && (
                <div className="text-blue-800">
                  <p className="font-semibold">En préparation</p>
                  <p className="text-sm">Votre commande est en cours de préparation.</p>
                </div>
              )}
              {trackedOrder.status === 'ready' && (
                <div className="text-green-800">
                  <p className="font-semibold">Commande prête !</p>
                  <p className="text-sm">Votre commande vous attend au bar.</p>
                </div>
              )}
              {trackedOrder.status === 'completed' && (
                <div className="text-gray-800">
                  <p className="font-semibold">Commande terminée</p>
                  <p className="text-sm">Merci pour votre commande !</p>
                </div>
              )}
            </div>
          </div>
        ) : orderIdInput && !isSearching ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune commande trouvée avec ce numéro</p>
          </div>
        ) : null}
      </Card>
    </div>
  );
};
