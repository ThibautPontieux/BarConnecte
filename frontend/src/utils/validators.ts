export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePrice = (price: number): boolean => {
  return price > 0 && price <= 1000;
};

export const validateStock = (stock: number): boolean => {
  return stock >= 0 && stock <= 9999;
};

export const validateProductName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};

export const validateCustomerName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};
