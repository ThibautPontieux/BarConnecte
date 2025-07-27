import React from 'react';
import { Settings } from 'lucide-react';
import { AddProductForm } from './AddProductForm';
import { ProductManagement } from './ProductManagement';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6" />
        Administration
      </h1>
      <AddProductForm />
      <ProductManagement />
    </div>
  );
};
