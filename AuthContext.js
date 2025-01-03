import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [id, setId] = useState(null);

  const login = (id) => {
    setIsAuthenticated(true);
    setId(id);
  }
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{id, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
