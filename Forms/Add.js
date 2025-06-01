import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Expence from  "./Expence"
import Source from './Source';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Add = () => {
  const [selectedTab, setSelectedTab] = useState('expence');

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <LinearGradient  colors={['#1976D2', '#0D47A1']}  style={styles.headerGradient} >
            <ThemedText style={styles.headerTitle}>
              Add {selectedTab === 'expence' ? 'Expence' : 'Income'}
            </ThemedText>
          </LinearGradient>
        </ThemedView>

        {/* Tab Buttons */}
        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.tabButton, selectedTab === 'expence' && styles.activeTabButton]} onPress={() => handleTabChange('expence')}>
            <LinearGradient  colors={selectedTab === 'expence' ? ['#FF5252', '#D32F2F'] : ['#757575', '#616161']} style={styles.tabGradient} >
              <View style={styles.tabContent}>
                <Icon  name="trending-down"  size={24}  color="#FFF"  style={styles.tabIcon}/>
                <ThemedText style={styles.buttonText}>Expence</ThemedText>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity  style={[styles.tabButton, selectedTab === 'income' && styles.activeTabButton]} onPress={() => handleTabChange('income')}>
            <LinearGradient colors={selectedTab === 'income' ? ['#4CAF50', '#2E7D32'] : ['#757575', '#616161']} style={styles.tabGradient}>
              <View style={styles.tabContent}>
                <Icon  name="trending-up"  size={24}  color="#FFF"  style={styles.tabIcon}/>
                <ThemedText style={styles.buttonText}>Income</ThemedText>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ThemedView>

        {/* Content */}
        <ThemedView style={styles.componentContainer}>
          {selectedTab === 'expence' ? <Expence /> : <Source />}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 80,
    marginBottom: 20,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeTabButton: {
    transform: [{ scale: 1.02 }],
    elevation: 5,
  },
  tabGradient: {
    padding: 15,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  componentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

export default Add;
