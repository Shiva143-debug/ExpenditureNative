// components/ThemedTextAreaInput.js
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

const ThemedTextAreaInput = ({ style, ...props }) => {
  const { colors } = useTheme();

  return (
    <TextInput
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      placeholderTextColor={colors.inputPlaceholder}
      style={[
        styles.base,
        {
          backgroundColor: colors.inputBackground,
          color: colors.textPrimary,
          borderColor: colors.inputBorder,
        },
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
});

export default ThemedTextAreaInput;
