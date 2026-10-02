// context/ThemeContext.js
import React, {createContext, useState, useEffect, useMemo, useCallback} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {themes, buildScreenPalette} from '../theme/theme';
import {
  SCREEN_ACCENTS,
  getAddPalette,
  getDashboardPalette,
  getFormPalette,
  getHeaderPalette,
  getListPalette,
  getReportsPalette,
} from '../theme/palettes';

export const ThemeContext = createContext();

const STORAGE_KEY = 'themeMode';

export const ThemeProvider = ({children}) => {
  const scheme = useColorScheme(); // returns 'light' or 'dark'
  const [mode, setMode] = useState('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
          setMode(storedMode);
        }
      } catch (error) {
        console.error('Error loading theme mode:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeMode();
  }, []);

  const setThemeMode = useCallback(async nextMode => {
    setMode(nextMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, nextMode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  }, []);

  const resolvedTheme = mode === 'system' ? scheme : mode;
  const isDark = resolvedTheme === 'dark';

  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? 'light' : 'dark');
  }, [isDark, setThemeMode]);

  // All per-screen palettes are prebuilt constants, so this object is stable
  // for a given mode and safe to use as a hook dependency.
  const palette = useMemo(
    () => ({
      form: getFormPalette(resolvedTheme),
      add: getAddPalette(resolvedTheme),
      reports: getReportsPalette(resolvedTheme),
      dashboard: getDashboardPalette(resolvedTheme),
      header: getHeaderPalette(resolvedTheme),
      list: {
        expense: getListPalette(resolvedTheme, 'expense'),
        itemReport: getListPalette(resolvedTheme, 'itemReport'),
        income: getListPalette(resolvedTheme, 'income'),
        savings: getListPalette(resolvedTheme, 'savings'),
      },
      /** `screen('tax')` -> palette built from `SCREEN_ACCENTS.tax`. */
      screen: accentKey => buildScreenPalette(resolvedTheme, SCREEN_ACCENTS[accentKey]),
    }),
    [resolvedTheme],
  );

  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      mode,
      isDark,
      colors: themes[resolvedTheme],
      palette,
      toggleTheme,
      setThemeMode,
    }),
    [resolvedTheme, mode, isDark, palette, toggleTheme, setThemeMode],
  );

  if (isLoading) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
