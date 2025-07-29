import type { Product } from './Product';

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'accepted' | 'rejected' | 'ready' | 'completed'; // ✅ Nouveaux statuts
  customerName: string;
  timestamp: Date;
}

// Types pour les workflows de commandes
export interface OrderWorkflow {
  canAccept: boolean;
  canReject: boolean;
  canMarkReady: boolean;
  canComplete: boolean;
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
      };
    case 'accepted':
      return {
        canAccept: false,
        canReject: false,
        canMarkReady: true,
        canComplete: false,
      };
    case 'ready':
      return {
        canAccept: false,
        canReject: false,
        canMarkReady: false,
        canComplete: true,
      };
    case 'rejected':
    case 'completed':
    default:
      return {
        canAccept: false,
        canReject: false,
        canMarkReady: false,
        canComplete: false,
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
