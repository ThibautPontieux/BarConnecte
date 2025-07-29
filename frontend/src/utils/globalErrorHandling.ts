/**
 * Utilitaires pour la gestion d'erreurs dans DrinkIT
 * Étendu pour supporter les nouvelles fonctionnalités d'édition de commandes
 */

// Types d'erreurs
export type ErrorType = 
  // Erreurs existantes
  | 'CREATE_ORDER_ERROR'
  | 'FETCH_ORDERS_ERROR'
  | 'ACCEPT_ORDER_ERROR'
  | 'REJECT_ORDER_ERROR'
  | 'MARK_READY_ERROR'
  | 'COMPLETE_ORDER_ERROR'
  | 'FETCH_PRODUCTS_ERROR'
  | 'CREATE_PRODUCT_ERROR'
  | 'UPDATE_PRODUCT_ERROR'
  | 'DELETE_PRODUCT_ERROR'
  // Nouvelles erreurs pour l'édition
  | 'STOCK_CHECK_ERROR'
  | 'EDIT_ORDER_ERROR'
  | 'PARTIAL_ACCEPT_ERROR'
  | 'MODIFY_QUANTITIES_ERROR'
  | 'GET_ORDER_DETAILS_ERROR'
  | 'SUGGESTIONS_ERROR'
  | 'VALIDATION_ERROR'
  | 'STOCK_INSUFFICIENT_ERROR'
  | 'ORDER_NOT_EDITABLE_ERROR';

// Messages d'erreur conviviaux
const ERROR_MESSAGES: Record<ErrorType, string> = {
  // Messages existants
  CREATE_ORDER_ERROR: 'Impossible de créer la commande. Veuillez réessayer.',
  FETCH_ORDERS_ERROR: 'Erreur lors du chargement des commandes.',
  ACCEPT_ORDER_ERROR: 'Impossible d\'accepter cette commande.',
  REJECT_ORDER_ERROR: 'Impossible de refuser cette commande.',
  MARK_READY_ERROR: 'Impossible de marquer cette commande comme prête.',
  COMPLETE_ORDER_ERROR: 'Impossible de finaliser cette commande.',
  FETCH_PRODUCTS_ERROR: 'Erreur lors du chargement des produits.',
  CREATE_PRODUCT_ERROR: 'Impossible de créer le produit.',
  UPDATE_PRODUCT_ERROR: 'Impossible de mettre à jour le produit.',
  DELETE_PRODUCT_ERROR: 'Impossible de supprimer le produit.',

  // Nouveaux messages pour l'édition
  STOCK_CHECK_ERROR: 'Impossible de vérifier le stock. Veuillez réessayer.',
  EDIT_ORDER_ERROR: 'Impossible de modifier cette commande.',
  PARTIAL_ACCEPT_ERROR: 'Impossible d\'accepter partiellement cette commande.',
  MODIFY_QUANTITIES_ERROR: 'Impossible de modifier les quantités.',
  GET_ORDER_DETAILS_ERROR: 'Impossible de récupérer les détails de la commande.',
  SUGGESTIONS_ERROR: 'Impossible de générer des suggestions d\'édition.',
  VALIDATION_ERROR: 'Données invalides. Veuillez vérifier votre saisie.',
  STOCK_INSUFFICIENT_ERROR: 'Stock insuffisant pour traiter cette commande.',
  ORDER_NOT_EDITABLE_ERROR: 'Cette commande ne peut plus être modifiée.',
};

/**
 * Extrait le message d'erreur d'une exception
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Gestion des erreurs Axios
    const axiosError = error as any;
    
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    if (axiosError.response?.data) {
      if (typeof axiosError.response.data === 'string') {
        return axiosError.response.data;
      }
    }
    
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  
  return 'Une erreur inattendue s\'est produite';
}

/**
 * Obtient un message d'erreur convivial pour l'utilisateur
 */
export function getUserFriendlyMessage(errorType: ErrorType, originalError?: string): string {
  const baseMessage = ERROR_MESSAGES[errorType];
  
  // Pour certains types d'erreurs, on inclut le message original s'il est informatif
  if (originalError && isInformativeError(originalError)) {
    return `${baseMessage} Détail: ${originalError}`;
  }
  
  return baseMessage;
}

/**
 * Détermine si un message d'erreur est assez informatif pour être montré à l'utilisateur
 */
function isInformativeError(message: string): boolean {
  const informativePatterns = [
    /stock insuffisant/i,
    /commande.*introuvable/i,
    /ne peut.*être.*modifiée/i,
    /article.*en rupture/i,
    /quantité.*disponible/i,
    /raison.*requise/i,
    /validation/i
  ];
  
  return informativePatterns.some(pattern => pattern.test(message));
}

/**
 * Catégorise une erreur pour déterminer son niveau de gravité
 */
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export function getErrorSeverity(errorType: ErrorType): ErrorSeverity {
  switch (errorType) {
    case 'VALIDATION_ERROR':
      return 'info';
      
    case 'STOCK_CHECK_ERROR':
    case 'STOCK_INSUFFICIENT_ERROR':
    case 'ORDER_NOT_EDITABLE_ERROR':
      return 'warning';
      
    case 'EDIT_ORDER_ERROR':
    case 'PARTIAL_ACCEPT_ERROR':
    case 'MODIFY_QUANTITIES_ERROR':
    case 'ACCEPT_ORDER_ERROR':
    case 'REJECT_ORDER_ERROR':
      return 'error';
      
    case 'FETCH_ORDERS_ERROR':
    case 'FETCH_PRODUCTS_ERROR':
      return 'critical';
      
    default:
      return 'error';
  }
}

/**
 * Génère un identifiant unique pour une erreur (pour le logging)
 */
export function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Classe pour gérer les erreurs de validation spécifiques aux commandes
 */
export class OrderValidationError extends Error {
  public readonly field: string;
  public readonly code: string;
  
  constructor(field: string, message: string, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'OrderValidationError';
    this.field = field;
    this.code = code;
  }
}

/**
 * Classe pour gérer les erreurs de stock
 */
export class StockError extends Error {
  public readonly drinkId: number;
  public readonly requestedQuantity: number;
  public readonly availableQuantity: number;
  
  constructor(
    drinkId: number, 
    requestedQuantity: number, 
    availableQuantity: number, 
    message: string
  ) {
    super(message);
    this.name = 'StockError';
    this.drinkId = drinkId;
    this.requestedQuantity = requestedQuantity;
    this.availableQuantity = availableQuantity;
  }
}

/**
 * Valide les données d'une requête d'édition de commande
 */
export function validateEditOrderRequest(request: {
  items: Array<{ drinkId: number; quantity: number }>;
  reason: string;
}): OrderValidationError[] {
  const errors: OrderValidationError[] = [];
  
  // Validation de la raison
  if (!request.reason || request.reason.trim().length === 0) {
    errors.push(new OrderValidationError(
      'reason',
      'Une raison doit être fournie pour la modification',
      'REASON_REQUIRED'
    ));
  }
  
  if (request.reason && request.reason.length > 500) {
    errors.push(new OrderValidationError(
      'reason',
      'La raison ne peut pas dépasser 500 caractères',
      'REASON_TOO_LONG'
    ));
  }
  
  // Validation des articles
  if (!request.items || request.items.length === 0) {
    errors.push(new OrderValidationError(
      'items',
      'Au moins un article doit être présent dans la commande',
      'NO_ITEMS'
    ));
  }
  
  if (request.items) {
    request.items.forEach((item, index) => {
      if (!item.drinkId || item.drinkId <= 0) {
        errors.push(new OrderValidationError(
          `items[${index}].drinkId`,
          `L'ID de la boisson est requis pour l'article ${index + 1}`,
          'INVALID_DRINK_ID'
        ));
      }
      
      if (!item.quantity || item.quantity <= 0) {
        errors.push(new OrderValidationError(
          `items[${index}].quantity`,
          `La quantité doit être supérieure à 0 pour l'article ${index + 1}`,
          'INVALID_QUANTITY'
        ));
      }
    });
  }
  
  return errors;
}

/**
 * Formate les erreurs de validation pour l'affichage
 */
export function formatValidationErrors(errors: OrderValidationError[]): string {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  return `Plusieurs erreurs détectées:\n${errors.map((e, i) => `${i + 1}. ${e.message}`).join('\n')}`;
}

/**
 * Hook de logging pour les erreurs (à personnaliser selon vos besoins)
 */
export function logError(
  errorType: ErrorType, 
  error: unknown, 
  context?: Record<string, any>
): void {
  const errorId = generateErrorId();
  const severity = getErrorSeverity(errorType);
  const message = extractErrorMessage(error);
  
  const logData = {
    id: errorId,
    type: errorType,
    severity,
    message,
    timestamp: new Date().toISOString(),
    context,
    error: error instanceof Error ? {
      name: error.name,
      stack: error.stack
    } : error
  };
  
  // En développement, log dans la console
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error [${severity.toUpperCase()}] ${errorType}`);
    console.error('Message:', message);
    console.error('ID:', errorId);
    if (context) console.error('Context:', context);
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
  }
  
  // En production, envoyer à un service de logging
  // TODO: Intégrer avec votre service de logging (Sentry, LogRocket, etc.)
}

/**
 * Utilitaire pour retry automatique en cas d'erreur temporaire
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Ne pas retry sur les erreurs de validation
      if (error instanceof OrderValidationError) {
        throw error;
      }
      
      // Delay exponentiel
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError;
}
