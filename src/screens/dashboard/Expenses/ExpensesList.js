import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Animated, Text } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LoaderSpinner from '../../../components/LoaderSpinner';
import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import ThemedTextInput from '../../../components/ThemedTextInput';
import { ThemeContext } from '../../../context/ThemeContext';
import { getExpenseCosts } from '../../../services/apiService';

const expensePalette = {
  light: {
    header:['#c95151ff', '#ee1515ff'],
    accent: '#eb1818ff',
    accentSoft: '#df1a55ff',
    surface: 'white',
    cardShadow: '#e0d9d955',
    iconGlow: 'rgba(226, 19, 30, 0.35)',
    emptyIcon: '#475569',
    cardGradient: ['#e73c4bff', '#900e0eff'],
    cardAccent: '#e2e8f0',
  },
  dark: {
    header: ['#0f172a', '#ee1515ff'],
    accent: '#eb1818ff',
    accentSoft: '#df1a55ff',
    surface: '#531421ff',
    cardShadow: '#e0d9d955',
    iconGlow: 'rgba(226, 19, 30, 0.35)',
    emptyIcon: '#475569',
    cardGradient: ['#0f172a', '#e71b25ff'],
    cardAccent: '#e2e8f0',
  },
}

const AnimatedExpenseCard = ({ item, index, getIconForCategory, onPress, palette }) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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



  return (
    <Animated.View style={[{ transform: [{ translateY }], opacity: opacityAnim }]}>    
          <LinearGradient colors={palette.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.cardWrapper, { shadowColor: palette.cardShadow }]}> 
            <TouchableOpacity activeOpacity={0.82} onPress={onPress}>
              <View style={styles.cardContent}>
                <View style={styles.leftSection}>
                  <View style={[styles.iconBadge, { backgroundColor: `${palette.cardAccent}22` }]}>
                    <Icon name={getIconForCategory(item.category)} size={32} color={palette.cardAccent} />
                  </View>
                  <View style={styles.savingDetails}>
                    <ThemedText style={[styles.categoryLabel]}>{item.category}</ThemedText>
                  </View>
                </View>
                <View style={styles.rightSection}>
                  <ThemedText style={[styles.amountValue, { color: palette.cardAccent }]}>
                    ₹{parseFloat(item.cost).toLocaleString('en-IN')}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
  );
};

const ExpensesList = () => {
  const route = useRoute();
  const { id, Month, Year } = route.params;
  const [expensesData, setExpensesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredExpensesData, setFilteredExpensesData] = useState([]);
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const palette = theme === 'dark' ? expensePalette.dark : expensePalette.light;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Category to icon mapping
  const categoryIcons = {
    // Mobile & Recharge related
    'Recharge': 'smartphone',
    'Mobile Recharge': 'smartphone',
    'Phone Recharge': 'phone-android',
    'Data Recharge': 'signal-cellular-alt',
    'DTH': 'tv',
    
    // Cutting & Salon related
    'Cutting': 'content-cut',
    'Hair Cut': 'content-cut',
    'Salon': 'content-cut',
    'Haircut': 'content-cut',
    'Barber': 'content-cut',
    
    // Vehicle related
    'Vehicle': 'two-wheeler',
    'Bike': 'two-wheeler',
    'Motorcycle': 'two-wheeler',
    'Scooter': 'two-wheeler',
    'Bicycle': 'pedal-bike',
    'Car Service': 'directions-car',
    'Vehicle Service': 'build',
    'Vehicle Repair': 'build',
    'Petrol': 'local-gas-station',
    'Diesel': 'local-gas-station',
    
    // Food and Groceries
    'Food': 'restaurant',
    'food': 'restaurant',
    'Food and Dining': 'restaurant',
    'Restaurant': 'restaurant-menu',
    'Groceries': 'local-grocery-store',
    'grocery': 'local-grocery-store',
    
    // Transportation
    'Transportation': 'directions-car',
    'transport': 'directions-car',
    'Car': 'directions-car',
    'Fuel': 'local-gas-station',
    'Bus': 'directions-bus',
    'Train': 'train',
    'Taxi': 'local-taxi',
    
    // Shopping
    'Shopping': 'shopping-cart',
    'Clothing': 'checkroom',
    'Fashion': 'checkroom',
    'Electronics': 'devices',
    'Accessories': 'watch',
    
    // Entertainment
    'Entertainment': 'movie',
    'Movies': 'movie',
    'Games': 'sports-esports',
    'Sports': 'sports-basketball',
    'Music': 'music-note',
    
    // Healthcare
    'Healthcare': 'local-hospital',
    'Medical': 'medical-services',
    'Medicine': 'medication',
    'Doctor': 'healing',
    'Health': 'favorite',
    
    // Education
    'Education': 'school',
    'Books': 'menu-book',
    'Tuition': 'cast-for-education',
    'Courses': 'class',
    'Training': 'psychology',
    
    // Bills and Utilities
    'Bills': 'receipt',
    'Utilities': 'power',
    'Electricity': 'bolt',
    'Water': 'water-drop',
    'Internet': 'wifi',
    'Phone': 'phone',
    'Mobile': 'smartphone',
    
    // Housing
    'Housing': 'home',
    'Rent': 'house',
    'Maintenance': 'build',
    'Furniture': 'chair',
    'Appliances': 'kitchen',
    
    // Travel
    'Travel': 'flight',
    'Hotel': 'hotel',
    'Vacation': 'beach-access',
    'Tourism': 'tour',
    
    // Financial
    'Insurance': 'security',
    'Investment': 'trending-up',
    'Savings': 'savings',
    'Banking': 'account-balance',
    
    // Personal Care
    'Personal Care': 'face',
    'Fitness': 'fitness-center',
    'Beauty': 'spa',
    
    // Gifts and Donations
    'Gifts': 'card-giftcard',
    'Donations': 'volunteer-activism',
    'Charity': 'favorite-border',
    
    // Business
    'Business': 'business-center',
    'Office': 'business',
    'Stationery': 'edit',
    
    // Pets
    'Pets': 'pets',
    'Pet Food': 'pets',
    'Veterinary': 'healing',
    
    // Default icon for unknown categories
    'default': 'payments'
  };

  const getIconForCategory = (category) => {
    if (!category) return categoryIcons.default;
    
    // Convert category to lowercase for case-insensitive matching
    const normalizedCategory = category.toLowerCase();
    
    // First try exact match
    if (categoryIcons[category]) {
      return categoryIcons[category];
    }
    
    // Then try case-insensitive match
    const exactMatch = Object.keys(categoryIcons).find(
      key => key.toLowerCase() === normalizedCategory
    );
    if (exactMatch) {
      return categoryIcons[exactMatch];
    }
    
    // Try to find partial matches
    const partialMatch = Object.keys(categoryIcons).find(
      key => normalizedCategory.includes(key.toLowerCase()) || 
             key.toLowerCase().includes(normalizedCategory)
    );
    if (partialMatch) {
      return categoryIcons[partialMatch];
    }
    
    // Return default icon if no match found
    return categoryIcons.default;
  };

  const getExpenses = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getExpenseCosts(id);
      setExpensesData(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpensesData([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getExpenses();
    }, [id])
  );

  const monthlyExpenses = useMemo(() =>
    expensesData.filter(
      (d) => d.month.toString() === Month && d.year.toString() === Year
    ), [expensesData, Month, Year]);

  // Filter by search text
  React.useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredExpensesData(monthlyExpenses);
    } else {
      const lowerSearch = searchText.toLowerCase();
      setFilteredExpensesData(monthlyExpenses.filter(item =>
        (item.category || '').toLowerCase().includes(lowerSearch) ||
        (item.cost || '').toString().includes(lowerSearch)
      ));
    }
  }, [monthlyExpenses, searchText]);

  const filteredExpenses = filteredExpensesData;

  const aggregatedExpenses = Object.values(
    filteredExpenses.reduce((acc, curr) => {
      const category = curr.category || 'Uncategorized';
      const cost = parseFloat(curr.cost) || 0;
      const taxAmount = parseFloat(curr.tax_amount) || 0;
      if (!acc[category]) {
        acc[category] = {
          ...curr,
          category,
          cost,
          tax_amount: taxAmount,
        };
      } else {
        acc[category].cost += cost;
        acc[category].tax_amount = (acc[category].tax_amount || 0) + taxAmount;
      }
      return acc;
    }, {})
  );

  const totalExpenses = aggregatedExpenses.reduce((acc, curr) => acc + (curr.cost || 0), 0);
  const isDark = theme === 'dark';

  const handleExpenseClick = (item) => {
    navigation.navigate("ItemReport", { category: item.category, Month, Year });
  };



  const renderHeader = () => (
    <LinearGradient colors={palette.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
      <View style={styles.headerTopRow}>
        <View>
          <ThemedText style={[styles.headerTitle, { color: palette.cardAccent }]}>Expense Details</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: palette.cardAccent }]}>{monthNames[parseInt(Month) - 1]} {Year}</ThemedText>
        </View>
        <Icon name="trending-down" size={40} color={palette.cardAccent} />
      </View>
      <View style={[styles.totalCard] }>
        <View>
          <ThemedText style={[styles.totalLabel, { color: palette.cardAccent }]}>Total Expenses</ThemedText>
          <ThemedText style={[styles.totalAmount, { color: palette.cardAccent }]}>₹{totalExpenses.toLocaleString('en-IN')}</ThemedText>
        </View>
      </View>
    </LinearGradient>
  );

  const renderItem = ({ item, index }) => (
    <AnimatedExpenseCard
      item={item}
      index={index}
      getIconForCategory={getIconForCategory}
      onPress={() => handleExpenseClick(item)}
      palette={palette}
    />
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.surface }]}>
      <LoaderSpinner shouldLoad={loading} />
      <View style={styles.headerSection}>
        {renderHeader()}
      </View>
      <View style={styles.searchSection}>
        <ThemedTextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search category Name,amount..."
          style={styles.searchInput}
        />
      </View>
      <FlatList 
        data={aggregatedExpenses}
        keyExtractor={(item, index) => item.category?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="trending-down" size={48} color={isDark ? '#666' : '#ccc'} />
            <ThemedText style={styles.emptyText}>No expenses found</ThemedText>
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
  gradientTouchable: {
    flex: 1,
    borderRadius: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
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
  categoryDetails: {
    flex: 1,
  },
  categoryLabel: {
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
    marginBottom: 6,
  },
  taxValue: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },

  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
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

export default ExpensesList;
