import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import Toast from 'react-native-toast-message';

const App = () => (
  <ThemeProvider>
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>

        <Toast />
      </AuthProvider>
    </PaperProvider>
  </ThemeProvider>
);

export default App;
