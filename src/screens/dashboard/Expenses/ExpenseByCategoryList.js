import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Animated, Easing, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LoaderSpinner from '../../../components/LoaderSpinner';
import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import { getExpenseCosts } from '../../../services/apiService';
import { getExpenseCategoryIcon } from '../../../theme/entityIcons';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);


const AnimatedExpenseCard = ({ item, index }) => {
  const iconName = getExpenseCategoryIcon(item.category);
  const cardTranslateY = useRef(new Animated.Value(12)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 400,
        delay: index * 60,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        delay: index * 60,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
      }, [index, cardOpacity, cardTranslateY]);


  return (
    <Animated.View
      style={{
        transform: [{ translateY: cardTranslateY }],
        opacity: cardOpacity,
      }}
    >
      <ThemedView style={styles.cardContainer}>
        <LinearGradient colors={['#2C3E50', '#34495E']} style={styles.card}>
          <View style={styles.cardContent}>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <View style={styles.iconContainer}>
                <Icon name={iconName} size={32} color="#FFF" />
              </View>
              <View>
                <ThemedText style={styles.category}>{item.category}</ThemedText>
                <ThemedText style={styles.amount}>{item.TotalCost.toLocaleString()}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.percentage}>{item.percentage}%</ThemedText>

          </View>

        </LinearGradient>
      </ThemedView>
    </Animated.View>
  );
};

  const ExpenseByCategoryList = () => {
    const [expenses, setExpenses] = useState([]);

  const [groupedExpenses, setGroupedExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('amount'); // 'amount' or 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const [openYear, setOpenYear] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownScale = useRef(new Animated.Value(0.95)).current;
  const dropdownTranslate = useRef(new Animated.Value(-8)).current;
  const arrowAnimation = useRef(new Animated.Value(0)).current;
  const [Year, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [years] = useState([
    { label: '2024', value: '2024', icon: 'event-available' },
    { label: '2025', value: '2025', icon: 'event-available' },
    { label: '2026', value: '2026', icon: 'event-available' },
    { label: '2027', value: '2027', icon: 'event-available' },
    { label: '2028', value: '2028', icon: 'event-available' },
  ]);
  const headerReveal = useRef(new Animated.Value(0)).current;
  const headerScale = headerReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  const headerOpacity = headerReveal;
  const headerTranslate = headerReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  const getExpensesByYear = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getExpenseCosts();
      if (response?.status) {
        setExpenses(response.data || []);
      } else {
        setError(response?.message || 'Failed to fetch expenses');
      }
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
  }, []);

  useEffect(() => {
    Animated.timing(headerReveal, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
        }).start();
      }, [headerReveal]);


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

  useEffect(() => {
    Animated.timing(arrowAnimation, {
      toValue: openYear ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    if (openYear) {
      Animated.parallel([
        Animated.spring(dropdownScale, {
          toValue: 1,
          bounciness: 6,
          speed: 12,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(dropdownTranslate, {
          toValue: 0,
          bounciness: 6,
          speed: 12,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (showDropdown) {
      Animated.parallel([
        Animated.timing(dropdownScale, {
          toValue: 0.95,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dropdownTranslate, {
          toValue: -8,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setShowDropdown(false);
        }
      });
    }
      }, [openYear, showDropdown, arrowAnimation, dropdownOpacity, dropdownScale, dropdownTranslate]);


  const toggleSort = () => {
    if (sortBy === 'amount') {
      setSortBy('name');
      setSortOrder('asc');
    } else {
      setSortBy('amount');
      setSortOrder('desc');
    }
  };

  const handleToggleDropdown = () => {
    const next = !openYear;
    if (next) {
      setShowDropdown(true);
    }
    setOpenYear(next);
  };

  const handleSelectYear = (value) => {
    setSelectedYear(value);
    setOpenYear(false);
  };

  const arrowRotation = arrowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const renderItem = ({ item, index }) => (
    <AnimatedExpenseCard item={item} index={index} />
  );

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

      <Animated.View
        style={[
          styles.headerCardWrapper,
          {
            opacity: headerOpacity,
            transform: [
              { translateY: headerTranslate },
              { scale: headerScale },
            ],
          },
        ]}
      >
        <AnimatedGradient
          colors={['#0f9b0f', '#06beb6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradientCard}
        >
          <View style={styles.headerTopRow}>
            <View>
              <ThemedText style={styles.headerTitle}>Total Expenses</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Yearly overview</ThemedText>
            </View>
            <View style={styles.headerIconBadge}>
              <Icon name="stacked-line-chart" size={24} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.headerAmountRow}>
            <ThemedText style={styles.headerAmount}>{totalAmount.toLocaleString()}</ThemedText>
            <View style={styles.headerYearChip}>
              <Icon name="event" size={16} color="#1B5E20" />
              <ThemedText style={styles.headerYearLabel}>{Year}</ThemedText>
            </View>
          </View>
        </AnimatedGradient>
      </Animated.View>

      <TouchableOpacity
        style={[
          styles.yearSelectorTrigger,
          openYear && styles.yearSelectorTriggerActive
        ]}
        onPress={handleToggleDropdown}
        activeOpacity={0.85}
      >
        <View style={styles.yearSelectorInner}>
          <Icon name="calendar-month" size={20} color="#2E7D32" />
          <ThemedText style={styles.yearSelectorText}>{Year}</ThemedText>
          <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
            <Icon name="keyboard-arrow-down" size={22} color="#2E7D32" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {showDropdown && (
        <Animated.View
          style={[
            styles.dropdownList,
            {
              opacity: dropdownOpacity,
              transform: [
                { translateY: dropdownTranslate },
                { scale: dropdownScale },
              ],
            },
          ]}
          pointerEvents={openYear ? 'auto' : 'none'}
        >
          {years.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.dropdownItem,
                Year === item.value && styles.dropdownItemSelected
              ]}
              onPress={() => handleSelectYear(item.value)}
            >
              <ThemedText style={[
                styles.dropdownItemText,
                Year === item.value && styles.dropdownItemTextSelected
              ]}>
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      <View style={styles.listHeader}>
        <ThemedText style={styles.sectionTitle}>Expenses By Category</ThemedText>
        <TouchableOpacity onPress={toggleSort} style={styles.sortButton}>
          <Icon name={sortBy === 'amount' ? 'sort' : 'sort-by-alpha'} size={24} color="#666"/>
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
  headerCardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 20,
  },
  headerGradientCard: {
    padding: 24,
    borderRadius: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#E8F5E9',
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#C8E6C9',
    marginTop: 4,
  },
  headerIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAmountRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerAmount: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerYearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerYearLabel: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
  },
  yearSelectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 10 : 4,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.2,
    shadowRadius: Platform.OS === 'ios' ? 12 : 6,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  yearSelectorTriggerActive: {
    backgroundColor: '#E8F5E9',
  },
  yearSelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  yearSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginHorizontal: 8,
  },
  dropdownList: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    overflow: 'hidden',
    paddingVertical: 6,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F8E9',
  },
  dropdownItemSelected: {
    backgroundColor: '#F1F8E9',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#1B5E20',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  amount: {
    fontSize: 12,
    color: '#FFF',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    // paddingHorizontal: 16,
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
    borderWidth:2,
    borderColor:'white',
    borderRadius:50,
    padding:5,
    paddingLeft:10,
    paddingRight:10,
  },
 emptyListContainer: {
    flex: 1,
  },
 
});

export default ExpenseByCategoryList;
