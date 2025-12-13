import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Animated, Text, Alert } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoaderSpinner from '../LoaderSpinner';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import ThemedTextInput from '../components/ThemedTextInput';
import LinearGradient from 'react-native-linear-gradient';
import {getIncomeSources, deleteSource} from "../services/apiService";
import { ThemeContext } from '../context/ThemeContext';

const colorProfiles = {
  light: {
    background: ['#dcfce7', '#bbf7d0'],
    accent: '#15803d',
    accentSoft: '#4a7c59',
    cardShadow: '#00000022',
    iconBackground: alpha => `rgba(21, 128, 61, ${alpha})`,
    listBackground: '#f1fff6',
    emptyIcon: '#9ca3af',
    cardAccent: '#0f172a',
  },
  dark: {
    background: ['#0f3a2d', '#0b1f16'],
    accent: '#34d399',
    accentSoft: '#5eead4',
    cardShadow: '#00000044',
    iconBackground: alpha => `rgba(52, 211, 153, ${alpha})`,
    listBackground: '#0b1913',
    emptyIcon: '#4b5563',
    cardAccent: '#e2e8f0',
  },
};

const buildGradientPair = (colors) => [colors[0], colors[1]];

const AnimatedIncomeCard = ({ item, index, accentPalette, onDelete, onEdit }) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const deleteScaleAnim = useRef(new Animated.Value(1)).current;
  const editScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handleDeletePress = () => {
    Animated.sequence([
      Animated.timing(deleteScaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(deleteScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => onDelete?.(item));
  };

  const handleEditPress = () => {
    Animated.sequence([
      Animated.timing(editScaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(editScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => onEdit?.(item));
  };

  const getSourceConfig = (source) => {
    return { gradient: ['#456e62ff', '#0b1f16'], icon: 'attach-money', textColor: 'white' };
  };

  const config = getSourceConfig(item.source);
  const palette = accentPalette;

  return (
    <Animated.View style={[{ transform: [{ translateY }], opacity: opacityAnim }]}>
      <View style={[styles.cardWrapper, { shadowColor: palette.cardShadow }] }>
        <LinearGradient colors={config.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientCard}>
          <TouchableOpacity activeOpacity={0.82} onPress={() => onEdit?.(item)} style={styles.gradientTouchable}>
            <View style={styles.cardContent}>
              <View style={styles.leftSection}>
                <View style={[styles.iconBadge, { backgroundColor: palette.iconBackground(0.18) }]}>
                  <Icon name={config.icon} size={32} color={config.textColor} />
                </View>
                <View style={styles.sourceDetails}>
                  <ThemedText style={[styles.sourceLabel, { color: config.textColor }]}>{item.source}</ThemedText>
                  <View style={styles.dateRow}>
                    <Icon name="event" size={13} color="white" />
                    <Text style={[styles.dateValue, { color: 'white'}]}> {item.date}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.rightSection}>
                <ThemedText style={[styles.amountValue, { color: config.textColor }]}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</ThemedText>
                <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                  <Animated.View style={[{ transform: [{ scale: editScaleAnim }] }]}>
                    <Icon name="edit" size={18} color={config.textColor} />
                  </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                  <Animated.View style={[{ transform: [{ scale: deleteScaleAnim }] }]}>
                    <Icon name="delete" size={18} color="#dc2626" />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  </Animated.View>
  );
};

const IncomeList = () => {
  const route = useRoute();
  const { id, Month, Year } = route.params;
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredIncomeData, setFilteredIncomeData] = useState([]);
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  const accentPalette = theme === 'dark' ? colorProfiles.dark : colorProfiles.light;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getMonthlyIncome = async () => {
    try {
      setLoading(true);
      const data = await getIncomeSources(id, Month, Year);
      if (Array.isArray(data)) {
        setIncomeData(data);
      } else {
        setIncomeData([]);
      }
    } catch (error) {
      console.error('Error fetching income data:', error);
      setIncomeData([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (id && Month && Year) {
        getMonthlyIncome();
      }
    }, [Month, Year, id])
  );

  // Filter income data based on search text
  React.useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredIncomeData(incomeData);
    } else {
      const lowerSearch = searchText.toLowerCase();
      setFilteredIncomeData(incomeData.filter(item =>
        (item.source || '').toLowerCase().includes(lowerSearch) ||
        (item.amount || '').toString().includes(lowerSearch)
      ));
    }
  }, [incomeData, searchText]);

  const totalAmount = filteredIncomeData.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const isDark = theme === 'dark';

  const renderHeader = () => (
    <LinearGradient colors={accentPalette.background} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
      <View style={styles.headerTopRow}>
        <View>
          <ThemedText style={[styles.headerTitle, { color: accentPalette.accent }]}>Income Sources</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: accentPalette.accentSoft }]}>{monthNames[parseInt(Month) - 1]} {Year}</ThemedText>
        </View>
        <Icon name="trending-up" size={40} color={accentPalette.accent} />
      </View>
      <View style={[styles.totalCard, { backgroundColor: accentPalette.iconBackground(0.18) }]}>
        <View>
          <ThemedText style={[styles.totalLabel, { color: accentPalette.accentSoft }]}>Total Income</ThemedText>
          <ThemedText style={[styles.totalAmount, { color: accentPalette.accent }]}>₹{totalAmount.toLocaleString('en-IN')}</ThemedText>
        </View>
      </View>
    </LinearGradient>
  );

  const handleDeleteIncome = (item) => {
    Alert.alert(
      "Delete Income Source",
      "Are you sure you want to delete this income source?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteSource(item.id, id);
              // Refresh the income data after deletion
              await getMonthlyIncome();
              Alert.alert("Success", "Income source deleted successfully");
            } catch (error) {
              console.error("Error deleting income source:", error);
              Alert.alert("Error", "Failed to delete income source");
            } finally {
              setLoading(false);
            }
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  const handleEditIncome = (item) => {
    console.log('Edit income:', item);
  };

  const renderItem = ({ item, index }) => (
    <AnimatedIncomeCard 
      item={item} 
      index={index} 
      accentPalette={accentPalette}
      onDelete={handleDeleteIncome}
      onEdit={handleEditIncome}
    />
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: accentPalette.listBackground }]}>
      <LoaderSpinner shouldLoad={loading} />
      <View style={styles.headerSection}>
        {renderHeader()}
      </View>
      <View style={styles.searchSection}>
        <ThemedTextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search sources or amounts..."
          style={styles.searchInput}
        />
      </View>
      <FlatList
        data={filteredIncomeData}
        keyExtractor={(item, index) => item.source + index}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="trending-up" size={48} color={isDark ? '#666' : '#ccc'} />
            <ThemedText style={styles.emptyText}>No income sources found</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    zIndex: 1,
    paddingHorizontal: 6,
    paddingTop: 12,
    paddingBottom: 16,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  headerGradient: {
    borderRadius: 20,
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  totalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    padding: 16,
    backdropFilter: 'blur(10px)',
  },
  totalLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 6,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  listContainer: {
    padding: 6,
    paddingTop: 8,
  },
  cardWrapper: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  gradientTouchable: {
    flex: 1,
    borderRadius: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sourceDetails: {
    flex: 1,
  },
  sourceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateValue: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  },
  rightSection: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 6,
  },
  deleteButton: {
    padding: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    opacity: 0.6,
  },
});

export default IncomeList;
