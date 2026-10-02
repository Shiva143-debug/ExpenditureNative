import React from 'react';
import { StyleSheet, TouchableOpacity, Alert, View, Text } from 'react-native';

import ThemedView from './ThemedView';
import ThemedText from './ThemedText';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/useTheme';
import { getHeaderPalette } from '../theme/palettes';

const getInitials = (name) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Header = () => {
  const { logout, getDisplayName } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const palette = getHeaderPalette(theme);
  const { icon, gradient, strong, tagline } = palette;
  const avatarGradient = isDark ? ['#38bdf8', '#818cf8'] : ['#2563eb', '#7c3aed'];

  const displayName = getDisplayName();
  const initials = getInitials(displayName);

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
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.userRow}>
          <LinearGradient colors={avatarGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>

          <View style={styles.userInfo}>
            <ThemedText style={[styles.userName, { color: strong }]}>{displayName}</ThemedText>
            <ThemedText style={[styles.userTagline, { color: tagline }]}>Manage your finances</ThemedText>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleTheme} style={styles.actionButton} activeOpacity={0.7}>
            <Icon name={isDark ? 'light-mode' : 'dark-mode'} size={22} color={icon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={confirmLogout} style={styles.actionButton} activeOpacity={0.7}>
            <Icon name="logout" size={22} color={icon} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    elevation: 4,
    flex: 0,
  },
  headerGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userInfo: {
    marginLeft: 12,
    flexShrink: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  userTagline: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 9,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
});

export default Header;
