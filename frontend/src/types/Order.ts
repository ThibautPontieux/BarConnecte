import type { Product } from './Product';

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'accepted' | 'rejected' | 'ready' | 'completed';
  customerName: string;
  timestamp: Date;
  isPartiallyModified?: boolean;
  modificationReason?: string;
  lastModifiedAt?: Date;
}

// === NOUVEAUX TYPES POUR LA VÉRIFICATION DE STOCK ===

export interface StockCheckResult {
  isFullyAvailable: boolean;
  issues: StockIssue[];
  checkedAt: Date;
}

export interface StockIssue {
  drinkId: number;
  drinkName: string;
  requestedQuantity: number;
  availableQuantity: number;
  type: 'OutOfStock' | 'InsufficientStock';
  missingQuantity: number;
}

// === TYPES POUR LES REQUÊTES D'ÉDITION ===

export interface EditOrderRequest {
  items: EditOrderItem[];
  reason: string;
}

export interface EditOrderItem {
  drinkId: number;
  quantity: number;
}

export interface AcceptPartialOrderRequest {
  itemsToRemove: number[];
  reason: string;
}

export interface ModifyQuantitiesRequest {
  quantityChanges: Record<number, number>;
  reason: string;
}

// === TYPES POUR LES SUGGESTIONS D'ÉDITION ===

export interface OrderEditSuggestions {
  isFullyAvailable: boolean;
  suggestions: EditSuggestion[];
  currentTotal: number;
  estimatedNewTotal: number;
}

export interface EditSuggestion {
  description: string;
  actionId: string;
  type: 'remove' | 'reduce' | 'replace';
}

// Types pour les workflows de commandes
export interface OrderWorkflow {
  canAccept: boolean;
  canReject: boolean;
  canMarkReady: boolean;
  canComplete: boolean;
  canEdit: boolean;
  canCheckStock: boolean;
  canAcceptPartially: boolean;
}

// Fonction utilitaire pour déterminer les actions possibles selon le statut
export function getOrderWorkflow(status: Order['status']): OrderWorkflow {
  switch (status) {
    case 'pending':
      return {
        canAccept: true,
        canReject: true,
        canMarkReady: false,
        canComplete: false,
        canEdit: true,
        canCheckStock: true,
        canAcceptPartially: true,
      };
    case 'accepted':
      return {
        canAccept: false,
        canReject: false,
        canMarkReady: true,
        canComplete: false,
        canEdit: false,
        canCheckStock: false,
        canAcceptPartially: false,
      };
    case 'ready':
      return {
        canAccept: false,
        canReject: false,
        canMarkReady: false,
        canComplete: true,
        canEdit: false,
        canCheckStock: false,
        canAcceptPartially: false,
      };
    case 'rejected':
    case 'completed':
    default:
      return {
        canAccept: false,
        canReject: false,
        canMarkReady: false,
        canComplete: false,
        // Nouvelles actions
        canEdit: false,
        canCheckStock: false,
        canAcceptPartially: false,
      };
  }
}

// Types pour les statistiques de commandes
export interface OrderStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  ready: number;
  completed: number;
}

export interface OrderStatus {
  pending: 'En attente';
  accepted: 'Acceptée';
  rejected: 'Refusée';
  ready: 'Prête';
  completed: 'Terminée';
}

export const ORDER_STATUS_LABELS: OrderStatus = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  ready: 'Prête',
  completed: 'Terminée',
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
} as const;

// === UTILITAIRES POUR L'ÉDITION ===

export function getStockIssueDisplayText(issue: StockIssue): string {
  if (issue.type === 'OutOfStock') {
    return `En rupture complète`;
  } else {
    return `Seulement ${issue.availableQuantity} sur ${issue.requestedQuantity} demandé(s)`;
  }
}

export function getStockIssueColor(issue: StockIssue): string {
  return issue.type === 'OutOfStock' 
    ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-orange-100 text-orange-800 border-orange-200';
}

export function calculateTotalAfterChanges(order: Order, quantityChanges: Record<number, number>): number {
  return order.items.reduce((total, item) => {
    const newQuantity = quantityChanges[item.id] ?? item.quantity;
    if (newQuantity <= 0) return total; // Article retiré
    return total + (item.price * newQuantity);
  }, 0);
}

export function hasOrderBeenModified(order: Order): boolean {
  return order.isPartiallyModified === true;
}
