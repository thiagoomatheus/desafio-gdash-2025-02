import { createContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  signed: boolean;
  user: User | null;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  loading: boolean;
}

export const AuthContext = createContext({} as AuthContextType);

export const gdashTokenKey = 'g@gdash:token';
export const gdashUserKey = '@gdash:user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedUser = localStorage.getItem(gdashUserKey);
    const storagedToken = localStorage.getItem(gdashTokenKey);

    if (storagedUser && storagedToken) {
      setUser(JSON.parse(storagedUser));

      api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
    }
    setLoading(false);
  }, []);

  function signIn(token: string, userData: User) {
    setUser(userData);
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    localStorage.setItem(gdashTokenKey, token);
    localStorage.setItem(gdashUserKey, JSON.stringify(userData));
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem(gdashTokenKey);
    localStorage.removeItem(gdashUserKey);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}