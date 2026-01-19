// components/ThemedView.js
import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const ThemedView = ({ children, style }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.base,
        theme === 'dark' ? styles.dark : styles.light,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  dark: {
    backgroundColor: '#000',
  },
  light: {
    backgroundColor: '#fff',
  },
});

export default ThemedView;
