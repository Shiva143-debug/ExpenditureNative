import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';

import LoaderSpinner from '../../LoaderSpinner';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import LinearGradient from 'react-native-linear-gradient';

const ExpensesList = () => {
  const route = useRoute();
  const { id, Month, Year } = route.params;
  const [expensesData, setExpensesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

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
      const response = await fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${id}`);
      const data = await response.json();
      setExpensesData(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpensesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getExpenses();
  }, [id]);

  const filteredExpenses = expensesData.filter(
    (d) => d.month.toString() === Month && d.year.toString() === Year
  );

  const groupedData = filteredExpenses.reduce((acc, curr) => {
    const { category, cost } = curr;
    acc[category] = (acc[category] || 0) + parseFloat(cost);
    return acc;
  }, {});

  const groupedArray = Object.keys(groupedData).map((key) => ({
    category: key,
    TotalCost: groupedData[key],
  }));

  const totalExpenses = groupedArray.reduce((acc, curr) => acc + curr.TotalCost, 0);

  const handleCategoryClick = (category) => {
    navigation.navigate("ItemReport", { category, Month, Year });
  };

  const renderHeader = () => (
    <ThemedView style={styles.headerContainer}>
      <LinearGradient colors={['#FF6B6B', '#EE5253']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View>
            <ThemedText style={styles.headerTitle}>Expenses List</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{monthNames[parseInt(Month) - 1]} {Year}</ThemedText>
          </View>
          <View style={styles.headerAmount}>
            <ThemedText style={styles.totalLabel}>Total Expenses</ThemedText>
            <ThemedText style={styles.totalAmount}>₹{totalExpenses.toLocaleString()}</ThemedText>
          </View>
        </View>
      </LinearGradient>
    </ThemedView>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleCategoryClick(item.category)}>
      <LinearGradient colors={['#2C3E50', '#34495E']} style={styles.cardGradient}>
        <View style={styles.cardContent}>
          <View style={styles.leftContent}>
            <View style={styles.categoryIcon}>
              <Icon name={getIconForCategory(item.category)} size={24} color="#FFF" />
            </View>
            <View style={styles.categoryInfo}>
              <ThemedText style={styles.cardTitle}>{item.category}</ThemedText>
              <ThemedText style={styles.cardAmount}>₹{item.TotalCost.toLocaleString()}</ThemedText>
            </View>
          </View>
          <Icon name="arrow-forward-ios" size={20} color="#FFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <LoaderSpinner shouldLoad={loading} />
      <View style={styles.headerSection}>
        {renderHeader()}
      </View>
      <View style={styles.listSection}>
        <FlatList data={groupedArray} keyExtractor={(item) => item.category} renderItem={renderItem}
          contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={true} indicatorStyle="white"/>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 5,
    zIndex: 1,
    height: 80,
  },
  listSection: {
    flex: 1,
    zIndex: 0,
  },
  headerContainer: {
    width: '100%',
  },
  headerGradient: {
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  headerAmount: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    marginTop: 15,
  },
  card: {
    marginBottom: 5,
    borderRadius: 12,
  },
  cardGradient: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.9,
  },
});

export default ExpensesList;
