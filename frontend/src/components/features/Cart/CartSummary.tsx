import React, { useState } from 'react';
import { useCartStore } from '../../../stores/useCartStore';
import { useOrderStore } from '../../../stores/useOrderStore';
import { CartItem } from './CartItem';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { formatPrice } from '../../../utils/formatters';
import { CheckCircle, Loader } from 'lucide-react';

export const CartSummary: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  
  const {
    cart,
    customerName,
    updateQuantity,
    clearCart,
    setCustomerName,
    getTotalPrice,
  } = useCartStore();
  
  const { addOrder, error: orderError } = useOrderStore();

  const handleSubmitOrder = async () => {
    if (cart.length === 0 || !customerName.trim()) {
      console.warn('Commande invalide: panier vide ou nom manquant');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🛒 Soumission commande:', {
        customerName: customerName.trim(),
        items: cart,
        total: getTotalPrice()
      });

      // Créer la commande directement via le store
      const orderId = await addOrder({
        items: [...cart],
        total: getTotalPrice(),
        status: 'pending',
        customerName: customerName.trim(),
      });

      console.log('✅ Commande créée avec ID:', orderId);
      setLastOrderId(orderId);
      clearCart();
      
      // Afficher un message de succès temporaire
      setTimeout(() => {
        setLastOrderId(null);
      }, 5000);

    } catch (error) {
      console.error('❌ Erreur lors de la commande:', error);
      // L'erreur est déjà gérée par le store
    } finally {
      setIsSubmitting(false);
    }
  };

  // Affichage du message de succès
  if (lastOrderId && cart.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-green-50 border-t-2 border-green-200 shadow-lg p-4">
        <div className="flex items-center justify-center gap-3 text-green-800">
          <CheckCircle className="w-6 h-6" />
          <div className="text-center">
            <p className="font-semibold">Commande envoyée !</p>
            <p className="text-sm">Numéro de commande : #{lastOrderId}</p>
            <p className="text-xs">Votre commande a été transmise au barman</p>
          </div>
        </div>
      </div>
    );
  }

  // Ne pas afficher si le panier est vide
  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="max-h-48 overflow-y-auto mb-4">
        {cart.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={updateQuantity}
          />
        ))}
      </div>

      <div className="border-t pt-4">
        <Input
          placeholder="Votre nom"
          value={customerName}
          onChange={setCustomerName}
          className="mb-4"
          disabled={isSubmitting}
        />
        
        {/* Affichage des erreurs */}
        {orderError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            <strong>Erreur:</strong> {orderError}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            Total: {formatPrice(getTotalPrice())}
          </span>
          
          <Button
            onClick={handleSubmitOrder}
            disabled={!customerName.trim() || isSubmitting || cart.length === 0}
            variant="success"
            size="lg"
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Envoi...
              </>
            ) : (
              'Commander'
            )}
          </Button>
        </div>
        
        {/* Informations supplémentaires */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          {cart.length} article(s) • Livraison immédiate au bar
        </div>
      </div>
    </div>
  );
};
