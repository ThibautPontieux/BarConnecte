import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  role: 'client' | 'barman' | 'admin';
}

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Ici tu appellerais ton API d'authentification
      // Pour le moment, simulation
      const mockUser: User = {
        id: 1,
        name: username,
        role: username === 'admin' ? 'admin' : username === 'barman' ? 'barman' : 'client',
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };
}
