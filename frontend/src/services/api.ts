import axios from 'axios';
import { extractErrorMessage, createApiError } from '../utils/errorHandling';

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
  (response) => {
    console.log('✅ Réponse API Admin:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error: AxiosError) => {
    const apiError = createApiError(error);
    
    console.error('❌ Erreur API Admin:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: apiError.message,
      originalError: error.response?.data,
      fullError: error
    });
    
    // Créer une erreur enrichie avec le message détaillé
    const enrichedError = new Error(apiError.message);
    (enrichedError as any).statusCode = apiError.statusCode;
    (enrichedError as any).details = apiError.details;
    (enrichedError as any).originalError = error;
    
    return Promise.reject(enrichedError);
  }
);

publicApi.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse API Public:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error: AxiosError) => {
    const apiError = createApiError(error);
    
    console.error('❌ Erreur API Public:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: apiError.message,
      originalError: error.response?.data,
      fullError: error
    });
    
    // Créer une erreur enrichie avec le message détaillé
    const enrichedError = new Error(apiError.message);
    (enrichedError as any).statusCode = apiError.statusCode;
    (enrichedError as any).details = apiError.details;
    (enrichedError as any).originalError = error;
    
    return Promise.reject(enrichedError);
  }
);

adminApi.interceptors.request.use(
  (config) => {
    console.log('📤 Requête API Admin:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête API Admin:', error);
    return Promise.reject(error);
  }
);

publicApi.interceptors.request.use(
  (config) => {
    console.log('📤 Requête API Public:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête API Public:', error);
    return Promise.reject(error);
  }
);
