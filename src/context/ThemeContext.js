// context/ThemeContext.js
import React, { createContext } from 'react';
import { useColorScheme } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const scheme = useColorScheme(); // returns 'light' or 'dark'

  return (
    <ThemeContext.Provider value={{ theme: scheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
