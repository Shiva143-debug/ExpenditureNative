import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [id, setId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        if (storedId) {
          setId(JSON.parse(storedId));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading authentication data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = async (id) => {
    setIsAuthenticated(true);
    setId(id);
    await AsyncStorage.setItem('userId', JSON.stringify(id));
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setId(null);
    await AsyncStorage.removeItem('userId');
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ id, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

