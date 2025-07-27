import React from 'react';
import { Plus } from 'lucide-react';
import type { Product } from '../../../types';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { formatPrice } from '../../../utils/formatters';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <span className="text-amber-600 font-bold">{formatPrice(product.price)}</span>
      </div>
      {product.description && (
        <p className="text-gray-600 text-sm mb-2">{product.description}</p>
      )}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
        <Button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          icon={Plus}
          size="sm"
        >
          Ajouter
        </Button>
      </div>
    </Card>
  );
};
