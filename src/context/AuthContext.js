import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const decodeJwt = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(b64DecodeUnicode(payload));
  } catch (e) {
    return null;
  }
};

const b64DecodeUnicode = (str) => {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '==='.slice((base64.length + 3) % 4);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let binary = '';
  for (let i = 0; i < padded.length; i += 4) {
    const c1 = chars.indexOf(padded[i]);
    const c2 = chars.indexOf(padded[i + 1]);
    const c3 = padded[i + 2] === '=' ? 0 : chars.indexOf(padded[i + 2]);
    const c4 = padded[i + 3] === '=' ? 0 : chars.indexOf(padded[i + 3]);
    const n = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;
    binary += String.fromCharCode((n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff);
  }
  return decodeURIComponent(
    binary
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Error loading authentication data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = async (authToken, userData = null) => {
    setIsAuthenticated(true);
    setToken(authToken);
    setUser(userData);
    try {
      await AsyncStorage.setItem('token', authToken);
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    setInitialDataLoaded(false);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  // Derive a display name from the user object, falling back to the JWT payload
  // (useful when the navigation header hasn't re-subscribed to context yet).
  const getDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.full_name) return user.full_name;
    if (user?.name) return user.name;
    if (user?.email) return user.email;
    const payload = decodeJwt(token);
    if (payload?.fullName) return payload.fullName;
    if (payload?.full_name) return payload.full_name;
    if (payload?.name) return payload.name;
    if (payload?.email) return payload.email;
    return 'User';
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout, getDisplayName, initialDataLoaded, setInitialDataLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
