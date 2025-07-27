import type { Product } from './Product';

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'accepted' | 'rejected';
  customerName: string;
  timestamp: Date;
}
