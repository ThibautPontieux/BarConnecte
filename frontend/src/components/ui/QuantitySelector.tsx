import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  max?: number;
  min?: number;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onDecrease,
  onIncrease,
  max,
  min = 0,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-8 text-center font-medium">{quantity}</span>
      <button
        onClick={onIncrease}
        disabled={max !== undefined && quantity >= max}
        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
