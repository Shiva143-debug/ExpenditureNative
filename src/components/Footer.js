import React, { useContext, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedView from './ThemedView';
import ThemedText from './ThemedText';
import { ThemeContext } from '../context/ThemeContext';



const Footer = ({ state, descriptors, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const translateY = useRef(new Animated.Value(84)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 480,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const activeColor = theme === 'dark' ? '#38bdf8' : '#2563eb';
  const inactiveColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const footerBackground = theme === 'dark' ? '#0f172a' : '#ffffff';
  const borderColor = theme === 'dark' ? 'rgba(148, 163, 184, 0.24)' : 'rgba(15, 23, 42, 0.08)';
  const tabBackground = theme === 'dark' ? 'rgba(56, 189, 248, 0.22)' : 'rgba(37, 99, 235, 0.12)';
  const addBackground = theme === 'dark' ? '#1f2937' : '#dbeafe';

  return (
    <Animated.View style={[styles.animatedWrapper, { opacity, transform: [{ translateY }] }]}>
      <ThemedView style={[styles.footerContainer, { backgroundColor: footerBackground, borderTopColor: borderColor }] }>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

          let iconName;
          if (route.name === 'dashboard') iconName = 'dashboard';
          else if (route.name === 'Add') iconName = 'add';
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

          if (route.name === 'Add') {
            const addColor = isFocused ? activeColor : addBackground;
            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={[styles.tabButton, styles.addTabButton]}
              >
                <View style={[styles.addIconWrapper, { backgroundColor: addColor }]}>
                  <Icon
                    name={iconName}
                    size={34}
                    color="#ffffff"
                  />
                </View>
                <ThemedText
                  style={[styles.tabLabel, styles.addLabel, { color: isFocused ? activeColor : inactiveColor }]}
                >
                  {label}
                </ThemedText>
              </TouchableOpacity>
            );
          }

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
              <View style={[styles.tabIconWrapper, { marginTop: isFocused ? 4 : 10 }]}>
                <View style={[styles.tabIconInner, { backgroundColor: isFocused ? activeColor : tabBackground }]}>
                  <Icon
                    name={iconName}
                    size={22}
                    color={isFocused ? '#ffffff' : inactiveColor}
                  />
                </View>
              </View>
              <ThemedText
                style={[styles.tabLabel, { color: isFocused ? activeColor : inactiveColor }]}
              >
                {label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ThemedView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedWrapper: {
    width: '100%',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 30,
    borderTopWidth: 1,
  },
  footerShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
  },
  tabIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 6,
  },
  addTabButton: {
    paddingTop: 28,
  },
  addIconWrapper: {
    width: 78,
    height: 78,
    borderRadius: 39,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -34 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 14,
  },
  addLabel: {
    marginTop: -4,
  },
});

export default Footer;