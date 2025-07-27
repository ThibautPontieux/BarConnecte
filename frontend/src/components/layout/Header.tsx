import React from 'react';
import { Coffee, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  title: string;
  showCart?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showCart = false }) => {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <div className="bg-amber-600 text-white p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Coffee className="w-6 h-6" />
          {title}
        </h1>
        {showCart && (
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <Badge
                variant="danger"
                className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs p-0"
              >
                {totalItems}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
