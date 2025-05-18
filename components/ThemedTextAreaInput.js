// components/ThemedTextAreaInput.js
import React, { useContext } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const ThemedTextAreaInput = ({ style, ...props }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <TextInput
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      placeholderTextColor={isDark ? '#ccc' : '#666'}
      style={[
        styles.base,
        isDark ? styles.darkInput : styles.lightInput,
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 8,
    minHeight: 100,
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

export default ThemedTextAreaInput;
