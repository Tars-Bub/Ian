// src/hooks/useDatabaseAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { userService } from '../services/dbService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('db_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await userService.validateUser(email, password);
    if (userData) {
      setUser(userData);
      localStorage.setItem('db_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error('Invalid credentials');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('db_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useDatabaseAuth() {
  return useContext(AuthContext);
}