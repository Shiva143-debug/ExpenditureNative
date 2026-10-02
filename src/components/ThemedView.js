// components/ThemedView.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

const ThemedView = ({ children, style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.base, { backgroundColor: colors.background }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});

export default ThemedView;
