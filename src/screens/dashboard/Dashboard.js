import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import LinearGradient from 'react-native-linear-gradient';
import ThemedText from '../../components/ThemedText';
import LoaderSpinner from '../../components/LoaderSpinner';
import ThemedView from '../../components/ThemedView';
import SplashScreen from '../auth/SplashScreen';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/useTheme';
import { getDashboardPalette } from '../../theme/palettes';
import { getStats } from '../../services/apiService';

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
      }, [delay, scaleAnim, opacityAnim, translateY]);


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

const EMPTY_STATS = {
  income: 0,
  expenses: 0,
  savings: 0,
  tax: 0,
  count: 0,
  uniqueCategories: 0,
};

// Postgres numeric columns arrive as strings, so coerce defensively.
const toNumber = (value) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const Dashboard = () => {
  const { setInitialDataLoaded, initialDataLoaded, getDisplayName } = useAuth();
  const displayName = getDisplayName() || 'there';
  const { theme } = useTheme();
  const initialLoadDone = useRef(false);
  const [openMonth, setOpenMonth] = useState(false);
  const [Month, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
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
    { label: '2027', value: '2027' },
    { label: '2028', value: '2028' },
  ]);

  const [stats, setStats] = useState(EMPTY_STATS);
  const [loadError, setLoadError] = useState('');
  const navigation = useNavigation();

  // Single aggregated request for the whole dashboard summary
  const getDashboardStats = async (month, year) => {
    try {
      const response = await getStats(month, year);
      if (!response?.status || !response?.data) {
        setStats(EMPTY_STATS);
        setLoadError(response?.message || 'Failed to load dashboard data');
        return;
      }
      const data = response.data;
      setStats({
        income: toNumber(data.incomeAmount),
        expenses: toNumber(data.expenseAmount),
        savings: toNumber(data.savingsAmount),
        tax: toNumber(data.taxAmount),
        count: toNumber(data.expenseCount),
        uniqueCategories: toNumber(data.categoryCount),
      });
      setLoadError('');
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(EMPTY_STATS);
      setLoadError('Failed to load dashboard data');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;

      const loadDashboardData = async () => {
        setLoading(true);
        try {
          await getDashboardStats(Month, Year);
          if (!cancelled) { setShowDropdowns(false); }

          if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            setInitialDataLoaded(true);
          }
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            setInitialDataLoaded(true);
          }
        } finally {
          if (!cancelled) { setLoading(false); }
        }
      };

      loadDashboardData();

      return () => { cancelled = true; };
    }, [Month, Year, setInitialDataLoaded])
  );

  const {
    income: totalIncome,
    expenses: totalExpenses,
    savings: totalSavings,
    tax: totalTax,
  } = stats;

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

  const handlePressExpence = useCallback(() => {
    navigation.navigate('ExpensesList', { Month, Year });
  }, [navigation, Month, Year]);

  const handlePressIncome = useCallback(() => {
    navigation.navigate('IncomeList', { Month, Year });
  }, [navigation, Month, Year]);

  const handlePressExpenceByCat = () => {
    navigation.navigate('ExpenseByCategoryList');
  };

  const handlePressBalance = () => {
    navigation.navigate('BalanceList');
  };

  const handlePressSavings = useCallback(() => {
    navigation.navigate('SavingsList');
  }, [navigation]);

  const handlePressCategories = () => {
    navigation.navigate('CategoriesScreen');
  };

  const handlePressProducts = () => {
    navigation.navigate('ProductsScreen');
  };

  const handlePressSources = () => {
    navigation.navigate('SourcesScreen');
  };

  const handlePressTax = useCallback(() => {
    if (totalTax <= 0) {
      Alert.alert('No Tax Details', 'No tax has been recorded for the selected month and year.');
      return;
    }
    navigation.navigate('TaxAmountList', { Month, Year });
  }, [totalTax, Month, Year, navigation]);



  const balance = totalIncome - (totalExpenses + totalSavings);

  const isDark = theme === 'dark';
  const palette = getDashboardPalette(theme);

  const summaryMetrics = useMemo(
    () => ({
      totalTax,
      count: stats.count,
      uniqueCategories: stats.uniqueCategories,
    }),
    [totalTax, stats.count, stats.uniqueCategories]
  );

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
        onPress: handlePressTax,
      },
      // {
      //   label: 'Categories',
      //   value: `${summaryMetrics.uniqueCategories}`,
      //   description: 'Unique spending areas',
      //   icon: 'view-module',
      //   gradient: palette.summaryGradients[2],
      // },

    ],
    [summaryMetrics, palette, balance, handlePressTax]
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
  }, [palette.summaryGradients, palette.summaryText, totalIncome, totalExpenses, totalSavings, handlePressIncome, handlePressExpence, handlePressSavings]);

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
    : ['#6366f1', '#8b5cf6'];

  const backgroundGradient = isDark
    ? ['#1a1a1a', '#1a1a1a']
    : ['#eef2ff', '#f5f3ff', '#ecfeff'];

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
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={card.onPress}
              disabled={!card.onPress}
              style={styles.summaryCardTouchable}
            >
              <LinearGradient colors={card.gradient} style={styles.summaryCard}>
                <View style={styles.summaryCardContent}>
                  <View style={styles.summaryHeaderRow}>
                    <View style={styles.summaryIconMargin}>
                      <Icon name={card.icon} size={20} color={palette.summaryText} />
                    </View>
                    <ThemedText style={[styles.summaryLabel, { color: palette.summaryText }]}>
                      {card.label}
                    </ThemedText>
                    {card.onPress ? (
                      <Icon name="chevron-right" size={20} color={palette.summaryText} style={styles.summaryChevron} />
                    ) : null}
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
            </TouchableOpacity>
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
    <View style={{ flex: 1 }}>
      <LinearGradient colors={backgroundGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <ThemedView style={[styles.mainContainer, { backgroundColor: 'transparent' }]}>
        {!initialDataLoaded && (
          <Modal visible={true} transparent={false} animationType="none">
            <SplashScreen />
          </Modal>
        )}
        <ScrollView style={[styles.scrollView, { backgroundColor: 'transparent' }]} showsVerticalScrollIndicator={false}>
          <LoaderSpinner shouldLoad={loading && initialDataLoaded} />

          {/* Header Section */}
          <LinearGradient colors={headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerSection}>
            <View style={styles.headerGreetingRow}>
              <View style={styles.headerGreetingText}>
                <ThemedText style={[styles.headerGreeting, { color: '#fff' }]}>
                  Hello, {displayName} 👋
                </ThemedText>
                <ThemedText style={[styles.headerSubGreeting, { color: 'rgba(255,255,255,0.82)' }]}>
                  Here's your finance overview
                </ThemedText>
              </View>
              <LinearGradient colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.12)']} style={styles.headerAvatarMini}>
                <Icon name="account-circle" size={26} color="#fff" />
              </LinearGradient>
            </View>

            {!showDropdowns ? (
              <TouchableOpacity style={styles.datePill} activeOpacity={0.85} onPress={() => setShowDropdowns(true)}>
                <Icon name="calendar-today" size={18} color="#fff" />
                <ThemedText style={styles.datePillText}>
                  {months.find((m) => m.value === Month)?.label} {Year}
                </ThemedText>
                <Icon name="unfold-more" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <View style={styles.dropdownsGlass}>
                <View style={styles.dropdownBox}>
                  <DropDownPicker open={openMonth} value={Month} items={months} setValue={handleMonthSelect} setItems={setMonths}
                    placeholder="Month"
                    style={[styles.picker, { borderColor: palette.cardBorder, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff' }]}
                    dropDownContainerStyle={[styles.dropdownList, { borderColor: palette.cardBorder, backgroundColor: isDark ? 'rgba(15,23,42,0.98)' : '#ffffff' }]}
                    textStyle={[styles.dropdownText, { color: palette.textPrimary }]}
                    listMode="SCROLLVIEW"
                    setOpen={(isOpen) => {
                      setOpenMonth(isOpen);
                      if (isOpen) { setOpenYear(false); }
                    }}
                    theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
                  />
                </View>
                <View style={styles.dropdownBox}>
                  <DropDownPicker open={openYear} value={Year} items={years} setValue={handleYearSelect} setItems={setYears} placeholder="Year"
                    style={[styles.picker, { borderColor: palette.cardBorder, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff' }]}
                    dropDownContainerStyle={[styles.dropdownList, { borderColor: palette.cardBorder, backgroundColor: isDark ? 'rgba(15,23,42,0.98)' : '#ffffff' }]}
                    textStyle={[styles.dropdownText, { color: palette.textPrimary }]}
                    listMode="SCROLLVIEW"
                    setOpen={(isOpen) => {
                      setOpenYear(isOpen);
                      if (isOpen) { setOpenMonth(false); }
                    }}
                    theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
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

          {loadError ? (
            <View style={styles.errorBanner}>
              <Icon name="cloud-off" size={18} color="#dc2626" />
              <ThemedText style={styles.errorBannerText}>{loadError}</ThemedText>
            </View>
          ) : null}


          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            {/* <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText> */}
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={[styles.quickActionCard, isDark ? { backgroundColor: '#2d2d2d' } : { backgroundColor: palette.quickActionBg, borderColor: palette.quickActionBorder, borderWidth: 1 }]} onPress={handlePressExpenceByCat}>
                <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.actionIconBg}>
                  <Icon name="pie-chart" size={24} color="#fff" />
                </LinearGradient>
                <ThemedText style={styles.actionCardText}>Expenses by Category</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickActionCard, isDark ? { backgroundColor: '#2d2d2d' } : { backgroundColor: palette.quickActionBg, borderColor: palette.quickActionBorder, borderWidth: 1 }]} onPress={handlePressBalance}>
                <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.actionIconBg}>
                  <Icon name="assessment" size={24} color="#fff" />
                </LinearGradient>
                <ThemedText style={styles.actionCardText}>Balance Details</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Management Section */}
          <View style={styles.quickActionsContainer}>
            {/* <ThemedText style={styles.sectionTitle}>Management</ThemedText> */}
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={[styles.quickActionCard, isDark ? { backgroundColor: '#2d2d2d' } : { backgroundColor: palette.quickActionBg, borderColor: palette.quickActionBorder, borderWidth: 1 }]} onPress={handlePressCategories}>
                <LinearGradient colors={[withAlpha('#a855f7', 0.95), withAlpha('#6366f1', 0.85)]} style={styles.actionIconBg}>
                  <Icon name="category" size={24} color="#fff" />
                </LinearGradient>
                <ThemedText style={styles.actionCardText}>Categories</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickActionCard, isDark ? { backgroundColor: '#2d2d2d' } : { backgroundColor: palette.quickActionBg, borderColor: palette.quickActionBorder, borderWidth: 1 }]} onPress={handlePressProducts}>
                <LinearGradient colors={[withAlpha('#f97316', 0.95), withAlpha('#fb7185', 0.85)]} style={styles.actionIconBg}>
                  <Icon name="shopping-bag" size={24} color="#fff" />
                </LinearGradient>
                <ThemedText style={styles.actionCardText}>Expense ITEMS</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickActionCard, isDark ? { backgroundColor: '#2d2d2d' } : { backgroundColor: palette.quickActionBg, borderColor: palette.quickActionBorder, borderWidth: 1 }]} onPress={handlePressSources}>
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
    </View>
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
    paddingTop: 22,
    paddingBottom: 26,
  },
  headerGreetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerGreetingText: {
    flexShrink: 1,
    marginRight: 12,
  },
  headerGreeting: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubGreeting: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
  },
  headerAvatarMini: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 10,
  },
  datePillText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  dropdownsGlass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 16,
    padding: 12,
  },
  dropdownBox: {
    flex: 1,
    zIndex: 1000,
  },
  picker: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 600,
  },
  dropdownText: {
    fontSize: 15,
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
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.06,
    // shadowRadius: 3,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.35)',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#dc2626',
  },
  summaryGrid: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    // justifyContent: 'space-between',
  },
  summaryCardWrapper: {
    width: '48%',
    marginBottom: 1,
  },
  summaryCardTouchable: {
    flex: 1,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconMargin: {
    marginRight: 2,
  },
  summaryChevron: {
    marginLeft: 'auto',
    opacity: 0.85,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 18,
    margin: 5,
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
