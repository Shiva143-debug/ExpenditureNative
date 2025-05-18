// components/ThemedTextInput.js
import React, { useContext } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const ThemedTextInput = ({ style, ...props }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <TextInput
      style={[
        styles.base,
        isDark ? styles.darkInput : styles.lightInput,
        style,
      ]}
      placeholderTextColor={isDark ? '#ccc' : '#666'}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  lightInput: {
    backgroundColor: '#fff',
    color: '#000',
    borderColor: '#ccc',
  },
  darkInput: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderColor: '#555',
  },
});

export default ThemedTextInput;
