// components/ThemedText.js
import React, { useContext } from 'react';
import { Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const ThemedText = ({ children, style, ...props }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <Text
      style={[
        styles.base,
        theme === 'dark' ? styles.darkText : styles.lightText,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
});

export default ThemedText;
