import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../core/types';
import { getProvider } from '../core/provider';

interface AuthContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('cls_mgr_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('cls_mgr_session', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cls_mgr_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};