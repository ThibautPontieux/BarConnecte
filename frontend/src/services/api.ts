import axios from 'axios';

// Configuration de base pour les APIs
export const adminApi = axios.create({
  baseURL: '/admin',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicApi = axios.create({
  baseURL: '/public',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteurs pour la gestion des erreurs
adminApi.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    console.error('Erreur API Admin:', error);
    return Promise.reject(error);
  }
);

publicApi.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    console.error('Erreur API Public:', error);
    return Promise.reject(error);
  }
);
