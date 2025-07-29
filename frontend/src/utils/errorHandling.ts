import { AxiosError } from 'axios';

/**
 * Interface pour une erreur API structurée
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  details?: string;
}

/**
 * Extrait le message d'erreur détaillé d'une erreur Axios
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Si l'API retourne un message d'erreur dans response.data
    if (error.response?.data) {
      // Si c'est une string directe (comme dans votre API)
      if (typeof error.response.data === 'string') {
        return error.response.data;
      }
      
      // Si c'est un objet avec un message
      if (typeof error.response.data === 'object') {
        const data = error.response.data as any;
        if (data.message) return data.message;
        if (data.error) return data.error;
        if (data.title) return data.title;
      }
    }
    
    // Sinon, utiliser le message Axios par défaut avec le status
    return `Erreur ${error.response?.status || 'réseau'}: ${error.message}`;
  }
  
  // Si c'est une Error classique
  if (error instanceof Error) {
    return error.message;
  }
  
  // Fallback
  return 'Une erreur inattendue s\'est produite';
}

/**
 * Crée un objet ApiError structuré à partir d'une erreur
 */
export function createApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    return {
      message: extractErrorMessage(error),
      statusCode: error.response?.status,
      details: error.code || undefined
    };
  }
  
  return {
    message: extractErrorMessage(error)
  };
}

/**
 * Détermine si une erreur est temporaire et peut être retry
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    // Erreurs réseau ou serveur temporaires
    return !status || status >= 500 || status === 408 || status === 429;
  }
  return false;
}

/**
 * Crée un message d'erreur user-friendly basé sur le code de statut
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.status) {
    const status = error.response.status;
    const originalMessage = extractErrorMessage(error);
    
    switch (status) {
      case 400:
        return originalMessage; // Message du serveur déjà user-friendly
      case 401:
        return 'Non autorisé. Veuillez vous reconnecter.';
      case 403:
        return 'Accès interdit. Vous n\'avez pas les permissions nécessaires.';
      case 404:
        return 'Ressource non trouvée.';
      case 409:
        return originalMessage || 'Conflit détecté. La ressource existe déjà.';
      case 422:
        return originalMessage || 'Données invalides.';
      case 500:
        return 'Erreur serveur. Veuillez réessayer plus tard.';
      case 503:
        return 'Service temporairement indisponible.';
      default:
        return originalMessage;
    }
  }
  
  return extractErrorMessage(error);
}
