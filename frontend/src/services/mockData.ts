import type { Product } from '../types';

export const mockProducts: Product[] = [
  { 
    id: 1, 
    name: 'Bière Blonde', 
    price: 4.50, 
    stock: 24, 
    category: 'Bières', 
    description: 'Bière artisanale blonde' 
  },
  { 
    id: 2, 
    name: 'Whisky Single Malt', 
    price: 12.00, 
    stock: 8, 
    category: 'Spiritueux', 
    description: 'Whisky écossais 12 ans' 
  },
  { 
    id: 3, 
    name: 'Cocktail Mojito', 
    price: 8.50, 
    stock: 15, 
    category: 'Cocktails', 
    description: 'Rhum, menthe, citron vert' 
  },
  { 
    id: 4, 
    name: 'Vin Rouge', 
    price: 6.00, 
    stock: 12, 
    category: 'Vins', 
    description: 'Bordeaux 2020' 
  },
  { 
    id: 5, 
    name: 'Café Espresso', 
    price: 2.50, 
    stock: 50, 
    category: 'Café', 
    description: 'Café italien torréfié' 
  },
];
