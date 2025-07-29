import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Zap, 
  ArrowRight, 
  Check, 
  X, 
  Scissors, 
  Minus, 
  RotateCcw,
  Loader,
  TrendingDown
} from 'lucide-react';
import type { 
  Order, 
  StockCheckResult, 
  OrderEditSuggestions, 
  EditSuggestion 
} from '../../../types/Order';

interface QuickEditSuggestionsProps {
  order: Order;
  stockCheck: StockCheckResult;
  suggestions?: OrderEditSuggestions;
  onApplySuggestion: (suggestionId: string) => Promise<boolean>;
  onAcceptWithoutOutOfStock: () => Promise<boolean>;
  onAcceptWithAdjustedQuantities: () => Promise<boolean>;
  isLoading?: boolean;
  className?: string;
}

export const QuickEditSuggestions: React.FC<QuickEditSuggestionsProps> = ({
  order,
  stockCheck,
  suggestions,
  onApplySuggestion,
  onAcceptWithoutOutOfStock,
  onAcceptWithAdjustedQuantities,
  isLoading = false,
  className = ''
}) => {
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);

  // Reset des suggestions appliquées si la commande change
  useEffect(() => {
    setAppliedSuggestions(new Set());
  }, [order.id]);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'remove':
        return <Scissors className="w-4 h-4" />;
      case 'reduce':
        return <Minus className="w-4 h-4" />;
      case 'replace':
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'remove':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'reduce':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'replace':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleApplySuggestion = async (suggestionId: string) => {
    setLoadingSuggestion(suggestionId);
    try {
      const success = await onApplySuggestion(suggestionId);
      if (success) {
        setAppliedSuggestions(prev => new Set([...prev, suggestionId]));
      }
    } finally {
      setLoadingSuggestion(null);
    }
  };

  const calculatePotentialSavings = () => {
    if (!suggestions) return 0;
    return order.total - suggestions.estimatedNewTotal;
  };

  const formatSavings = (amount: number) => {
    if (amount > 0) {
      return `−${amount.toFixed(2)}€`;
    } else if (amount < 0) {
      return `+${Math.abs(amount).toFixed(2)}€`;
    }
    return '±0€';
  };

  if (stockCheck.isFullyAvailable) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-800">
            ✅ Tous les articles sont disponibles
          </h3>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Cette commande peut être acceptée sans modification.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      
      {/* Header */}
      <div className="p-4 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">
            Suggestions d'édition rapide
          </h3>
          {isLoading && <Loader className="w-4 h-4 animate-spin text-blue-600" />}
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Actions automatiques pour résoudre les problèmes de stock
        </p>
      </div>

      <div className="p-4">
        
        {/* Actions rapides principales */}
        <div className="space-y-3 mb-4">
          
          {/* Retirer les articles en rupture */}
          {stockCheck.issues.some(issue => issue.type === 'OutOfStock') && (
            <button
              onClick={onAcceptWithoutOutOfStock}
              disabled={isLoading}
              className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-left transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Scissors className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Retirer les articles en rupture</div>
                    <div className="text-sm text-red-100">
                      {stockCheck.issues.filter(i => i.type === 'OutOfStock').length} article(s) seront retirés
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          )}

          {/* Ajuster toutes les quantités */}
          {stockCheck.issues.some(issue => issue.type === 'InsufficientStock') && (
            <button
              onClick={onAcceptWithAdjustedQuantities}
              disabled={isLoading}
              className="w-full p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-left transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Ajuster selon le stock disponible</div>
                    <div className="text-sm text-orange-100">
                      {stockCheck.issues.filter(i => i.type === 'InsufficientStock').length} quantité(s) seront réduites
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          )}
        </div>

        {/* Suggestions détaillées du backend */}
        {suggestions && suggestions.suggestions.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Suggestions détaillées
            </h4>
            
            <div className="space-y-2">
              {suggestions.suggestions.map((suggestion) => {
                const isApplied = appliedSuggestions.has(suggestion.actionId);
                const isLoading = loadingSuggestion === suggestion.actionId;
                
                return (
                  <div
                    key={suggestion.actionId}
                    className={`p-3 border rounded-lg transition-colors ${
                      isApplied 
                        ? 'bg-green-50 border-green-200' 
                        : getSuggestionColor(suggestion.type)
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isApplied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          getSuggestionIcon(suggestion.type)
                        )}
                        
                        <div>
                          <div className="font-medium text-sm">
                            {suggestion.description}
                          </div>
                          <div className="text-xs opacity-75">
                            Type: {suggestion.type}
                          </div>
                        </div>
                      </div>

                      {!isApplied && (
                        <button
                          onClick={() => handleApplySuggestion(suggestion.actionId)}
                          disabled={isLoading || loadingSuggestion !== null}
                          className="px-3 py-1 bg-white border border-current rounded text-xs hover:bg-opacity-80 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            'Appliquer'
                          )}
                        </button>
                      )}

                      {isApplied && (
                        <span className="text-xs text-green-700 font-medium">
                          ✓ Appliqué
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Résumé des impacts financiers */}
        {suggestions && (
          <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Impact financier estimé</h5>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total actuel:</span>
                <span className="font-medium">{suggestions.currentTotal.toFixed(2)}€</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total après suggestions:</span>
                <span className="font-medium">{suggestions.estimatedNewTotal.toFixed(2)}€</span>
              </div>
              
              <div className="flex justify-between border-t pt-1">
                <span className="text-gray-600">Différence:</span>
                <span className={`font-medium ${
                  calculatePotentialSavings() > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatSavings(calculatePotentialSavings())}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Message d'aide */}
        <div className="mt-4 text-xs text-blue-600 bg-white border border-blue-200 rounded p-2">
          💡 <strong>Conseil:</strong> Les suggestions appliquent automatiquement les meilleures 
          solutions selon le stock disponible. Vous pouvez aussi utiliser l'édition manuelle 
          pour un contrôle précis.
        </div>
      </div>
    </div>
  );
};
