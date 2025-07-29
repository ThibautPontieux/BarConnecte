import React, { useState } from 'react';
import { useProductStore } from '../../stores/useProductStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select, type SelectOption } from '../../components/ui/Select';
import { DRINK_CATEGORY_NAMES } from '../../services/types';

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

  // Générer les options de catégories depuis l'enum
  const categoryOptions: SelectOption[] = Object.entries(DRINK_CATEGORY_NAMES).map(([key, value]) => ({
    value: value, // Utiliser le nom de la catégorie comme valeur
    label: value,
  }));

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.category) {
      alert('Veuillez remplir tous les champs obligatoires (nom, prix, catégorie)');
      return;
    }

    addProduct({
      name: formData.name,
      price: formData.price,
      stock: formData.stock,
      category: formData.category,
      description: formData.description,
    });

    // Réinitialiser le formulaire
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
          placeholder="Nom du produit *"
          value={formData.name}
          onChange={(value) => updateField('name', value)}
        />
        <Input
          type="number"
          placeholder="Prix *"
          value={formData.price || ''}
          onChange={(value) => updateField('price', parseFloat(value) || 0)}
        />
        <Input
          type="number"
          placeholder="Stock"
          value={formData.stock || ''}
          onChange={(value) => updateField('stock', parseInt(value) || 0)}
        />
        {/* Remplacement du champ texte par une liste déroulante */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Catégorie *
          </label>
          <Select
            options={categoryOptions}
            value={formData.category}
            onChange={(value) => updateField('category', value as string)}
            placeholder="Sélectionner une catégorie"
          />
        </div>
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
      <p className="text-sm text-gray-500 mt-2">
        * Champs obligatoires
      </p>
    </Card>
  );
};
