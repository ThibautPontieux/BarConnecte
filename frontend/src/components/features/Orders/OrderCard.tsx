import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Search,
  Edit3,
  Zap,
  AlertTriangle,
  User,
  Euro,
  Calendar
} from 'lucide-react';
import type { Order } from '../../../types/Order';
import { 
  getOrderWorkflow, 
  ORDER_STATUS_LABELS, 
  ORDER_STATUS_COLORS, 
  hasOrderBeenModified 
} from '../../../types/Order';
import { useOrderEditing } from '../../../hooks/useOrderEditing';
import { useOrderFeedback } from './OrderActionFeedback';
import { StockCheckDisplay } from './StockCheckDisplay';
import { OrderEditModal } from './OrderEditModal';
import { OrderModificationHistory } from './OrderModificationHistory';
import { QuickEditSuggestions } from './QuickEditSuggestions';

interface OrderCardProps {
  order: Order;
  onAccept?: () => void;
  onReject?: () => void;
  onMarkReady?: () => void;
  onComplete?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onAccept,
  onReject,
  onMarkReady,
  onComplete
}) => {
  // Hook d'édition personnalisé
  const {
    isCheckingStock,
    isEditing,
    showEditModal,
    showStockCheck,
    stockCheck,
    suggestions,
    checkStock,
    openEditModal,
    closeEditModal,
    saveEdit,
    acceptWithoutOutOfStock,
    acceptWithAdjustedQuantities,
    getSuggestions,
    hasStockIssues,
    getIssueCount,
    getIssuesSummary,
    setShowStockCheck,
    error
  } = useOrderEditing(order.id);

  // Hook de feedback
  const feedback = useOrderFeedback();

  const workflow = getOrderWorkflow(order.status);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // === GESTIONNAIRES D'ÉVÉNEMENTS ===

  const handleCheckStock = async () => {
    try {
      const result = await checkStock();
      if (result) {
        feedback.info.stockChecked(order.id, result.issues.length);
      }
    } catch (error) {
      feedback.error.orderAction('vérifier le stock', order.id, 'Erreur réseau');
    }
  };

  const handleEditOrder = async () => {
    try {
      await openEditModal();
    } catch (error) {
      feedback.error.orderAction('ouvrir l\'éditeur', order.id, 'Impossible d\'ouvrir l\'éditeur');
    }
  };

  const handleSaveEdit = async (editRequest: any) => {
    try {
      const success = await saveEdit(editRequest);
      if (success) {
        feedback.success.orderEdited(order.id, editRequest.reason);
      }
    } catch (error) {
      feedback.error.orderAction('sauvegarder les modifications', order.id, 'Échec de la sauvegarde');
    }
  };

  const handleAcceptPartial = async () => {
    try {
      const success = await acceptWithoutOutOfStock();
      if (success && stockCheck) {
        const removedCount = stockCheck.issues.filter(i => i.type === 'OutOfStock').length;
        feedback.success.partialAccept(order.id, removedCount);
      }
    } catch (error) {
      feedback.error.orderAction('accepter partiellement', order.id, 'Échec de l\'acceptation partielle');
    }
  };

  const handleAcceptAdjusted = async () => {
    try {
      const success = await acceptWithAdjustedQuantities();
      if (success && stockCheck) {
        const modifiedCount = stockCheck.issues.filter(i => i.type === 'InsufficientStock').length;
        feedback.success.quantitiesModified(order.id, modifiedCount);
      }
    } catch (error) {
      feedback.error.orderAction('ajuster les quantités', order.id, 'Échec de l\'ajustement');
    }
  };

  const handleGetSuggestions = async () => {
    try {
      await getSuggestions();
    } catch (error) {
      feedback.error.orderAction('récupérer les suggestions', order.id, 'Impossible de générer les suggestions');
    }
  };

  const handleAcceptNormal = async () => {
    try {
      if (onAccept) {
        await onAccept();
        feedback.success.orderAccepted(order.id);
      }
    } catch (error) {
      feedback.error.orderAction('accepter', order.id, 'Échec de l\'acceptation');
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      
      {/* Header avec informations principales */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>Commande #{order.id}</span>
                {hasOrderBeenModified(order) && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    ✏️ Modifiée
                  </span>
                )}
                {hasStockIssues() && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    ⚠️ {getIssueCount()} problème(s)
                  </span>
                )}
              </h3>
              <div className="text-sm text-gray-600 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {order.customerName}
                </span>
                <span className="flex items-center gap-1">
                  <Euro className="w-3 h-3" />
                  {order.total.toFixed(2)}€
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(order.timestamp)}
                </span>
              </div>
              {hasStockIssues() && (
                <div className="text-xs text-orange-600 mt-1">
                  {getIssuesSummary()}
                </div>
              )}
            </div>
          </div>

          {/* Statut */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </div>
        </div>
      </div>

      {/* Historique des modifications si applicable */}
      {hasOrderBeenModified(order) && (
        <div className="p-4 border-b">
          <OrderModificationHistory order={order} />
        </div>
      )}

      {/* Articles de la commande */}
      <div className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Articles ({order.items.length})
        </h4>
        <div className="space-y-2">
          {order.items.map((item, index) => {
            const itemHasIssue = stockCheck?.issues.find(issue => issue.drinkId === item.id);
            
            return (
              <div 
                key={index}
                className={`flex justify-between items-center p-2 rounded ${
                  itemHasIssue 
                    ? 'bg-orange-50 border border-orange-200' 
                    : 'bg-gray-50'
                }`}
              >
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {item.price.toFixed(2)}€ × {item.quantity}
                  </span>
                  {itemHasIssue && (
                    <span className="ml-2 text-xs text-orange-600">
                      ⚠️ {itemHasIssue.type === 'OutOfStock' ? 'Rupture' : 'Stock limité'}
                    </span>
                  )}
                </div>
                <div className="font-medium">
                  {(item.price * item.quantity).toFixed(2)}€
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vérification de stock si affichée */}
      {showStockCheck && stockCheck && (
        <div className="p-4 border-t">
          <StockCheckDisplay
            stockCheck={stockCheck}
            onEdit={workflow.canEdit ? handleEditOrder : undefined}
            onAcceptPartial={workflow.canAcceptPartially ? handleAcceptPartial : undefined}
            onProceedAnyway={stockCheck.isFullyAvailable ? handleAcceptNormal : undefined}
          />
        </div>
      )}

      {/* Suggestions d'édition rapide */}
      {stockCheck && !stockCheck.isFullyAvailable && showStockCheck && (
        <div className="p-4 border-t">
          <QuickEditSuggestions
            order={order}
            stockCheck={stockCheck}
            suggestions={suggestions}
            onApplySuggestion={async (id) => {
              // TODO: Implémenter l'application de suggestions spécifiques
              console.log('Applying suggestion:', id);
              return true;
            }}
            onAcceptWithoutOutOfStock={handleAcceptPartial}
            onAcceptWithAdjustedQuantities={handleAcceptAdjusted}
            isLoading={isEditing}
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t bg-gray-50">
        
        {/* Actions pour commandes en attente */}
        {order.status === 'pending' && (
          <div className="space-y-3">
            
            {/* Actions de vérification et édition */}
            <div className="flex gap-2">
              
              <button
                onClick={handleCheckStock}
                disabled={isCheckingStock}
                className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCheckingStock ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Vérifier stock
                  </>
                )}
              </button>

              {stockCheck && !stockCheck.isFullyAvailable && (
                <button
                  onClick={handleEditOrder}
                  disabled={isEditing}
                  className="flex-1 bg-orange-100 text-orange-700 py-2 px-3 rounded-lg hover:bg-orange-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Éditer
                </button>
              )}

              {stockCheck && suggestions && (
                <button
                  onClick={handleGetSuggestions}
                  className="bg-purple-100 text-purple-700 py-2 px-3 rounded-lg hover:bg-purple-200 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Suggestions
                </button>
              )}
            </div>

            {/* Bouton pour masquer/afficher la vérification de stock */}
            {stockCheck && (
              <div className="text-center">
                <button
                  onClick={() => setShowStockCheck(!showStockCheck)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showStockCheck ? 'Masquer les détails' : 'Afficher les détails'}
                </button>
              </div>
            )}

            {/* Actions principales */}
            <div className="flex gap-2">
              
              <button
                onClick={handleAcceptNormal}
                disabled={stockCheck && !stockCheck.isFullyAvailable}
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Accepter
              </button>

              <button
                onClick={onReject}
                className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Refuser
              </button>
            </div>

            {/* Warning si problème de stock */}
            {stockCheck && !stockCheck.isFullyAvailable && !showStockCheck && (
              <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {getIssueCount()} problème(s) de stock détecté(s). 
                Cliquez sur "Vérifier stock" pour plus de détails.
              </div>
            )}
          </div>
        )}

        {/* Actions pour commandes acceptées */}
        {order.status === 'accepted' && onMarkReady && (
          <button
            onClick={onMarkReady}
            className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            Marquer comme prête
          </button>
        )}

        {/* Actions pour commandes prêtes */}
        {order.status === 'ready' && onComplete && (
          <button
            onClick={onComplete}
            className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Finaliser
          </button>
        )}

        {/* Affichage des erreurs */}
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Modal d'édition */}
      {showEditModal && stockCheck && (
        <OrderEditModal
          order={order}
          stockCheck={stockCheck}
          onSave={handleSaveEdit}
          onCancel={closeEditModal}
          isLoading={isEditing}
        />
      )}
    </div>
  );
};
