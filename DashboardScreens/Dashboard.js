import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import LoaderSpinner from '../LoaderSpinner';
import LinearGradient from 'react-native-linear-gradient';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { getExpenseCosts, getIncomeSources, getSavingsDataByMonthYear, getCategories, getDefaultSources } from '../services/apiService';
import SplashScreen from '../SplashScreen';

const withAlpha = (hex, alpha) => {
  if (!hex || typeof hex !== 'string') { return hex; }
  const normalized = hex.trim();
  if (!normalized.startsWith('#')) { return normalized; }
  if (normalized.length === 9) { return normalized; }
  if (normalized.length !== 7) { return normalized; }
  const alphaHex = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${normalized}${alphaHex}`;
};

const baseSummaryGradients = [
  ['#f97316', '#fb7185'],
  ['#22d3ee', '#0284c7'],
  ['#34d399', '#059669'],
  ['#a855f7', '#6366f1'],
];

const AnimatedStatCard = ({ gradient, bgGradient, icon, label, value, onPress, delay, labelColor = '#ffffff', valueColor = '#ffffff', iconGlow = 'rgba(255, 255, 255, 0.28)' }) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.02,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    });
  }, [delay, scaleAnim]);

  return (
    <Animated.View
      style={[styles.statCard,
      {
        transform: [{ translateY }, { scale: scaleAnim }],
        opacity: opacityAnim,
      },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ flex: 1 }}>
        <LinearGradient colors={bgGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBackground}>
          <View style={styles.cardContent}>
            <View style={styles.iconBadgeContainer}>
              <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.iconBadge, { shadowColor: iconGlow }]}>
                <Icon name={icon} size={24} color="#fff" />
              </LinearGradient>
              <Text style={[styles.cardLabel, { color: labelColor }]}>{label}</Text>
            </View>

            <View style={styles.textContent}>
              <Text style={[styles.cardValue, { color: valueColor }]} numberOfLines={2}>{value}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Dashboard = () => {
  const { id, setInitialDataLoaded, initialDataLoaded } = useAuth();
  const { theme } = useContext(ThemeContext);
  const initialLoadDone = useRef(false);
  const [openMonth, setOpenMonth] = useState(false);
  const [Month, setSelectedMonth] = useState((new Date().getMonth() +1 ).toString());
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [loading, setLoading] = useState(false);
  const [months, setMonths] = useState([
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ]);

  const [openYear, setOpenYear] = useState(false);
  const [Year, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [years, setYears] = useState([
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' },
    { label: '2026', value: '2026' },
  ]);

  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [savings, setSavings] = useState([]);
  const [taxAmount, setTaxAmount] = useState(0);
  const navigation = useNavigation();

  // Function to fetch expense data
  const getExpenses = async () => {
    try {
      const data = await getExpenseCosts(id);
      return data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  };

  // Function to fetch income data
  const getIncome = async () => {
    try {
      const data = await getIncomeSources(id, Month, Year);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching income:', error);
      return [];
    }
  };

  // Function to calculate tax amount
  const calculateTaxAmount = (expenses) => {
    return expenses.reduce((acc, curr) => {
      const taxAmount = parseFloat(curr.tax_amount) || 0;
      return acc + taxAmount;
    }, 0);
  };

  // Replace the existing useEffect with useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      const loadDashboardData = async () => {
        setLoading(true);
        try {
          // Fetch all data in parallel
          const [expenseResult, incomeResult] = await Promise.all([
            getExpenses(),
            getIncome(),
            fetchSavingsData(),
            setShowDropdowns(false),
          ]);

          // Store all expense data
          setExpenseData(expenseResult);

          // Filter expenses for current month and year
          const filteredExpenses = expenseResult.filter(
            (expense) => expense.month.toString() === Month &&
              expense.year.toString() === Year
          );

          // Update states
          setIncomeData(incomeResult);
          setTaxAmount(calculateTaxAmount(filteredExpenses));

          // Mark initial load as done
          if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            setInitialDataLoaded(true);
          }

        } catch (error) {
          console.error('Error loading dashboard data:', error);
          // Mark initial load as done even on error to allow user to see the dashboard
          if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            setInitialDataLoaded(true);
          }
        } finally {
          setLoading(false);
        }
      };

      loadDashboardData();
    }, [id, Month, Year, setInitialDataLoaded])
  );

  // useEffect(()=>{
  //     fetchSavingsData();
  //     console.log("fetching savings data");
  // },[id,Month, Year])

  const fetchSavingsData = async () => {
    setLoading(true);
    const data = await getSavingsDataByMonthYear(id, Month, Year);
    console.log('monthwisedata', data);
    setSavings(data || []);
    setLoading(false);
  };
  const filteredExpenses = useMemo(
    () =>
      expenseData.filter(
        (expense) =>
          expense?.month?.toString() === Month && expense?.year?.toString() === Year
      ),
    [expenseData, Month, Year]
  );
  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + (parseFloat(curr.cost) || 0), 0);
  const totalIncome = incomeData.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const handleMonthSelect = (value) => {
    setSelectedMonth(value);
    if (Year) {
      setShowDropdowns(false);
    }
  };

  const handleYearSelect = (value) => {
    setSelectedYear(value);
    if (Month) {
      setShowDropdowns(false);
    }
  };

  const handlePressExpence = () => {
    navigation.navigate('ExpensesList', { id, Month, Year });
  };

  const handlePressIncome = () => {
    navigation.navigate('IncomeList', { id, Month, Year });
  };

  const handlePressBalance = () => {
    navigation.navigate('BalanceList');
  };

  const handlePressSavings = () => {
    navigation.navigate('SavingsList');
  };

  const handlePressCategories = () => {
    navigation.navigate('CategoriesScreen', { id });
  };

  const handlePressProducts = () => {
    navigation.navigate('ProductsScreen', { id });
  };

  const handlePressSources = () => {
    navigation.navigate('SourcesScreen', { id });
  };

  const handlePressTax = () => {
    const expensesWithTax = expenseData.filter((item) => parseFloat(item.tax_amount) > 0);
    if (expensesWithTax.length > 0) {
      navigation.navigate('TaxAmountList', { expensesWithTax });
    }
  };

  const handlePressExpenceByCat = () => {
    navigation.navigate('ExpenseByCategoryList');
  };

  const totalSavings = savings.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const balance = totalIncome - (totalExpenses + totalSavings);

  const isDark = theme === 'dark';
  const palette = useMemo(
    () =>
      isDark
        ? {
          headerAccent: '#38bdf8',
          searchBackground: 'rgba(148, 163, 184, 0.16)',
          cardBorder: 'rgba(148, 163, 184, 0.16)',
          textPrimary: '#e2e8f0',
          textSecondary: '#94a3b8',
          summaryGradients: baseSummaryGradients,
          summaryText: '#f8fafc',
        }
        : {
          headerAccent: '#1d4ed8',
          searchBackground: 'rgba(255, 255, 255, 0.95)',
          cardBorder: 'rgba(15, 23, 42, 0.08)',
          textPrimary: '#0f172a',
          textSecondary: '#475569',
          summaryGradients: baseSummaryGradients,
          summaryText: '#f8fafc',
        },
    [isDark]
  );

  const summaryMetrics = useMemo(() => {
    const totalCost = filteredExpenses.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
    const totalTax = filteredExpenses.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
    const count = filteredExpenses.length;
    const uniqueCategories = new Set(filteredExpenses.map((item) => item.category || 'Uncategorized')).size;
    const average = count ? totalCost / count : 0;
    return { totalCost, totalTax, count, uniqueCategories, average };
  }, [filteredExpenses]);

  const summaryCards = useMemo(
    () => [
      {
        label: 'Balance',
        value: `₹${Math.round(balance).toLocaleString('en-IN')}`,
        description: `Remaining Balance`,
        icon: 'insights',
        gradient: palette.summaryGradients[1],
      },
      {
        label: 'Tax Paid',
        value: `₹${summaryMetrics.totalTax.toLocaleString('en-IN')}`,
        description: 'Including applied taxes',
        icon: 'receipt-long',
        gradient: palette.summaryGradients[3],
      },
      {
        label: 'Categories',
        value: `${summaryMetrics.uniqueCategories}`,
        description: 'Unique spending areas',
        icon: 'view-module',
        gradient: palette.summaryGradients[2],
      },

    ],
    [summaryMetrics, palette]
  );

  const statCardConfigs = useMemo(() => {
    const combos = palette.summaryGradients;
    const backgroundGradients = combos.map((colors) => [
      withAlpha(colors[0], 0.65),
      withAlpha(colors[1], 0.55),
    ]);
    const iconGradients = combos.map((colors) => [
      withAlpha(colors[0], 0.95),
      withAlpha(colors[1], 0.85),
    ]);
    const summaryColor = palette.summaryText;
    return [
      {
        key: 'income',
        gradient: iconGradients[2],
        bgGradient: backgroundGradients[2],
        icon: 'trending-up',
        label: 'Income',
        value: `₹${totalIncome.toLocaleString('en-IN')}`,
        onPress: handlePressIncome,
        delay: 100,
        labelColor: summaryColor,
        valueColor: summaryColor,
        iconGlow: withAlpha(combos[1][1], 0.35),
      },
      {
        key: 'expenses',
        gradient: iconGradients[0],
        bgGradient: backgroundGradients[0],
        icon: 'trending-down',
        label: 'Expenses',
        value: `₹${totalExpenses.toLocaleString('en-IN')}`,
        onPress: handlePressExpence,
        delay: 200,
        labelColor: summaryColor,
        valueColor: summaryColor,
        iconGlow: withAlpha(combos[0][1], 0.35),
      },
      {
        key: 'savings',
        gradient: iconGradients[1],
        bgGradient: backgroundGradients[1],
        icon: 'savings',
        label: 'Savings',
        value: `₹${totalSavings.toLocaleString('en-IN')}`,
        onPress: handlePressSavings,
        delay: 300,
        labelColor: summaryColor,
        valueColor: summaryColor,
        iconGlow: withAlpha(combos[2][1], 0.35),
      },

    ];
  }, [isDark, palette.summaryGradients, palette.summaryText, totalIncome, totalExpenses, totalSavings, handlePressIncome, handlePressExpence, handlePressSavings, handlePressCategories, handlePressProducts, handlePressSources]);

  const summaryAnimations = useRef(summaryCards.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    summaryAnimations.forEach((anim) => anim.setValue(0));
    Animated.stagger(
      120,
      summaryAnimations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [summaryAnimations, summaryMetrics, theme]);

  const headerGradient = isDark
    ? ['#252525ff', '#67696bff']
    : ['#667eea', '#764ba2'];

  const renderSummarySection = () => (
    <View style={styles.summaryGrid}>
      {summaryCards.map((card, index) => {
        const animation = summaryAnimations[index];
        const animatedStyle = {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.96, 1],
              }),
            },
          ],
        };

        return (
          <Animated.View key={card.label} style={[styles.summaryCardWrapper, animatedStyle]}>
            <LinearGradient colors={card.gradient} style={styles.summaryCard}>
              <View style={styles.summaryCardContent}>
                <View style={{ display: 'flex', flexDirection: "row", }}>
                  <View style={{ marginRight: 2 }}>
                    <Icon name={card.icon} size={20} color={palette.summaryText} />
                  </View>
                  <ThemedText style={[styles.summaryLabel, { color: palette.summaryText }]}>
                    {card.label}
                  </ThemedText>
                </View>
                <View style={styles.summaryTextGroup}>

                  <ThemedText style={[styles.summaryValue, { color: palette.summaryText }]}>
                    {card.value}
                  </ThemedText>
                  <ThemedText style={[styles.summaryDescription, { color: palette.summaryText }]}>
                    {card.description}
                  </ThemedText>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        );
      })}
    </View>
  );

  const renderInsightsHeader = () => (
    <ThemedView
      style={[
        styles.reportHeader,
        { borderColor: palette.cardBorder, backgroundColor: palette.searchBackground },
      ]}
    >
      <View style={styles.reportHeaderRow}>
        <View>
          <ThemedText style={[styles.reportTitle, { color: palette.textPrimary }]}>Monthly Insights</ThemedText>
          <ThemedText style={[styles.reportSubtitle, { color: palette.textSecondary }]}>
            {summaryMetrics.count} transactions · {summaryMetrics.uniqueCategories} categories
          </ThemedText>
        </View>
        <View style={[styles.reportHeaderIcon, { backgroundColor: `${palette.headerAccent}33` }]}>
          <Icon name="leaderboard" size={24} color={palette.headerAccent} />
        </View>
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.mainContainer}>
      {!initialDataLoaded && (
        <Modal visible={true} transparent={false} animationType="none">
          <SplashScreen />
        </Modal>
      )}
      <ScrollView style={[styles.scrollView, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]} showsVerticalScrollIndicator={false}>
        <LoaderSpinner shouldLoad={loading && initialDataLoaded} />

        {/* Header Section */}
        <LinearGradient colors={headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerSection}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText style={styles.greeting}>Financial Dashboard</ThemedText>
              <ThemedText style={styles.subGreeting}>Manage your finances effortlessly</ThemedText>
            </View>
            <Icon name="account-balance-wallet" size={40} color="#FFF" />
          </View>

          {!showDropdowns ? (
            <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDropdowns(true)}>
              <Icon name="calendar-today" size={20} color="#FFF" />
              <ThemedText style={styles.dateText}>
                {months.find((m) => m.value === Month)?.label} {Year}
              </ThemedText>
              <Icon name="expand-more" size={20} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.dropdownsContainer}>
              <View style={styles.dropdownBox}>
                <DropDownPicker open={openMonth} value={Month} items={months} setValue={handleMonthSelect} setItems={setMonths}
                  placeholder="Month" style={styles.picker} dropDownContainerStyle={styles.dropdownList}
                  listMode="SCROLLVIEW" setOpen={(isOpen) => {
                    setOpenMonth(isOpen);
                    if (isOpen) { setOpenYear(false); }
                  }}
                />
              </View>
              <View style={styles.dropdownBox}>
                <DropDownPicker open={openYear} value={Year} items={years} setValue={handleYearSelect} setItems={setYears} placeholder="Year" style={styles.picker} dropDownContainerStyle={styles.dropdownList}
                  listMode="SCROLLVIEW" setOpen={(isOpen) => {
                    setOpenYear(isOpen);
                    if (isOpen) { setOpenMonth(false); }
                  }}
                />
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Main Stats Section */}
        <View style={styles.statsContainer}>
          {statCardConfigs.map(({ key, ...cardProps }) => (
            <AnimatedStatCard key={key} {...cardProps} />
          ))}
        </View>

        <View style={styles.summarySectionContainer}>
          {renderInsightsHeader()}
          {renderSummarySection()}
        </View>


        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: isDark ? '#2d2d2d' : '#fff' }]} onPress={handlePressExpenceByCat}>
              <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.actionIconBg}>
                <Icon name="pie-chart" size={24} color="#fff" />
              </LinearGradient>
              <ThemedText style={styles.actionCardText}>Expenses by Category</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: isDark ? '#2d2d2d' : '#fff' }]} onPress={handlePressBalance}>
              <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.actionIconBg}>
                <Icon name="assessment" size={24} color="#fff" />
              </LinearGradient>
              <ThemedText style={styles.actionCardText}>Balance Details</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Management Section */}
        <View style={styles.quickActionsContainer}>
          <ThemedText style={styles.sectionTitle}>Management</ThemedText>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: isDark ? '#2d2d2d' : '#fff' }]} onPress={handlePressCategories}>
              <LinearGradient colors={[withAlpha('#a855f7', 0.95), withAlpha('#6366f1', 0.85)]} style={styles.actionIconBg}>
                <Icon name="category" size={24} color="#fff" />
              </LinearGradient>
              <ThemedText style={styles.actionCardText}>Categories</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: isDark ? '#2d2d2d' : '#fff' }]} onPress={handlePressProducts}>
              <LinearGradient colors={[withAlpha('#f97316', 0.95), withAlpha('#fb7185', 0.85)]} style={styles.actionIconBg}>
                <Icon name="shopping-bag" size={24} color="#fff" />
              </LinearGradient>
              <ThemedText style={styles.actionCardText}>Sub Categories</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: isDark ? '#2d2d2d' : '#fff' }]} onPress={handlePressSources}>
              <LinearGradient colors={[withAlpha('#34d399', 0.95), withAlpha('#059669', 0.85)]} style={styles.actionIconBg}>
                <Icon name="account-balance" size={24} color="#fff" />
              </LinearGradient>
              <ThemedText style={styles.actionCardText}>Sources</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  dateText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  dropdownsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownBox: {
    flex: 1,
    zIndex: 1000,
  },
  picker: {
    borderWidth: 0,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  dropdownList: {
    borderWidth: 0,
    borderRadius: 10,
    maxHeight: 600,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 18,
    gap: 12,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '31%',
    maxWidth: '32%',
    minWidth: 110,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardBackground: {
    flex: 1,
    borderRadius: 20,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'flex-start',
  },
  iconBadgeContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 12,
    display: 'flex',
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  badgeDecoration: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    opacity: 0.6,
  },
  textContent: {
    width: '100%',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 18,
  },
  cardFooter: {
    alignSelf: 'flex-end',
  },
  arrowBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCardsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 14,
    flexDirection: 'row',
  },
  infoCard: {
    flex: 1,
    borderRadius: 14,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  infoCardValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoCardSubtext: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '500',
  },
  viewButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionCardText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  summarySectionContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    // justifyContent: 'space-between',
  },
  summaryCardWrapper: {
    width: '34%',
    marginBottom: 1,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 18,
    margin: 5
  },
  summaryCardContent: {
    flexDirection: 'column',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 14,
  },
  summaryTextGroup: {},
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryDescription: {
    fontSize: 11,
    marginTop: 6,
    opacity: 0.85,
  },
  reportHeader: {
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  reportHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  reportSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  reportHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});

export default Dashboard;
