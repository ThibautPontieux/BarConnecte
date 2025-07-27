import React, { useState } from 'react';
import { useProductStore } from '../../stores/useProductStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface ProductFormData {
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
}

export const AddProductForm: React.FC = () => {
  const addProduct = useProductStore((state) => state.addProduct);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    stock: 0,
    category: '',
    description: '',
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.category) return;

    addProduct({
      name: formData.name,
      price: formData.price,
      stock: formData.stock,
      category: formData.category,
      description: formData.description,
    });

    setFormData({
      name: '',
      price: 0,
      stock: 0,
      category: '',
      description: '',
    });
  };

  const updateField = (field: keyof ProductFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Ajouter un produit</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Nom du produit"
          value={formData.name}
          onChange={(value) => updateField('name', value)}
        />
        <Input
          type="number"
          placeholder="Prix"
          value={formData.price || ''}
          onChange={(value) => updateField('price', parseFloat(value) || 0)}
        />
        <Input
          type="number"
          placeholder="Stock"
          value={formData.stock || ''}
          onChange={(value) => updateField('stock', parseInt(value) || 0)}
        />
        <Input
          placeholder="Catégorie"
          value={formData.category}
          onChange={(value) => updateField('category', value)}
        />
        <Input
          placeholder="Description"
          value={formData.description}
          onChange={(value) => updateField('description', value)}
          className="md:col-span-2"
        />
      </div>
      <Button onClick={handleSubmit} variant="success" className="mt-4">
        Ajouter le produit
      </Button>
    </Card>
  );
};
