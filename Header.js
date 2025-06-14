import React, { useState, useContext } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from './AuthContext';
import ThemedView from './components/ThemedView';
import ThemedText from './components/ThemedText';
import { ThemeContext } from './context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = ({ navigation }) => {
  const { logout } = useAuth();
  const { theme } = useContext(ThemeContext);

  const iconColor = theme === 'dark' ? '#FFFFFF' : '#1976D2';
  const gradientColors = theme === 'dark'
    ? ['#1A237E', '#283593']
    : ['#1976D2', '#42A5F5'];

  const confirmLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'No',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => logout(),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ThemedView style={styles.headerContainer}>
      <LinearGradient
        colors={gradientColors}
        style={styles.headerGradient}
      >
        <ThemedText style={styles.headerTitle}>Expenditure</ThemedText>

        <TouchableOpacity onPress={confirmLogout} style={styles.logoutButton}>
          <Icon name="logout" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    elevation: 3,
    flex: 0,
  },
  headerGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoutButton: {
    padding: 4,
  },
});

export default Header;
