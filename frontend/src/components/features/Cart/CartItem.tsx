import React from 'react';
import { CartItem as CartItemType } from '../../../types';
import { QuantitySelector } from '../../ui/QuantitySelector';
import { formatPrice } from '../../../utils/formatters';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
}) => {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="font-medium">{item.name}</span>
      <div className="flex items-center gap-2">
        <QuantitySelector
          quantity={item.quantity}
          onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
          onIncrease={() => onUpdateQuantity(item.id, Math.min(item.quantity + 1, item.stock))}
          max={item.stock}
        />
        <span className="ml-2 font-bold min-w-[60px] text-right">
          {formatPrice(item.price * item.quantity)}
        </span>
      </div>
    </div>
  );
};
