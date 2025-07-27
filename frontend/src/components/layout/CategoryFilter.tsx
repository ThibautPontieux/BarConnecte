import React from 'react';
import { useCategories } from '../../hooks/useCategories';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const categories = useCategories();

  return (
    <div className="p-4 bg-white border-b">
      <div className="flex gap-2 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-amber-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {category === 'all' ? 'Tous' : category}
          </button>
        ))}
      </div>
    </div>
  );
};
