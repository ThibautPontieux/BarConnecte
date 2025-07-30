// src/pages/admin/Dashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Filter, Grid, List, AlertTriangle, Edit2, Trash2, 
  Package, DollarSign, TrendingUp, Eye, EyeOff, Save, X, Check,
  ShoppingCart, Users, Clock, BarChart3, RefreshCw, ChevronLeft,
  ChevronRight, MoreVertical, Settings
} from 'lucide-react';

// Imports depuis vos types existants
import type { 
  Drink, 
  CreateDrinkRequest 
} from '../../services/types';
import { DRINK_CATEGORY_NAMES, DrinkCategory } from '../../services/types';
import { AdminApiService } from '../../services/adminApi';
import { useOrderStore } from '../../stores/useOrderStore';

// Interface pour les statistiques
interface DashboardStats {
  totalDrinks: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  pendingOrders: number;
  dailyRevenue: number;
}

// Composant principal
export const Dashboard: React.FC = () => {
  console.log('🚀 Dashboard Admin - Initialisation');
  console.log('🔍 AdminApiService disponible:', !!AdminApiService);
  console.log('🔍 Méthodes API:', Object.getOwnPropertyNames(AdminApiService));
  
  // États principaux
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDrinks: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    pendingOrders: 0,
    dailyRevenue: 0
  });
  
  // États de l'interface
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DrinkCategory | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedDrinks, setSelectedDrinks] = useState<number[]>([]);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les commandes en attente depuis le store
  const orders = useOrderStore((state) => state.orders);
  const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;

  // Chargement initial des données
  useEffect(() => {
    loadDrinks();
  }, []);

  // Fonction helper pour updateDrinkQuantity si elle n'existe pas
  const updateDrinkQuantity = async (id: number, quantity: number) => {
    console.log('🔄 Mise à jour stock - ID:', id, 'Nouvelle quantité:', quantity);
    
    try {
      if (AdminApiService.updateDrinkQuantity) {
        console.log('✅ Utilisation de updateDrinkQuantity');
        return await AdminApiService.updateDrinkQuantity(id, quantity);
      } else {
        console.log('⚠️ Fallback vers updateDrink');
        
        // Récupérer d'abord les données complètes de la boisson
        const currentDrink = drinks.find(d => d.id === id);
        if (!currentDrink) {
          throw new Error(`Boisson avec ID ${id} non trouvée`);
        }
        
        console.log('📋 Boisson actuelle:', currentDrink);
        
        // Créer la requête dans le format ApiWrapper<UpdateDrinkRequest>
        const updateRequest = {
          success: true,
          data: {
            name: currentDrink.name,
            price: currentDrink.price.toString(),
            quantity: quantity,  // Nouvelle quantité
            category: currentDrink.category,
            description: currentDrink.description || ''
          },
          errorMessage: null
        };
        
        console.log('📤 Données envoyées avec ApiWrapper:', updateRequest);
        return await AdminApiService.updateDrink(id, updateRequest);
      }
    } catch (error: any) {
      console.error('❌ Erreur dans updateDrinkQuantity:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      throw error;
    }
  };

  const loadDrinks = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Appel AdminApiService.getDrinks()...');
      const response = await AdminApiService.getDrinks();
      
      // DEBUG : Affichons la structure complète de la réponse
      console.log('🔍 Réponse API brute:', response);
      console.log('🔍 Type de réponse:', typeof response);
      console.log('🔍 Est un tableau ?', Array.isArray(response));
      console.log('🔍 Clés disponibles:', response ? Object.keys(response) : 'aucune');
      
      // Analyser le contenu de 'data' plus en détail
      if (response && typeof response === 'object' && 'data' in response) {
        console.log('🔍 Contenu de response.data:', response.data);
        console.log('🔍 Type de response.data:', typeof response.data);
        console.log('🔍 response.data est un tableau ?', Array.isArray(response.data));
        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          console.log('🔍 Clés dans response.data:', Object.keys(response.data));
        }
      }
      
      // Gérer différents formats de réponse de l'API
      let drinksData: Drink[];
      
      if (Array.isArray(response)) {
        // Réponse directe en tableau
        console.log('✅ Format détecté: Tableau direct');
        drinksData = response;
      } else if (response && typeof response === 'object') {
        // Vérifier d'abord si c'est le format {success, data, errorMessage}
        if ('success' in response && 'data' in response) {
          console.log('✅ Format détecté: Wrapper API avec success/data/errorMessage');
          
          // Vérifier si success est true
          if (response.success) {
            const data = response.data;
            
            if (Array.isArray(data)) {
              console.log('✅ data est un tableau direct');
              drinksData = data;
            } else if (data && typeof data === 'object') {
              // data pourrait contenir un sous-objet avec les drinks
              if ('drinks' in data && Array.isArray(data.drinks)) {
                console.log('✅ Données dans data.drinks');
                drinksData = data.drinks;
              } else if ('items' in data && Array.isArray(data.items)) {
                console.log('✅ Données dans data.items');
                drinksData = data.items;
              } else {
                console.error('❌ Structure de data non reconnue:', Object.keys(data));
                throw new Error(`data contient: ${Object.keys(data).join(', ')} - aucun tableau trouvé`);
              }
            } else {
              console.error('❌ data n\'est ni tableau ni objet:', typeof data, data);
              throw new Error(`data est de type ${typeof data}, attendu: tableau ou objet`);
            }
          } else {
            // API a retourné success: false
            const errorMsg = response.errorMessage || 'Erreur API inconnue';
            console.error('❌ API error:', errorMsg);
            throw new Error(`Erreur API: ${errorMsg}`);
          }
        }
        // Autres formats (fallback)
        else if ('data' in response && Array.isArray(response.data)) {
          console.log('✅ Format détecté: Wrapper avec data (tableau direct)');
          drinksData = response.data;
        } else if ('drinks' in response && Array.isArray(response.drinks)) {
          console.log('✅ Format détecté: Wrapper avec drinks');
          drinksData = response.drinks;
        } else if ('result' in response && Array.isArray(response.result)) {
          console.log('✅ Format détecté: Wrapper avec result');
          drinksData = response.result;
        } else if ('items' in response && Array.isArray(response.items)) {
          console.log('✅ Format détecté: Wrapper avec items');
          drinksData = response.items;
        } else {
          // Affichons tout ce qu'on a trouvé pour debug
          console.error('❌ Structure non reconnue. Propriétés disponibles:', Object.keys(response));
          console.error('❌ Valeurs des propriétés:');
          Object.entries(response).forEach(([key, value]) => {
            console.error(`   ${key}:`, typeof value, Array.isArray(value) ? `(tableau de ${value.length})` : '', value);
          });
          throw new Error(`Format de réponse API non reconnu. Propriétés disponibles: ${Object.keys(response).join(', ')}`);
        }
      } else {
        console.error('❌ Réponse invalide, type:', typeof response, 'valeur:', response);
        throw new Error('Réponse API invalide - ni tableau ni objet');
      }

      console.log('📦 Données extraites:', drinksData.length, 'boissons');
      console.log('📦 Premier élément:', drinksData[0]);
      setDrinks(drinksData);
      
      // Calculer les statistiques
      const statsData: DashboardStats = {
        totalDrinks: drinksData.length,
        lowStock: drinksData.filter(d => d.quantity > 0 && d.quantity <= 5).length,
        outOfStock: drinksData.filter(d => d.quantity === 0).length,
        totalValue: drinksData.reduce((sum, d) => sum + (d.price * d.quantity), 0),
        pendingOrders: pendingOrdersCount,
        dailyRevenue: 0, // À calculer selon votre logique métier
      };
      setStats(statsData);
      console.log('📊 Statistiques calculées:', statsData);
    } catch (err: any) {
      const errorMessage = err?.message || 'Erreur lors du chargement des données';
      setError(errorMessage);
      console.error('❌ Erreur complète chargement drinks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage et pagination
  const filteredDrinks = useMemo(() => {
    return drinks.filter(drink => {
      const matchesSearch = drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           drink.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || drink.category === selectedCategory;
      const matchesStock = stockFilter === 'all' || 
                          (stockFilter === 'low' && drink.quantity > 0 && drink.quantity <= 5) ||
                          (stockFilter === 'out' && drink.quantity === 0);
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [drinks, searchTerm, selectedCategory, stockFilter]);

  const paginatedDrinks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDrinks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDrinks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredDrinks.length / itemsPerPage);

  // Actions CRUD
  const handleUpdateStock = async (drinkId: number, newQuantity: number) => {
    setLoading(true);
    setError(null);
    try {
      await updateDrinkQuantity(drinkId, newQuantity);
      setDrinks(prev => prev.map(drink => 
        drink.id === drinkId ? { ...drink, quantity: newQuantity } : drink
      ));
      console.log('✅ Stock mis à jour:', drinkId, '->', newQuantity);
    } catch (err: any) {
      const errorMessage = err?.message || 'Erreur lors de la mise à jour du stock';
      setError(errorMessage);
      console.error('Erreur mise à jour stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrink = async (drinkId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette boisson ?')) return;
    
    setLoading(true);
    setError(null);
    try {
      await AdminApiService.deleteDrink(drinkId);
      setDrinks(prev => prev.filter(drink => drink.id !== drinkId));
      console.log('🗑️ Boisson supprimée:', drinkId);
    } catch (err: any) {
      const errorMessage = err?.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Erreur suppression:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'updateStock', value?: number) => {
    if (selectedDrinks.length === 0) return;
    
    if (action === 'delete' && !window.confirm(`Supprimer ${selectedDrinks.length} boissons ?`)) return;
    
    setLoading(true);
    setError(null);
    try {
      if (action === 'delete') {
        // Supprimer en parallèle mais avec gestion d'erreur
        const deletePromises = selectedDrinks.map(async (id) => {
          try {
            await AdminApiService.deleteDrink(id);
            return { id, success: true };
          } catch (err) {
            console.error(`Erreur suppression boisson ${id}:`, err);
            return { id, success: false };
          }
        });
        
        const results = await Promise.all(deletePromises);
        const deletedIds = results.filter(r => r.success).map(r => r.id);
        const failedCount = results.filter(r => !r.success).length;
        
        setDrinks(prev => prev.filter(drink => !deletedIds.includes(drink.id)));
        
        if (failedCount > 0) {
          setError(`${failedCount} boisson(s) n'ont pas pu être supprimées`);
        }
        
        console.log('🗑️ Suppression groupée:', deletedIds.length, 'succès,', failedCount, 'échecs');
        
      } else if (action === 'updateStock' && value !== undefined) {
        // Mettre à jour le stock en parallèle
        const updatePromises = selectedDrinks.map(async (id) => {
          try {
            await updateDrinkQuantity(id, value);
            return { id, success: true };
          } catch (err) {
            console.error(`Erreur mise à jour stock boisson ${id}:`, err);
            return { id, success: false };
          }
        });
        
        const results = await Promise.all(updatePromises);
        const updatedIds = results.filter(r => r.success).map(r => r.id);
        const failedCount = results.filter(r => !r.success).length;
        
        setDrinks(prev => prev.map(drink => 
          updatedIds.includes(drink.id) ? { ...drink, quantity: value } : drink
        ));
        
        if (failedCount > 0) {
          setError(`${failedCount} boisson(s) n'ont pas pu être mises à jour`);
        }
        
        console.log('📦 Mise à jour stock groupée:', updatedIds.length, 'succès,', failedCount, 'échecs');
      }
      
      setSelectedDrinks([]);
    } catch (err: any) {
      const errorMessage = err?.message || 'Erreur lors de l\'action groupée';
      setError(errorMessage);
      console.error('Erreur action groupée:', err);
    } finally {
      setLoading(false);
    }
  };

  // Composant carte boisson
  const DrinkCard = ({ drink }: { drink: Drink }) => {
    const [quickEditStock, setQuickEditStock] = useState<number | null>(null);
    const isLowStock = drink.quantity > 0 && drink.quantity <= 5;
    const isOutOfStock = drink.quantity === 0;
    const isSelected = selectedDrinks.includes(drink.id);

    return (
      <div className={`bg-white rounded-lg border transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200'
      } ${isOutOfStock ? 'opacity-75' : ''}`}>
        
        {/* Header avec sélection */}
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedDrinks(prev => [...prev, drink.id]);
                } else {
                  setSelectedDrinks(prev => prev.filter(id => id !== drink.id));
                }
              }}
              className="mt-1"
            />
            <div className="flex gap-1">
              {isOutOfStock && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                  Rupture
                </span>
              )}
              {isLowStock && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                  Stock faible
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-4 pb-4">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 mb-1">{drink.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {DRINK_CATEGORY_NAMES[drink.category]}
            </p>
            {drink.description && (
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{drink.description}</p>
            )}
          </div>

          {/* Prix et stock */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-gray-900">{drink.price.toFixed(2)}€</span>
            <div className="flex items-center gap-2">
              {quickEditStock === drink.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    defaultValue={drink.quantity}
                    className="w-16 px-2 py-1 text-sm border rounded"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const newValue = parseInt((e.target as HTMLInputElement).value);
                        if (!isNaN(newValue) && newValue >= 0) {
                          handleUpdateStock(drink.id, newValue);
                          setQuickEditStock(null);
                        }
                      }
                      if (e.key === 'Escape') {
                        setQuickEditStock(null);
                      }
                    }}
                    id={`stock-input-${drink.id}`}
                    autoFocus
                  />
                  {/* Boutons pour mobile/tablette */}
                  <button
                    onClick={() => {
                      const input = document.getElementById(`stock-input-${drink.id}`) as HTMLInputElement;
                      const newValue = parseInt(input.value);
                      if (!isNaN(newValue) && newValue >= 0) {
                        handleUpdateStock(drink.id, newValue);
                        setQuickEditStock(null);
                      }
                    }}
                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                    title="Valider"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setQuickEditStock(null)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    title="Annuler"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setQuickEditStock(drink.id)}
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  <Package size={14} />
                  {drink.quantity}
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setEditingDrink(drink)}
              className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors flex items-center justify-center gap-1"
            >
              <Edit2 size={14} />
              Modifier
            </button>
            <button
              onClick={() => handleDeleteDrink(drink.id)}
              className="px-3 py-2 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal de création/édition
  const DrinkModal = ({ drink, onClose }: { drink?: Drink; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: drink?.name || '',
      price: drink?.price || 0,
      quantity: drink?.quantity || 0,
      category: drink?.category || DrinkCategory.Bieres,
      description: drink?.description || ''
    });

    const handleSubmit = async () => {
      if (!formData.name.trim() || formData.price <= 0) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        if (drink) {
          // Mise à jour avec ApiWrapper
          const updateRequest = {
            success: true,
            data: {
              name: formData.name,
              price: formData.price.toString(),
              quantity: formData.quantity,
              category: formData.category,
              description: formData.description
            },
            errorMessage: null
          };
          
          console.log('🔄 Mise à jour boisson:', drink.id, updateRequest);
          const response = await AdminApiService.updateDrink(drink.id, updateRequest);
          
          // Gérer la réponse qui peut être encapsulée
          let updatedDrink = response;
          if (response && typeof response === 'object' && 'data' in response) {
            updatedDrink = response.data;
          }
          
          setDrinks(prev => prev.map(d => 
            d.id === drink.id ? { ...d, ...formData } : d
          ));
          console.log('✅ Boisson mise à jour:', updatedDrink);
          
        } else {
          // Création avec ApiWrapper
          const createRequest = {
            success: true,
            data: {
              name: formData.name,
              price: formData.price.toString(),
              quantity: formData.quantity,
              category: formData.category,
              description: formData.description
            },
            errorMessage: null
          };
          
          console.log('➕ Création boisson:', createRequest);
          const response = await AdminApiService.createDrink(createRequest.data); // Pour create, on envoie juste data
          
          // Gérer la réponse qui peut être encapsulée
          let newDrink = response;
          if (response && typeof response === 'object' && 'data' in response) {
            newDrink = response.data;
          }
          
          // S'assurer que newDrink a un ID valide
          if (newDrink && typeof newDrink === 'object' && 'id' in newDrink) {
            setDrinks(prev => [...prev, newDrink as Drink]);
            console.log('✅ Boisson créée:', newDrink);
          } else {
            // Fallback: recharger toutes les données
            await loadDrinks();
            console.log('✅ Boisson créée, données rechargées');
          }
        }
        onClose();
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Erreur lors de la sauvegarde';
        setError(errorMessage);
        console.error('Erreur sauvegarde:', err);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {drink ? 'Modifier la boisson' : 'Nouvelle boisson'}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: parseInt(e.target.value) as DrinkCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(DRINK_CATEGORY_NAMES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.name.trim() || formData.price <= 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  {drink ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec statistiques */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration DrinkIT</h1>
              <p className="text-gray-600">Gestion des boissons et stocks</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <Plus size={18} />
              Nouvelle boisson
            </button>
          </div>

          {/* Affichage d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={18} />
                <span className="text-red-800">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Package className="text-blue-600" size={18} />
                <span className="text-sm text-blue-600 font-medium">Total</span>
              </div>
              <span className="text-2xl font-bold text-blue-900">{stats.totalDrinks}</span>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="text-orange-600" size={18} />
                <span className="text-sm text-orange-600 font-medium">Stock faible</span>
              </div>
              <span className="text-2xl font-bold text-orange-900">{stats.lowStock}</span>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <X className="text-red-600" size={18} />
                <span className="text-sm text-red-600 font-medium">Rupture</span>
              </div>
              <span className="text-2xl font-bold text-red-900">{stats.outOfStock}</span>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="text-green-600" size={18} />
                <span className="text-sm text-green-600 font-medium">Valeur stock</span>
              </div>
              <span className="text-lg font-bold text-green-900">{stats.totalValue.toLocaleString()}€</span>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="text-purple-600" size={18} />
                <span className="text-sm text-purple-600 font-medium">Commandes</span>
              </div>
              <span className="text-2xl font-bold text-purple-900">{stats.pendingOrders}</span>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="text-indigo-600" size={18} />
                <span className="text-sm text-indigo-600 font-medium">CA jour</span>
              </div>
              <span className="text-lg font-bold text-indigo-900">{stats.dailyRevenue}€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg border mb-6 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtres rapides */}
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as DrinkCategory)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes catégories</option>
                {Object.entries(DRINK_CATEGORY_NAMES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as 'all' | 'low' | 'out')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous stocks</option>
                <option value="low">Stock faible</option>
                <option value="out">Rupture</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List size={18} />
                </button>
              </div>

              <button
                onClick={loadDrinks}
                className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Actions groupées */}
          {selectedDrinks.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedDrinks.length} boisson(s) sélectionnée(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                  disabled={loading}
                >
                  Supprimer
                </button>
                <button
                  onClick={() => {
                    const newStock = prompt('Nouveau stock pour toutes les boissons sélectionnées:');
                    if (newStock && !isNaN(parseInt(newStock))) {
                      handleBulkAction('updateStock', parseInt(newStock));
                    }
                  }}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
                  disabled={loading}
                >
                  Maj stock
                </button>
                <button
                  onClick={() => setSelectedDrinks([])}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors"
                >
                  Désélectionner
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Liste des boissons */}
        {loading && drinks.length === 0 && (
          <div className="text-center py-8">
            <RefreshCw className="animate-spin mx-auto mb-2 text-blue-600" size={32} />
            <p className="text-gray-600">Chargement...</p>
          </div>
        )}

        {!loading && paginatedDrinks.length === 0 && filteredDrinks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Package className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune boisson trouvée</h3>
            <p className="text-gray-600 mb-4">Essayez de modifier vos filtres ou créez une nouvelle boisson.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Créer ma première boisson
            </button>
          </div>
        )}

        {!loading && paginatedDrinks.length > 0 && (
          <>
            {/* Grille des boissons */}
            <div className={`grid gap-4 mb-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {paginatedDrinks.map(drink => (
                <DrinkCard key={drink.id} drink={drink} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredDrinks.length)} sur {filteredDrinks.length} résultats
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 text-sm rounded ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {(editingDrink || showCreateModal) && (
        <DrinkModal
          drink={editingDrink || undefined}
          onClose={() => {
            setEditingDrink(null);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};
