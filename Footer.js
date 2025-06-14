import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedView from './components/ThemedView';
import ThemedText from './components/ThemedText';
import { ThemeContext } from './context/ThemeContext';

const Footer = ({ state, descriptors, navigation }) => {
  const { theme } = useContext(ThemeContext);
  
  // Define colors based on theme
  const activeColor = theme === 'dark' ? '#42A5F5' : '#1976D2';
  const inactiveColor = theme === 'dark' ? '#757575' : '#9E9E9E';

  return (
    <ThemedView style={styles.footerContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        // Set icon based on route name
        let iconName;
        if (route.name === 'dashboard') iconName = 'dashboard';
        else if (route.name === 'Add') iconName = 'add-circle';
        else if (route.name === 'transactionReports') iconName = 'assignment';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Icon 
              name={iconName} 
              size={24} 
              color={isFocused ? activeColor : inactiveColor} 
            />
            <ThemedText 
              style={[
                styles.tabLabel, 
                { color: isFocused ? activeColor : inactiveColor }
              ]}
            >
              {label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    height: 60,
    flex: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default Footer;