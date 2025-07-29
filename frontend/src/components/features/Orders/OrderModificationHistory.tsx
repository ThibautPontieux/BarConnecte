import React from 'react';
import { Clock, Edit3, AlertTriangle, Info } from 'lucide-react';
import type { Order } from '../../../types/Order';
import { hasOrderBeenModified } from '../../../types/Order';

interface OrderModificationHistoryProps {
  order: Order;
  className?: string;
}

export const OrderModificationHistory: React.FC<OrderModificationHistoryProps> = ({
  order,
  className = ''
}) => {
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Si la commande n'a pas été modifiée, on n'affiche rien
  if (!hasOrderBeenModified(order)) {
    return null;
  }

  return (
    <div className={`border border-blue-200 bg-blue-50 rounded-lg ${className}`}>
      
      {/* Header */}
      <div className="p-3 border-b border-blue-200 flex items-center gap-2">
        <Edit3 className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-blue-900">
          Historique des modifications
        </h3>
      </div>

      {/* Contenu */}
      <div className="p-3">
        
        {/* Indicateur de modification */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-blue-900">
                Commande modifiée par le barman
              </span>
              <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                Modifiée
              </span>
            </div>
            
            <div className="text-sm text-blue-700 mb-2">
              <Clock className="w-3 h-3 inline mr-1" />
              {order.lastModifiedAt ? formatDateTime(order.lastModifiedAt) : 'Date inconnue'}
            </div>

            {/* Raison de la modification */}
            {order.modificationReason && (
              <div className="bg-white border border-blue-200 rounded p-2">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">
                      Raison de la modification:
                    </div>
                    <div className="text-sm text-gray-700">
                      {order.modificationReason}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations contextuelles */}
        <div className="text-xs text-blue-600 bg-white border border-blue-200 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-medium">Information:</span>
          </div>
          <div>
            Cette commande a été ajustée suite à des problèmes de stock ou à la demande du client. 
            Le montant final a été recalculé automatiquement.
          </div>
        </div>

        {/* Comparaison si possible (future amélioration) */}
        {/* On pourrait ajouter ici une comparaison avant/après si on stockait l'état original */}
      </div>
    </div>
  );
};
