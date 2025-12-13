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

  const iconColor = theme === 'dark' ? '#1b1b1dff' : '#64B5F6';
  const titleColor = theme === 'dark' ? '#3F51B5' : '#1E3A8A';
  const gradientColors = theme === 'dark'
    ? ['#0d0d0eff', '#37373bff']
    : ['#E3F2FD', '#feffffff'];

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
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <ThemedText style={[styles.headerTitle, { color: titleColor }]}>Expenditure</ThemedText>

        <TouchableOpacity onPress={confirmLogout} style={styles.logoutButton}>
          <Icon name="logout" size={24} color={iconColor} />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
});

export default Header;
