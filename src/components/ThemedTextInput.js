// components/ThemedTextInput.js
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

const ThemedTextInput = ({ style, ...props }) => {
  const { colors } = useTheme();

  return (
    <TextInput
      style={[
        styles.base,
        {
          backgroundColor: colors.inputBackground,
          color: colors.textPrimary,
          borderColor: colors.inputBorder,
        },
        style,
      ]}
      placeholderTextColor={colors.inputPlaceholder}
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
});

export default ThemedTextInput;
