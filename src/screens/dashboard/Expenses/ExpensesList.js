import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LoaderSpinner from '../../../components/LoaderSpinner';
import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import ThemedTextInput from '../../../components/ThemedTextInput';
import { useTheme } from '../../../theme/useTheme';
import { getExpenseCategoryIcon } from '../../../theme/entityIcons';
import { getExpenseCosts } from '../../../services/apiService';

const HEADER_GRADIENT = ['#fb7185', '#e11d48', '#9f1239'];

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
      }, [index, opacityAnim, translateY]);


  const tax = parseFloat(item.taxAmount) || 0;

  return (
    <Animated.View style={[{ transform: [{ translateY }], opacity: opacityAnim }]}>
      <View style={[styles.cardWrapper, { backgroundColor: palette.cardBackground, borderColor: palette.cardBorder, shadowColor: palette.cardShadow }]}>
        <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.cardContent}>
          <View style={styles.leftSection}>
            <View style={[styles.iconBadge, { backgroundColor: palette.iconBackground(0.18) }]}>
              <Icon name={getIconForCategory(item.category)} size={26} color={palette.accent} />
            </View>
            <View style={styles.categoryDetails}>
              <ThemedText style={[styles.categoryLabel, { color: palette.textPrimary }]}>{item.category}</ThemedText>
              {tax > 0 && (
                <ThemedText style={[styles.taxValue, { color: palette.textSecondary }]}>
                  Incl. tax ₹{tax.toLocaleString('en-IN')}
                </ThemedText>
              )}
            </View>
          </View>
          <View style={styles.rightSection}>
            <ThemedText style={[styles.amountValue, { color: palette.textPrimary }]}>
              ₹{parseFloat(item.cost).toLocaleString('en-IN')}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const ExpensesList = () => {
  const route = useRoute();
  const { Month, Year } = route.params;
  const [expensesData, setExpensesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredExpensesData, setFilteredExpensesData] = useState([]);
  const navigation = useNavigation();
  const { palette: themePalettes } = useTheme();
  const palette = themePalettes.list.expense;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Category to icon mapping
  const getExpenses = async () => {
    try {
      setLoading(true);
      const response = await getExpenseCosts();
      setExpensesData(response?.data || []);
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
    }, [])
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
      const taxAmount = parseFloat(curr.taxAmount) || 0;
      if (!acc[category]) {
        acc[category] = {
          ...curr,
          category,
          cost,
          taxAmount: taxAmount,
        };
      } else {
        acc[category].cost += cost;
        acc[category].taxAmount = (acc[category].taxAmount || 0) + taxAmount;
      }
      return acc;
    }, {})
  );

  const totalExpenses = aggregatedExpenses.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  const handleExpenseClick = (item) => {
    navigation.navigate("ItemReport", { category: item.category, Month, Year });
  };

  const renderHeader = () => (
    <LinearGradient colors={HEADER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
      <Icon name="receipt-long" size={130} color="rgba(255,255,255,0.08)" style={styles.headerDecor} />
      <View style={styles.headerTopRow}>
        <View style={styles.headerTextWrap}>
          <View style={styles.monthPill}>
            <Icon name="calendar-month" size={14} color="#fff" />
            <ThemedText style={styles.monthPillText}>{monthNames[parseInt(Month, 10) - 1]} {Year}</ThemedText>
          </View>
        </View>
        <View style={styles.headerAvatar}>
          <Icon name="trending-down" size={24} color="#fff" />
        </View>
      </View>
      <View style={[styles.totalCard, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
        <ThemedText style={styles.totalLabel}>Total Expenses</ThemedText>
        <ThemedText style={styles.totalAmount}>₹{totalExpenses.toLocaleString('en-IN')}</ThemedText>
      </View>
    </LinearGradient>
  );

  const renderItem = ({ item, index }) => (
    <AnimatedExpenseCard
      item={item}
      index={index}
      getIconForCategory={getExpenseCategoryIcon}
      onPress={() => handleExpenseClick(item)}
      palette={palette}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={palette.background} style={StyleSheet.absoluteFillObject} />
      <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <LoaderSpinner shouldLoad={loading} />
        <View style={styles.headerSection}>
          {renderHeader()}
        </View>
        <View style={styles.searchSection}>
          <ThemedTextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search category Name,amount..."
            style={[styles.searchInput, { borderColor: palette.cardBorder, backgroundColor: palette.cardBackground, color: palette.textPrimary }]}
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
              <Icon name="trending-down" size={48} color={palette.emptyIcon} />
              <ThemedText style={[styles.emptyText, { color: palette.textSecondary }]}>No expenses found</ThemedText>
            </View>
          }
        />
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerGradient: {
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute',
    right: -20,
    top: -20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  monthPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 4,
  },
  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  totalCard: {
    marginTop: 18,
    borderRadius: 16,
    padding: 16,
  },
  totalLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginBottom: 6,
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  taxValue: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 3,
  },
  rightSection: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 70,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
});

export default ExpensesList;
