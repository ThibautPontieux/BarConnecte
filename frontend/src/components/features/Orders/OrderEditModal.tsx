import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2, Plus, Minus, Save, AlertCircle, CheckCircle } from 'lucide-react';
import type { 
  Order, 
  StockCheckResult, 
  EditOrderRequest, 
  StockIssue,
  EditOrderItem 
} from '../../../types/Order';
import { getStockIssueDisplayText, getStockIssueColor, calculateTotalAfterChanges } from '../../../types/Order';

interface OrderEditModalProps {
  order: Order;
  stockCheck: StockCheckResult;
  onSave: (editRequest: EditOrderRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface EditableItem {
  id: number;
  drinkId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  originalQuantity: number;
  hasIssue: boolean;
  issue?: StockIssue;
}

export const OrderEditModal: React.FC<OrderEditModalProps> = ({
  order,
  stockCheck,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [reason, setReason] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialiser les items éditables
  useEffect(() => {
    const itemsWithIssues = order.items.map(item => {
      const issue = stockCheck.issues.find(i => i.drinkId === item.id);
      return {
        id: item.id,
        drinkId: item.id, // Assuming item.id is the drinkId
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        originalQuantity: item.quantity,
        hasIssue: !!issue,
        issue
      };
    });
    
    setEditableItems(itemsWithIssues);
    
    // Pré-remplir la raison si il y a des problèmes de stock
    if (stockCheck.issues.length > 0) {
      const issueDescriptions = stockCheck.issues.map(issue => 
        `${issue.drinkName}: ${getStockIssueDisplayText(issue)}`
      );
      setReason(`Ajustement suite aux problèmes de stock: ${issueDescriptions.join(', ')}`);
    }
  }, [order, stockCheck]);

  // Validation en temps réel
  useEffect(() => {
    const errors: string[] = [];
    
    if (!reason.trim()) {
      errors.push('Une raison doit être fournie pour la modification');
    }
    
    if (reason.length > 500) {
      errors.push('La raison ne peut pas dépasser 500 caractères');
    }
    
    const remainingItems = editableItems.filter(item => item.quantity > 0);
    if (remainingItems.length === 0) {
      errors.push('Au moins un article doit être conservé dans la commande');
    }
    
    // Vérifier que les quantités sont valides par rapport au stock disponible
    remainingItems.forEach(item => {
      if (item.issue) {
        if (item.issue.type === 'OutOfStock' && item.quantity > 0) {
          errors.push(`${item.name} est en rupture complète mais a une quantité > 0`);
        } else if (item.issue.type === 'InsufficientStock' && item.quantity > item.issue.availableQuantity) {
          errors.push(`${item.name}: seulement ${item.issue.availableQuantity} disponible(s), mais ${item.quantity} demandé(s)`);
        }
      }
    });
    
    setValidationErrors(errors);
  }, [editableItems, reason]);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setEditableItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(0, newQuantity) } : item
      )
    );
  };

  const handleRemoveItem = (itemId: number) => {
    setEditableItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: 0 } : item
      )
    );
  };

  const handleRestoreItem = (itemId: number) => {
    const item = editableItems.find(i => i.id === itemId);
    if (item && item.issue) {
      // Restaurer à la quantité disponible ou originale
      const newQuantity = item.issue.type === 'InsufficientStock' 
        ? item.issue.availableQuantity 
        : 1;
      setEditableItems(items =>
        items.map(i =>
          i.id === itemId ? { ...i, quantity: newQuantity } : i
        )
      );
    } else {
      setEditableItems(items =>
        items.map(i =>
          i.id === itemId ? { ...i, quantity: i.originalQuantity } : i
        )
      );
    }
  };

  const handleAutoFix = () => {
    setEditableItems(items =>
      items.map(item => {
        if (!item.issue) return item;
        
        // Auto-correction basée sur le type de problème
        if (item.issue.type === 'OutOfStock') {
          return { ...item, quantity: 0 }; // Retirer complètement
        } else if (item.issue.type === 'InsufficientStock') {
          return { ...item, quantity: item.issue.availableQuantity }; // Ajuster à la quantité disponible
        }
        
        return item;
      })
    );
  };

  const handleSave = async () => {
    if (validationErrors.length > 0) return;
    
    const finalItems: EditOrderItem[] = editableItems
      .filter(item => item.quantity > 0)
      .map(item => ({
        drinkId: item.drinkId,
        quantity: item.quantity
      }));
    
    const editRequest: EditOrderRequest = {
      items: finalItems,
      reason: reason.trim()
    };
    
    try {
      await onSave(editRequest);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const calculateCurrentTotal = () => {
    return editableItems
      .filter(item => item.quantity > 0)
      .reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const hasChanges = () => {
    return editableItems.some(item => item.quantity !== item.originalQuantity);
  };

  const canSave = validationErrors.length === 0 && hasChanges() && !isLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              ✏️ Éditer la commande #{order.id}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Client: {order.customerName} • Total original: {order.total.toFixed(2)}€
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Alerte des problèmes de stock */}
          {stockCheck.issues.length > 0 && (
            <div className="p-4 bg-orange-50 border-b border-orange-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 mb-2">
                    ⚠️ Problèmes de stock détectés ({stockCheck.issues.length})
                  </h3>
                  <div className="space-y-1">
                    {stockCheck.issues.map(issue => (
                      <div key={issue.drinkId} className="text-sm text-orange-700">
                        <strong>{issue.drinkName}</strong>: {getStockIssueDisplayText(issue)}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAutoFix}
                    className="mt-3 bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                  >
                    🔧 Correction automatique
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Liste des articles éditables */}
          <div className="p-6">
            <h3 className="font-semibold mb-4">Articles de la commande</h3>
            <div className="space-y-3">
              {editableItems.map(item => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    item.hasIssue
                      ? getStockIssueColor(item.issue!)
                      : item.quantity === 0
                      ? 'border-red-300 bg-red-50'
                      : item.quantity !== item.originalQuantity
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.hasIssue && (
                          <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                            {item.issue!.type === 'OutOfStock' ? '❌ Rupture' : '⚠️ Stock limité'}
                          </span>
                        )}
                        {item.quantity === 0 && (
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                            🗑️ Retiré
                          </span>
                        )}
                        {item.quantity !== item.originalQuantity && item.quantity > 0 && (
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                            ✏️ Modifié
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        {item.unitPrice.toFixed(2)}€ × {item.quantity} = {(item.unitPrice * item.quantity).toFixed(2)}€
                        {item.quantity !== item.originalQuantity && (
                          <span className="ml-2 text-blue-600">
                            (était {item.originalQuantity})
                          </span>
                        )}
                      </div>
                      
                      {item.hasIssue && (
                        <div className="text-xs text-orange-700 mt-1">
                          {getStockIssueDisplayText(item.issue!)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.quantity > 0 ? (
                        <>
                          {/* Contrôles de quantité */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={isLoading}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            
                            <input
                              type="number"
                              min="0"
                              max={item.issue?.availableQuantity ?? 999}
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                              disabled={isLoading}
                              className="w-16 px-2 py-1 border rounded text-center disabled:opacity-50"
                            />
                            
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={isLoading || (item.issue && item.quantity >= item.issue.availableQuantity)}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Bouton supprimer */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isLoading}
                            className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
                            title="Retirer cet article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        /* Bouton restaurer pour les articles retirés */
                        <button
                          onClick={() => handleRestoreItem(item.id)}
                          disabled={isLoading}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 disabled:opacity-50"
                        >
                          🔄 Restaurer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé des changements */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Nouveau total:</span>
                <span className="text-lg font-bold">
                  {calculateCurrentTotal().toFixed(2)}€
                </span>
              </div>
              {calculateCurrentTotal() !== order.total && (
                <div className="text-sm text-gray-600">
                  Différence: {(calculateCurrentTotal() - order.total).toFixed(2)}€
                  {calculateCurrentTotal() < order.total ? ' (économie)' : ' (supplément)'}
                </div>
              )}
            </div>

            {/* Raison de la modification */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Raison de la modification *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                placeholder="Ex: Stock insuffisant pour certains articles, quantités ajustées selon disponibilité"
                className="w-full p-3 border rounded-lg resize-none disabled:opacity-50"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {reason.length}/500 caractères
              </div>
            </div>

            {/* Erreurs de validation */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Erreurs à corriger:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {hasChanges() ? (
              <span className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Modifications non sauvegardées
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Aucune modification
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Valider les modifications
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
