import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useProductStore } from '../../stores/useProductStore';
import { Card } from '../../components/ui/Card';
import { formatPrice } from '../../utils/formatters';

export const ProductManagement: React.FC = () => {
  const { products, updateStock, deleteProduct } = useProductStore();

  return (
    <Card>
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Gestion des produits</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Produit</th>
              <th className="p-3 text-left">Prix</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Catégorie</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="p-3">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-gray-500">
                        {product.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3">{formatPrice(product.price)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateStock(product.id, product.stock - 1)}
                      className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center">{product.stock}</span>
                    <button
                      onClick={() => updateStock(product.id, product.stock + 1)}
                      className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
