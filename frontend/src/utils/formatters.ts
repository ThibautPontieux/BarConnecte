export const formatPrice = (price: number): string => {
  return `${price.toFixed(2)}€`;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('fr-FR');
};
