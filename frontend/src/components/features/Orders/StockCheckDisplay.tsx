import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import type { StockCheckResult, StockIssue } from '../../../types/Order';
import { getStockIssueDisplayText, getStockIssueColor } from '../../../types/Order';

interface StockCheckDisplayProps {
  stockCheck: StockCheckResult;
  onEdit?: () => void;
  onAcceptPartial?: () => void;
  onProceedAnyway?: () => void;
  className?: string;
}

export const StockCheckDisplay: React.FC<StockCheckDisplayProps> = ({
  stockCheck,
  onEdit,
  onAcceptPartial,
  onProceedAnyway,
  className = ''
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = () => {
    if (stockCheck.isFullyAvailable) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatusText = () => {
    if (stockCheck.isFullyAvailable) {
      return "✅ Tous les articles sont disponibles";
    } else {
      return `⚠️ ${stockCheck.issues.length} problème(s) de stock détecté(s)`;
    }
  };

  const getStatusColor = () => {
    return stockCheck.isFullyAvailable
      ? 'bg-green-50 border-green-200'
      : 'bg-orange-50 border-orange-200';
  };

  const categorizeIssues = () => {
    const outOfStock = stockCheck.issues.filter(issue => issue.type === 'OutOfStock');
    const insufficientStock = stockCheck.issues.filter(issue => issue.type === 'InsufficientStock');
    
    return { outOfStock, insufficientStock };
  };

  const { outOfStock, insufficientStock } = categorizeIssues();

  return (
    <div className={`border rounded-lg ${getStatusColor()} ${className}`}>
      
      {/* Header avec statut global */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-gray-900">
              {getStatusText()}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Vérifié à {formatTime(stockCheck.checkedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Détails des problèmes s'il y en a */}
      {!stockCheck.isFullyAvailable && (
        <div className="px-4 pb-4">
          
          {/* Articles en rupture complète */}
          {outOfStock.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                En rupture complète ({outOfStock.length})
              </h4>
              <div className="space-y-2">
                {outOfStock.map(issue => (
                  <div
                    key={issue.drinkId}
                    className="p-2 bg-red-100 border border-red-200 rounded text-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-red-900">
                        {issue.drinkName}
                      </span>
                      <span className="text-red-700">
                        {issue.requestedQuantity} demandé(s) • 0 disponible
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Articles avec stock insuffisant */}
          {insufficientStock.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Stock insuffisant ({insufficientStock.length})
              </h4>
              <div className="space-y-2">
                {insufficientStock.map(issue => (
                  <div
                    key={issue.drinkId}
                    className="p-2 bg-orange-100 border border-orange-200 rounded text-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-orange-900">
                        {issue.drinkName}
                      </span>
                      <span className="text-orange-700">
                        {issue.requestedQuantity} demandé(s) • {issue.availableQuantity} disponible(s)
                      </span>
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      Manque: {issue.missingQuantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions proposées */}
          <div className="border-t border-orange-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Actions possibles:</h4>
            <div className="space-y-2">
              
              {/* Édition manuelle */}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">✏️ Éditer la commande</div>
                      <div className="text-sm text-blue-100">
                        Modifier les quantités ou retirer des articles manuellement
                      </div>
                    </div>
                    <div className="text-blue-200">Recommandé</div>
                  </div>
                </button>
              )}

              {/* Acceptation partielle rapide */}
              {onAcceptPartial && outOfStock.length > 0 && (
                <button
                  onClick={onAcceptPartial}
                  className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">✅ Accepter sans les ruptures</div>
                      <div className="text-sm text-green-100">
                        Retirer automatiquement les {outOfStock.length} article(s) en rupture
                      </div>
                    </div>
                    <div className="text-green-200">Rapide</div>
                  </div>
                </button>
              )}

              {/* Forcer l'acceptation */}
              {onProceedAnyway && (
                <button
                  onClick={onProceedAnyway}
                  className="w-full p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">⚠️ Accepter malgré tout</div>
                      <div className="text-sm text-gray-100">
                        Procéder en ignorant les problèmes de stock
                      </div>
                    </div>
                    <div className="text-gray-200">Risqué</div>
                  </div>
                </button>
              )}
            </div>

            {/* Résumé des impacts */}
            <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Impact sur la commande:</h5>
              <div className="text-sm text-gray-600 space-y-1">
                {outOfStock.length > 0 && (
                  <div>• {outOfStock.length} article(s) ne peuvent pas être servis</div>
                )}
                {insufficientStock.length > 0 && (
                  <div>
                    • {insufficientStock.length} article(s) avec quantités réduites possibles
                  </div>
                )}
                <div>
                  • Total des articles problématiques: {stockCheck.issues.reduce((sum, issue) => sum + issue.missingQuantity, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Si tout est OK, proposer l'acceptation normale */}
      {stockCheck.isFullyAvailable && onProceedAnyway && (
        <div className="px-4 pb-4">
          <button
            onClick={onProceedAnyway}
            className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Accepter la commande
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
