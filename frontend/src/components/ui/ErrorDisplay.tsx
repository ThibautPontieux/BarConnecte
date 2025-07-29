import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { isRetryableError } from '../../utils/errorHandling';

interface ErrorDisplayProps {
  error: string | Error | unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  variant?: 'banner' | 'card' | 'inline';
  showDetails?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
  variant = 'banner',
  showDetails = false
}) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const canRetry = onRetry && isRetryableError(error);
  const statusCode = (error as any)?.statusCode;
  const details = (error as any)?.details;

  const baseClasses = {
    banner: 'border border-red-400 text-red-700 px-4 py-3 rounded mb-4',
    card: 'border border-red-200 rounded-lg p-4 mb-4 shadow-sm',
    inline: 'text-red-600 text-sm'
  };

  const bgClasses = {
    banner: 'bg-red-100',
    card: 'bg-red-50',
    inline: ''
  };

  if (variant === 'inline') {
    return (
      <div className={`${baseClasses.inline} ${className}`}>
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseClasses[variant]} ${bgClasses[variant]} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium">
              Erreur{statusCode ? ` ${statusCode}` : ''}
            </div>
            <div className="mt-1 text-sm">
              {errorMessage}
            </div>
            
            {showDetails && details && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer hover:underline">
                  Détails techniques
                </summary>
                <div className="mt-1 text-xs font-mono bg-red-200 p-2 rounded">
                  {details}
                </div>
              </details>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-3">
          {canRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              title="Réessayer"
            >
              <RefreshCw className="w-3 h-3" />
              Réessayer
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-600 p-1"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook personnalisé pour la gestion d'erreurs
export const useErrorHandler = () => {
  const [error, setError] = React.useState<unknown>(null);
  
  const handleError = React.useCallback((err: unknown) => {
    console.error('Erreur capturée:', err);
    setError(err);
  }, []);
  
  const clearError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const retry = React.useCallback((fn: () => void | Promise<void>) => {
    clearError();
    try {
      const result = fn();
      if (result instanceof Promise) {
        result.catch(handleError);
      }
    } catch (err) {
      handleError(err);
    }
  }, [clearError, handleError]);
  
  return {
    error,
    handleError,
    clearError,
    retry,
    hasError: error !== null
  };
};
