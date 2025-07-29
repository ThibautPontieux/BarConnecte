import { useState, useCallback, useRef } from 'react';
import { useOrderStore } from '../stores/useOrderStore';
import type { 
  Order, 
  StockCheckResult, 
  EditOrderRequest, 
  AcceptPartialOrderRequest, 
  ModifyQuantitiesRequest,
  OrderEditSuggestions
} from '../types/Order';
import { 
  validateEditOrderRequest, 
  OrderValidationError, 
  formatValidationErrors,
  logError
} from '../utils/globalErrorHandling';

/**
 * Hook personnalisé pour simplifier l'édition de commandes
 * Encapsule toute la logique d'édition, validation et gestion d'état
 */
export function useOrderEditing(orderId: number) {
  // État local du hook
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<OrderValidationError[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockCheck, setShowStockCheck] = useState(false);
  
  // Référence pour éviter les appels multiples
  const stockCheckRef = useRef<boolean>(false);
  
  // Store Zustand
  const {
    checkOrderStock,
    getStockCheckResult,
    editOrder,
    acceptPartialOrder,
    modifyOrderQuantities,
    getOrderEditSuggestions,
    getSuggestions,
    stockCheckLoading,
    editingLoading,
    error
  } = useOrderStore();

  // === VÉRIFICATION DE STOCK ===

  /**
   * Vérifie le stock pour la commande
   */
  const handleCheckStock = useCallback(async (): Promise<StockCheckResult | null> => {
    if (stockCheckRef.current) return getStockCheckResult(orderId);
    
    setIsCheckingStock(true);
    try {
      stockCheckRef.current = true;
      const result = await checkOrderStock(orderId);
      setShowStockCheck(true);
      return result;
    } catch (error) {
      logError('STOCK_CHECK_ERROR', error, { orderId });
      return null;
    } finally {
      setIsCheckingStock(false);
    }
  }, [orderId, checkOrderStock, getStockCheckResult]);

  /**
   * Récupère le résultat de vérification de stock en cache
   */
  const getStockCheck = useCallback((): StockCheckResult | null => {
    return getStockCheckResult(orderId);
  }, [orderId, getStockCheckResult]);

  // === ÉDITION DE COMMANDES ===

  /**
   * Ouvre le modal d'édition (avec vérification de stock préalable si nécessaire)
   */
  const openEditModal = useCallback(async () => {
    let stockResult = getStockCheck();
    
    // Si pas de vérification de stock, la faire d'abord
    if (!stockResult) {
      stockResult = await handleCheckStock();
    }
    
    if (stockResult) {
      setShowEditModal(true);
    }
  }, [getStockCheck, handleCheckStock]);

  /**
   * Ferme le modal d'édition
   */
  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setValidationErrors([]);
  }, []);

  /**
   * Valide une requête d'édition
   */
  const validateEditRequest = useCallback((editRequest: EditOrderRequest): boolean => {
    const errors = validateEditOrderRequest(editRequest);
    setValidationErrors(errors);
    return errors.length === 0;
  }, []);

  /**
   * Sauvegarde les modifications d'une commande
   */
  const saveEdit = useCallback(async (editRequest: EditOrderRequest): Promise<boolean> => {
    if (!validateEditRequest(editRequest)) {
      return false;
    }

    setIsEditing(true);
    try {
      await editOrder(orderId, editRequest);
      setShowEditModal(false);
      setShowStockCheck(false);
      setValidationErrors([]);
      return true;
    } catch (error) {
      logError('EDIT_ORDER_ERROR', error, { orderId, editRequest });
      return false;
    } finally {
      setIsEditing(false);
    }
  }, [orderId, editOrder, validateEditRequest]);

  // === ACCEPTATION PARTIELLE ===

  /**
   * Accepte une commande en retirant automatiquement les articles en rupture
   */
  const acceptWithoutOutOfStock = useCallback(async (): Promise<boolean> => {
    const stockResult = getStockCheck();
    if (!stockResult) {
      await handleCheckStock();
      return false;
    }

    const outOfStockItems = stockResult.issues
      .filter(issue => issue.type === 'OutOfStock')
      .map(issue => issue.drinkId);

    if (outOfStockItems.length === 0) {
      // Pas d'articles en rupture, acceptation normale
      return false;
    }

    const acceptRequest: AcceptPartialOrderRequest = {
      itemsToRemove: outOfStockItems,
      reason: `Retrait automatique des articles en rupture: ${
        stockResult.issues
          .filter(issue => issue.type === 'OutOfStock')
          .map(issue => issue.drinkName)
          .join(', ')
      }`
    };

    setIsEditing(true);
    try {
      await acceptPartialOrder(orderId, acceptRequest);
      setShowStockCheck(false);
      return true;
    } catch (error) {
      logError('PARTIAL_ACCEPT_ERROR', error, { orderId, acceptRequest });
      return false;
    } finally {
      setIsEditing(false);
    }
  }, [orderId, acceptPartialOrder, getStockCheck, handleCheckStock]);

  /**
   * Accepte une commande en ajustant automatiquement les quantités
   */
  const acceptWithAdjustedQuantities = useCallback(async (): Promise<boolean> => {
    const stockResult = getStockCheck();
    if (!stockResult) {
      await handleCheckStock();
      return false;
    }

    const quantityChanges: Record<number, number> = {};
    let hasChanges = false;

    stockResult.issues.forEach(issue => {
      if (issue.type === 'InsufficientStock') {
        quantityChanges[issue.drinkId] = issue.availableQuantity;
        hasChanges = true;
      } else if (issue.type === 'OutOfStock') {
        quantityChanges[issue.drinkId] = 0;
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      return false;
    }

    const modifyRequest: ModifyQuantitiesRequest = {
      quantityChanges,
      reason: `Ajustement automatique des quantités selon le stock disponible`
    };

    setIsEditing(true);
    try {
      await modifyOrderQuantities(orderId, modifyRequest);
      setShowStockCheck(false);
      return true;
    } catch (error) {
      logError('MODIFY_QUANTITIES_ERROR', error, { orderId, modifyRequest });
      return false;
    } finally {
      setIsEditing(false);
    }
  }, [orderId, modifyOrderQuantities, getStockCheck, handleCheckStock]);

  // === SUGGESTIONS ===

  /**
   * Récupère des suggestions d'édition automatiques
   */
  const getSuggestionsForOrder = useCallback(async (): Promise<OrderEditSuggestions | null> => {
    try {
      return await getOrderEditSuggestions(orderId);
    } catch (error) {
      logError('SUGGESTIONS_ERROR', error, { orderId });
      return null;
    }
  }, [orderId, getOrderEditSuggestions]);

  /**
   * Applique une suggestion d'édition automatique
   */
  const applySuggestion = useCallback(async (suggestionId: string): Promise<boolean> => {
    const suggestions = getSuggestions(orderId);
    if (!suggestions) return false;

    const suggestion = suggestions.suggestions.find(s => s.actionId === suggestionId);
    if (!suggestion) return false;

    // Logique pour appliquer différents types de suggestions
    // TODO: Implémenter selon les types de suggestions définies dans le backend
    
    switch (suggestion.type) {
      case 'remove':
        // Retirer un article spécifique
        break;
      case 'reduce':
        // Réduire la quantité d'un article
        break;
      case 'replace':
        // Remplacer un article par un autre
        break;
      default:
        return false;
    }

    return true;
  }, [orderId, getSuggestions]);

  // === UTILITAIRES ===

  /**
   * Remet à zéro l'état du hook
   */
  const reset = useCallback(() => {
    setIsCheckingStock(false);
    setIsEditing(false);
    setValidationErrors([]);
    setShowEditModal(false);
    setShowStockCheck(false);
    stockCheckRef.current = false;
  }, []);

  /**
   * Vérifie si une commande a des problèmes de stock
   */
  const hasStockIssues = useCallback((): boolean => {
    const stockResult = getStockCheck();
    return stockResult ? !stockResult.isFullyAvailable : false;
  }, [getStockCheck]);

  /**
   * Calcule le nombre d'articles problématiques
   */
  const getIssueCount = useCallback((): number => {
    const stockResult = getStockCheck();
    return stockResult ? stockResult.issues.length : 0;
  }, [getStockCheck]);

  /**
   * Obtient un résumé des problèmes pour l'affichage
   */
  const getIssuesSummary = useCallback((): string => {
    const stockResult = getStockCheck();
    if (!stockResult || stockResult.isFullyAvailable) {
      return 'Aucun problème détecté';
    }

    const outOfStock = stockResult.issues.filter(i => i.type === 'OutOfStock').length;
    const insufficient = stockResult.issues.filter(i => i.type === 'InsufficientStock').length;

    const parts = [];
    if (outOfStock > 0) parts.push(`${outOfStock} en rupture`);
    if (insufficient > 0) parts.push(`${insufficient} stock limité`);

    return parts.join(', ');
  }, [getStockCheck]);

  // === ÉTAT RETOURNÉ ===
  
  return {
    // État
    isCheckingStock: isCheckingStock || stockCheckLoading,
    isEditing: isEditing || editingLoading,
    validationErrors,
    showEditModal,
    showStockCheck,
    error,

    // Données
    stockCheck: getStockCheck(),
    suggestions: getSuggestions(orderId),

    // Actions principales
    checkStock: handleCheckStock,
    openEditModal,
    closeEditModal,
    saveEdit,

    // Actions rapides
    acceptWithoutOutOfStock,
    acceptWithAdjustedQuantities,

    // Suggestions
    getSuggestions: getSuggestionsForOrder,
    applySuggestion,

    // Validation
    validateEditRequest,
    validationErrorsText: formatValidationErrors(validationErrors),

    // Utilitaires
    reset,
    hasStockIssues,
    getIssueCount,
    getIssuesSummary,

    // Contrôle d'affichage
    setShowStockCheck,
    setShowEditModal
  };
}
