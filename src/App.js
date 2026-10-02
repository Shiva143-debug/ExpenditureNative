import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './theme/useTheme';
import AppNavigator from './navigation/AppNavigator';
import Toast from 'react-native-toast-message';

const AppContent = () => {
  const { isDark, colors } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    dark: isDark,
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.cardBorder,
      notification: colors.primary,
    },
  };

  const paperTheme = {
    dark: isDark,
    roundness: 8,
    colors: {
      primary: colors.primary,
      background: colors.background,
      surface: colors.surface,
      onSurface: colors.textPrimary,
      accent: colors.primary,
      text: colors.textPrimary,
      placeholder: colors.textSecondary,
      backdrop: colors.overlay,
      disabled: colors.textSecondary,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <NavigationContainer theme={navigationTheme}>
          <AppNavigator />
        </NavigationContainer>

        <Toast />
      </AuthProvider>
    </PaperProvider>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
