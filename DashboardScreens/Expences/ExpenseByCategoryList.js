import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Dimensions, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from '../../AuthContext';
import LoaderSpinner from '../../LoaderSpinner';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getExpenseCosts } from "../../services/apiService"

const ExpenseByCategoryList = () => {
  const { id } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [expenses, setExpenses] = useState([]);
  const [groupedExpenses, setGroupedExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('amount'); // 'amount' or 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const [openYear, setOpenYear] = useState(false);
  const [Year, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [years, setYears] = useState([
    { label: '2024', value: '2024', icon: 'event-available' },
    { label: '2025', value: '2025', icon: 'event-available' },
    { label: '2026', value: '2026', icon: 'event-available' },
  ]);

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

    // Keep existing categories...
    'Food': 'restaurant',
    'food': 'restaurant',
    'Food and Dining': 'restaurant',
    'Restaurant': 'restaurant-menu',
    'Groceries': 'local-grocery-store',
    'grocery': 'local-grocery-store',

    'Transportation': 'directions-car',
    'transport': 'directions-car',
    'Car': 'directions-car',
    'Fuel': 'local-gas-station',
    'Bus': 'directions-bus',
    'Train': 'train',
    'Taxi': 'local-taxi',

    'Shopping': 'shopping-cart',
    'Clothing': 'checkroom',
    'Fashion': 'checkroom',
    'Electronics': 'devices',
    'Accessories': 'watch',

    'Entertainment': 'movie',
    'Movies': 'movie',
    'Games': 'sports-esports',
    'Sports': 'sports-basketball',
    'Music': 'music-note',

    'Healthcare': 'local-hospital',
    'Medical': 'medical-services',
    'Medicine': 'medication',
    'Doctor': 'healing',
    'Health': 'favorite',

    'Education': 'school',
    'Books': 'menu-book',
    'Tuition': 'cast-for-education',
    'Courses': 'class',
    'Training': 'psychology',

    'Bills': 'receipt',
    'Utilities': 'power',
    'Electricity': 'bolt',
    'Water': 'water-drop',
    'Internet': 'wifi',
    'Phone': 'phone',
    'Mobile': 'smartphone',

    'Housing': 'home',
    'Rent': 'house',
    'Maintenance': 'build',
    'Furniture': 'chair',
    'Appliances': 'kitchen',

    'Travel': 'flight',
    'Hotel': 'hotel',
    'Vacation': 'beach-access',
    'Tourism': 'tour',

    'Insurance': 'security',
    'Investment': 'trending-up',
    'Savings': 'savings',
    'Banking': 'account-balance',

    'Personal Care': 'face',
    'Fitness': 'fitness-center',
    'Beauty': 'spa',

    'Gifts': 'card-giftcard',
    'Donations': 'volunteer-activism',
    'Charity': 'favorite-border',

    'Business': 'business-center',
    'Office': 'business',
    'Stationery': 'edit',

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

    // Special cases for common variations
    if (normalizedCategory.includes('recharge') || normalizedCategory.includes('mobile')) {
      return 'smartphone';
    }
    if (normalizedCategory.includes('cut') || normalizedCategory.includes('salon')) {
      return 'content-cut';
    }
    if (normalizedCategory.includes('bike') || normalizedCategory.includes('vehicle')) {
      return 'two-wheeler';
    }

    // Return default icon if no match found
    return categoryIcons.default;
  };

  const getExpensesByYear = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenseCosts(id);
      setExpenses(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getExpensesByYear().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    getExpensesByYear();
  }, [year]);

  useEffect(() => {
    const filteredTotalCostData = expenses.filter(
      (d) => d.year.toString() === Year
    );

    // Group expenses by category
    const grouped = filteredTotalCostData.reduce((acc, curr) => {
      const { category, cost } = curr;
      acc[category] = (acc[category] || 0) + parseFloat(cost);
      return acc;
    }, {});

    let groupedArray = Object.keys(grouped).map((key) => ({
      category: key,
      TotalCost: grouped[key],
      percentage: 0, // Will be calculated below
    }));

    const total = groupedArray.reduce((sum, item) => sum + item.TotalCost, 0);

    // Calculate percentages
    groupedArray = groupedArray.map(item => ({
      ...item,
      percentage: total > 0 ? ((item.TotalCost / total) * 100).toFixed(1) : 0
    }));

    // Sort the array
    groupedArray.sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'desc' ? b.TotalCost - a.TotalCost : a.TotalCost - b.TotalCost;
      } else {
        return sortOrder === 'desc'
          ? b.category.localeCompare(a.category)
          : a.category.localeCompare(b.category);
      }
    });

    setGroupedExpenses(groupedArray);
    setTotalAmount(total);
  }, [Year, expenses, sortBy, sortOrder]);

  const toggleSort = () => {
    if (sortBy === 'amount') {
      setSortBy('name');
      setSortOrder('asc');
    } else {
      setSortBy('amount');
      setSortOrder('desc');
    }
  };

  const renderItem = ({ item }) => {
    const iconName = getIconForCategory(item.category);

    return (
      <ThemedView style={styles.cardContainer}>
        <LinearGradient colors={['#2C3E50', '#34495E']} style={styles.card}>
          <View style={styles.cardContent}>


            <View style={{ display: "flex", flexDirection: "row" }}>
              <View style={styles.iconContainer}>
                <Icon name={iconName} size={32} color="#FFF" />
              </View>
              <View>
                <ThemedText style={styles.category}>{item.category}</ThemedText>
                <ThemedText style={styles.amount}>₹{item.TotalCost.toLocaleString()}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.percentage}>{item.percentage}%</ThemedText>

          </View>

        </LinearGradient>
      </ThemedView>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="receipt-long" size={64} color="#ccc" />
      <ThemedText style={styles.emptyStateText}>No expenses found for {Year}</ThemedText>
      <ThemedText style={styles.emptyStateSubText}>Start adding expenses to see them here</ThemedText>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Icon name="error-outline" size={64} color="#f44336" />
      <ThemedText style={styles.errorText}>{error}</ThemedText>
      <TouchableOpacity style={styles.retryButton} onPress={getExpensesByYear}>
        <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <LoaderSpinner shouldLoad={loading} />

      <TouchableOpacity
        style={[
          styles.headerContainer,
          { marginBottom: openYear ? 0 : 16 }
        ]}
        onPress={() => setOpenYear(!openYear)}
      >
        <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.headerGradient}>
          <View style={styles.balanceContainer}>
            <ThemedText style={styles.balanceLabel}>
              Total Expenses in {Year}
            </ThemedText>
            <ThemedText style={styles.balanceAmount}>
              ₹{totalAmount.toLocaleString()}
            </ThemedText>
            <Icon
              name={openYear ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color="#FFF"
              style={styles.dropdownIcon}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {openYear && (
        <View style={styles.dropdownList}>
          {years.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.dropdownItem,
                Year === item.value && styles.dropdownItemSelected
              ]}
              onPress={() => {
                setSelectedYear(item.value);
                setOpenYear(false);
              }}
            >
              <ThemedText style={[
                styles.dropdownItemText,
                Year === item.value && styles.dropdownItemTextSelected
              ]}>
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.listHeader}>
        <ThemedText style={styles.sectionTitle}>Expenses By Category</ThemedText>
        <TouchableOpacity onPress={toggleSort} style={styles.sortButton}>
          <Icon
            name={sortBy === 'amount' ? 'sort' : 'sort-by-alpha'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {error ? (
        renderError()
      ) : (
        <FlatList
          data={groupedExpenses}
          keyExtractor={(item) => item.category}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContainer,
            groupedExpenses.length === 0 && styles.emptyListContainer
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerGradient: {
    padding: 20,
  },
  balanceContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  balanceLabel: {
    fontSize: 18,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  dropdownIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  dropdownList: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
  },
  dropdownItemTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  cardContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    color: '#FFF',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sortButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'end',
  },
  percentage: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
  },
  emptyListContainer: {
    flex: 1,
  },
});

export default ExpenseByCategoryList;
