import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  X, 
  Clock,
  Edit3,
  Scissors,
  TrendingDown
} from 'lucide-react';

// Types de feedback
export type FeedbackType = 'success' | 'error' | 'warning' | 'info';
export type ActionType = 
  | 'order_accepted' 
  | 'order_rejected' 
  | 'order_edited' 
  | 'partial_accept' 
  | 'quantities_modified'
  | 'stock_checked'
  | 'suggestion_applied';

interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  actionType: ActionType;
  title: string;
  message: string;
  details?: string;
  autoHide?: boolean;
  duration?: number;
  timestamp: Date;
}

interface OrderActionFeedbackProps {
  className?: string;
}

// Store global pour les messages (simplifiée, pourrait être intégrée à Zustand)
class FeedbackStore {
  private static messages: FeedbackMessage[] = [];
  private static listeners: Array<(messages: FeedbackMessage[]) => void> = [];

  static addMessage(message: Omit<FeedbackMessage, 'id' | 'timestamp'>) {
    const fullMessage: FeedbackMessage = {
      ...message,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      autoHide: message.autoHide ?? true,
      duration: message.duration ?? 5000
    };

    this.messages = [fullMessage, ...this.messages].slice(0, 5); // Garder max 5 messages
    this.notifyListeners();

    // Auto-suppression
    if (fullMessage.autoHide) {
      setTimeout(() => {
        this.removeMessage(fullMessage.id);
      }, fullMessage.duration);
    }
  }

  static removeMessage(id: string) {
    this.messages = this.messages.filter(m => m.id !== id);
    this.notifyListeners();
  }

  static getMessages(): FeedbackMessage[] {
    return this.messages;
  }

  static subscribe(listener: (messages: FeedbackMessage[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.messages));
  }

  static clear() {
    this.messages = [];
    this.notifyListeners();
  }
}

// Hook pour utiliser le feedback store
export function useFeedback() {
  const [messages, setMessages] = useState<FeedbackMessage[]>(FeedbackStore.getMessages());

  useEffect(() => {
    const unsubscribe = FeedbackStore.subscribe(setMessages);
    return unsubscribe;
  }, []);

  const addSuccess = (actionType: ActionType, title: string, message: string, details?: string) => {
    FeedbackStore.addMessage({
      type: 'success',
      actionType,
      title,
      message,
      details
    });
  };

  const addError = (actionType: ActionType, title: string, message: string, details?: string) => {
    FeedbackStore.addMessage({
      type: 'error',
      actionType,
      title,
      message,
      details,
      autoHide: false // Les erreurs restent visibles
    });
  };

  const addWarning = (actionType: ActionType, title: string, message: string, details?: string) => {
    FeedbackStore.addMessage({
      type: 'warning',
      actionType,
      title,
      message,
      details
    });
  };

  const addInfo = (actionType: ActionType, title: string, message: string, details?: string) => {
    FeedbackStore.addMessage({
      type: 'info',
      actionType,
      title,
      message,
      details
    });
  };

  const removeMessage = (id: string) => {
    FeedbackStore.removeMessage(id);
  };

  const clearAll = () => {
    FeedbackStore.clear();
  };

  return {
    messages,
    addSuccess,
    addError,
    addWarning,
    addInfo,
    removeMessage,
    clearAll
  };
}

// Composant principal de feedback
export const OrderActionFeedback: React.FC<OrderActionFeedbackProps> = ({
  className = ''
}) => {
  const { messages, removeMessage } = useFeedback();

  const getIcon = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getActionIcon = (actionType: ActionType) => {
    switch (actionType) {
      case 'order_edited':
        return <Edit3 className="w-4 h-4" />;
      case 'partial_accept':
        return <Scissors className="w-4 h-4" />;
      case 'quantities_modified':
        return <TrendingDown className="w-4 h-4" />;
      case 'stock_checked':
        return <Info className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStyles = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 max-w-md ${className}`}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`border rounded-lg p-4 shadow-lg transition-all duration-300 ${getStyles(message.type)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {getIcon(message.type)}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getActionIcon(message.actionType)}
                  <h4 className="font-semibold text-sm">
                    {message.title}
                  </h4>
                </div>
                
                <p className="text-sm opacity-90">
                  {message.message}
                </p>
                
                {message.details && (
                  <p className="text-xs opacity-75 mt-1">
                    {message.details}
                  </p>
                )}
                
                <div className="flex items-center gap-1 mt-2 text-xs opacity-60">
                  <Clock className="w-3 h-3" />
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>

            <button
              onClick={() => removeMessage(message.id)}
              className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Messages prédéfinis pour les actions courantes
export const OrderFeedbackMessages = {
  orderAccepted: (orderId: number) => ({
    actionType: 'order_accepted' as ActionType,
    title: 'Commande acceptée',
    message: `La commande #${orderId} a été acceptée avec succès`,
    details: 'Le stock a été mis à jour automatiquement'
  }),

  orderRejected: (orderId: number) => ({
    actionType: 'order_rejected' as ActionType,
    title: 'Commande refusée',
    message: `La commande #${orderId} a été refusée`,
    details: 'Le client sera notifié du refus'
  }),

  orderEdited: (orderId: number, reason: string) => ({
    actionType: 'order_edited' as ActionType,
    title: 'Commande modifiée',
    message: `La commande #${orderId} a été éditée avec succès`,
    details: `Raison: ${reason}`
  }),

  partialAccept: (orderId: number, removedCount: number) => ({
    actionType: 'partial_accept' as ActionType,
    title: 'Acceptation partielle',
    message: `Commande #${orderId} acceptée avec ${removedCount} article(s) retiré(s)`,
    details: 'Les articles en rupture ont été automatiquement retirés'
  }),

  quantitiesModified: (orderId: number, modifiedCount: number) => ({
    actionType: 'quantities_modified' as ActionType,
    title: 'Quantités ajustées',
    message: `${modifiedCount} quantité(s) modifiée(s) dans la commande #${orderId}`,
    details: 'Ajustement selon le stock disponible'
  }),

  stockChecked: (orderId: number, issueCount: number) => ({
    actionType: 'stock_checked' as ActionType,
    title: 'Stock vérifié',
    message: issueCount === 0 
      ? `Commande #${orderId}: tous les articles sont disponibles`
      : `Commande #${orderId}: ${issueCount} problème(s) détecté(s)`,
    details: issueCount > 0 ? 'Utilisez les suggestions pour résoudre les problèmes' : undefined
  }),

  suggestionApplied: (suggestionType: string) => ({
    actionType: 'suggestion_applied' as ActionType,
    title: 'Suggestion appliquée',
    message: `Action "${suggestionType}" appliquée avec succès`,
    details: 'La commande a été ajustée automatiquement'
  })
};

// Hook pour simplifier l'utilisation des messages prédéfinis
export function useOrderFeedback() {
  const { addSuccess, addError, addWarning, addInfo } = useFeedback();

  return {
    success: {
      orderAccepted: (orderId: number) => {
        const msg = OrderFeedbackMessages.orderAccepted(orderId);
        addSuccess(msg.actionType, msg.title, msg.message, msg.details);
      },
      orderEdited: (orderId: number, reason: string) => {
        const msg = OrderFeedbackMessages.orderEdited(orderId, reason);
        addSuccess(msg.actionType, msg.title, msg.message, msg.details);
      },
      partialAccept: (orderId: number, removedCount: number) => {
        const msg = OrderFeedbackMessages.partialAccept(orderId, removedCount);
        addSuccess(msg.actionType, msg.title, msg.message, msg.details);
      },
      quantitiesModified: (orderId: number, modifiedCount: number) => {
        const msg = OrderFeedbackMessages.quantitiesModified(orderId, modifiedCount);
        addSuccess(msg.actionType, msg.title, msg.message, msg.details);
      }
    },
    
    info: {
      stockChecked: (orderId: number, issueCount: number) => {
        const msg = OrderFeedbackMessages.stockChecked(orderId, issueCount);
        if (issueCount === 0) {
          addSuccess(msg.actionType, msg.title, msg.message, msg.details);
        } else {
          addWarning(msg.actionType, msg.title, msg.message, msg.details);
        }
      }
    },

    error: {
      orderAction: (action: string, orderId: number, error: string) => {
        addError('order_edited', `Échec ${action}`, `Impossible de ${action.toLowerCase()} la commande #${orderId}`, error);
      }
    }
  };
}
