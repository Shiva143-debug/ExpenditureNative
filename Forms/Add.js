import React, { useState, useContext, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Expence from './Expence';
import Source from './Source';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { ThemeContext } from '../context/ThemeContext';
import Saving from './saving';

const Add = () => {
  const [selectedTab, setSelectedTab] = useState('expence');
  const { theme } = useContext(ThemeContext);

  const palette = useMemo(() => theme === 'dark'
    ? {
      background: 'black',
      headerGradient: ['#1d4ed8', '#7c3aed'],
      headerTitle: '#f8fafc',
      headerSubtitle: 'rgba(226, 232, 240, 0.78)',
      tabContainerBackground: 'rgba(15, 23, 42, 0.92)',
      tabContainerBorder: 'rgba(148, 163, 184, 0.32)',
      tabInactive: 'rgba(148, 163, 184, 0.14)',
      tabInactiveText: '#cbd5f5',
      tabInactiveIcon: '#cbd5f5',
      expenseGradient: ['#ef4444', '#dc2626'],
      incomeGradient: ['#22c55e', '#16a34a'],
      savingGradient: ['#0ea5e9', '#14b8a6'],
      savingButtonGradient: ['#14b8a6', '#0d9488'],
      savingClearGradient: ['#64748b', '#475569'],
      savingBorder: 'rgba(148, 163, 184, 0.32)',
      savingText: '#e2e8f0',
      cardBackground: 'black',
      cardBorder: 'rgba(148, 163, 184, 0.16)',
    }
    : {
      background: '#f5f7fb',
      headerGradient: ['#2563eb', '#7c3aed'],
      headerTitle: '#ffffff',
      headerSubtitle: 'rgba(255, 255, 255, 0.85)',
      tabContainerBackground: '#ffffff',
      tabContainerBorder: 'rgba(37, 99, 235, 0.16)',
      tabInactive: 'rgba(37, 99, 235, 0.1)',
      tabInactiveText: '#2563eb',
      tabInactiveIcon: '#2563eb',
      expenseGradient: ['#fb7185', '#f97316'],
      incomeGradient: ['#34d399', '#16a34a'],
      savingGradient: ['#14b8a6', '#0ea5e9'],
      savingButtonGradient: ['#14b8a6', '#0d9488'],
      savingClearGradient: ['#cbd5f5', '#94a3b8'],
      savingBorder: 'rgba(37, 99, 235, 0.18)',
      savingText: '#0f172a',
      cardBackground: '#ffffff',
      cardBorder: 'rgba(15, 23, 42, 0.08)',
    }, [theme]);

  const tabs = useMemo(() => [
    { key: 'expence', label: 'Expense', icon: 'trending-down', gradient: palette.expenseGradient },
    { key: 'income', label: 'Income', icon: 'trending-up', gradient: palette.incomeGradient },
    { key: 'saving', label: 'Saving', icon: 'savings', gradient: palette.savingGradient },
  ], [palette]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.background }]}>
      <LinearGradient colors={palette.headerGradient} style={styles.headerGradient}>
        <ThemedText style={[styles.headerTitle, { color: palette.headerTitle }]}>Add {selectedTab === 'expence' ? 'Expense' : selectedTab === 'income' ? 'Income' : 'Saving'}</ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: palette.headerSubtitle }]}>Keep your finances organised with quick entries.</ThemedText>
      </LinearGradient>
      <View style={styles.body}>
        <View style={[styles.tabSwitcher, { backgroundColor: palette.tabContainerBackground, borderColor: palette.tabContainerBorder }]}>
          {tabs.map(tab => {
            const isActive = selectedTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabButton}
                activeOpacity={0.92}
                onPress={() => setSelectedTab(tab.key)}
              >
                {isActive ? (
                  <LinearGradient colors={tab.gradient} style={styles.tabActive}>
                    <Icon name={tab.icon} size={20} color="#ffffff" style={styles.tabIcon} />
                    <ThemedText style={[styles.tabText, styles.tabTextActive]}>{tab.label}</ThemedText>
                  </LinearGradient>
                ) : (
                  <View style={[styles.tabInactive, { backgroundColor: palette.tabInactive }] }>
                    <Icon name={tab.icon} size={20} color={palette.tabInactiveIcon} style={styles.tabIcon} />
                    <ThemedText style={[styles.tabText, { color: palette.tabInactiveText }]}>{tab.label}</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={[styles.contentCard, styles.contentShadow, { backgroundColor: palette.cardBackground, borderColor: palette.cardBorder }]}>
          {selectedTab === 'expence' && <Expence palette={palette}/>}
          {selectedTab === 'income' && <Source palette={palette}/>}
          {selectedTab === 'saving' && <Saving palette={palette} />}
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: 34,
    paddingTop: 12,
    paddingBottom: 72,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  body: {
    flex: 1,
    marginTop: -60,
    paddingHorizontal: 10,
  },
  tabSwitcher: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 26,
    padding: 6,
    gap: 6,
    marginBottom: 22,
  },
  tabButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  tabActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
  },
  tabInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  contentCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    overflow: 'hidden',
  },
  contentShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 12,
  },
});

export default Add;
