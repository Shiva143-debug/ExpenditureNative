// components/ThemedText.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';


const ThemedText = ({ children, style, ...props }) => {
  const { colors } = useTheme();

  return (
    <Text
      style={[styles.base, { color: colors.textPrimary }, style]}
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
});

export default ThemedText;
