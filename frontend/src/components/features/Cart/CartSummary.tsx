import React from 'react';
import { useCartStore } from '../../../stores/useCartStore';
import { useOrderStore } from '../../../stores/useOrderStore';
import { CartItem } from './CartItem';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { formatPrice } from '../../../utils/formatters';

export const CartSummary: React.FC = () => {
  const {
    cart,
    customerName,
    updateQuantity,
    clearCart,
    setCustomerName,
    getTotalPrice,
  } = useCartStore();
  const addOrder = useOrderStore((state) => state.addOrder);

  const handleSubmitOrder = () => {
    if (cart.length === 0 || !customerName.trim()) return;

    addOrder({
      items: [...cart],
      total: getTotalPrice(),
      status: 'pending',
      customerName: customerName.trim(),
    });

    clearCart();
    alert('Commande envoyée au barman !');
  };

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
        />
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            Total: {formatPrice(getTotalPrice())}
          </span>
          <Button
            onClick={handleSubmitOrder}
            disabled={!customerName.trim()}
            variant="success"
            size="lg"
          >
            Commander
          </Button>
        </div>
      </div>
    </div>
  );
};
