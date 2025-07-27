import axios from 'axios';

// Configuration de base pour les APIs
export const adminApi = axios.create({
  baseURL: 'http://localhost:8080/admin',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicApi = axios.create({
  baseURL: 'http://localhost:8090/public',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteurs pour la gestion des erreurs
adminApi.interceptors.response.use(
  (response: any) => {
    console.log('Réponse API Admin:', response);
    return response;
  },
  (error: any) => {
    console.error('Erreur API Admin:', error);
    return Promise.reject(error);
  }
);

publicApi.interceptors.response.use(
  (response: any) => {
    console.log('Réponse API Public:', response);
    return response;
  },
  (error: any) => {
    console.error('Erreur API Public:', error);
    return Promise.reject(error);
  }
);
