import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LoaderSpinner from '../../components/LoaderSpinner';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { useTheme } from '../../theme/useTheme';
import { getTotalIncomeData, getExpenseCosts, getSavingsData } from '../../services/apiService';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const AnimatedCard = ({ children, index, style }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      tension: 20,
      friction: 7,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
      }, [index, animatedValue]);


  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

const INCOME_COLOR = '#16a34a';
const EXPENSE_COLOR = '#dc2626';
const SAVINGS_COLOR = '#2563eb';

const BalanceList = () => {
  const [totalIncomeData, setTotalIncome] = useState([]);
  const [totalCostData, setExpenseCost] = useState([]);
  const [totalSavingsData, setTotalSavings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { palette: themePalettes } = useTheme();
  const palette = themePalettes.screen('balance');

  const getIncomeData = async () => {
    try {
      const response = await getTotalIncomeData();
      setTotalIncome(response?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const getExpenseData = async () => {
    try {
      const response = await getExpenseCosts();
      setExpenseCost(response?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const getTotalSavingsData = async () => {
    setLoading(true);
    const response = await getSavingsData();
    setTotalSavings(response?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([getIncomeData(), getExpenseData(), getTotalSavingsData()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const years = [...new Set(totalIncomeData.map(item => item.year))];
  const groupedArray = [];

  years.forEach(year => {
    for (let i = 1; i <= 12; i++) {
      const income = totalIncomeData
        .filter(item => String(item.month) === String(i) && String(item.year) === String(year))
        .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

      const expenses = totalCostData
        .filter(item => String(item.month) === String(i) && String(item.year) === String(year))
        .reduce((acc, curr) => acc + parseFloat(curr.cost), 0);

      const savings = totalSavingsData
        .filter(item => String(item.month) === String(i) && String(item.year) === String(year))
        .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

      const balance = income - (expenses + savings);

      if (income > 0 || expenses > 0 || savings > 0) {
        groupedArray.push({
          year,
          month: monthNames[i - 1],
          income,
          expenses,
          savings,
          balance,
        });
      }
    }
  });

  groupedArray.sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return monthNames.indexOf(b.month) - monthNames.indexOf(a.month);
  });

  // `groupedArray` holds numbers already, so these are summed directly —
  // parseInt() here used to silently truncate the paise off every total.
  const totalIncome = groupedArray.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = groupedArray.reduce((sum, item) => sum + item.expenses, 0);
  const totalSavings = totalSavingsData.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const totalBalance = totalIncome - (totalExpenses + totalSavings);
  const isPositiveBalance = totalBalance >= 0;
  const barTotal = totalIncome + totalExpenses + totalSavings;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mainGradient}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.totalBalanceLabel}>Total Net Balance</ThemedText>
            <ThemedText style={[
              styles.totalBalanceAmount,
              { color: isPositiveBalance ? '#66BB6A' : '#EF5350' }
            ]}>
              ₹{totalBalance.toLocaleString()}
            </ThemedText>
          </View>
          <Icon name="account-balance-wallet" size={28} color="rgba(255,255,255,0.7)" />
        </View>

        <View style={styles.totalsRow}>
          <View style={styles.totalCol}>
            <ThemedText style={[styles.totalColLabel, { color: INCOME_COLOR }]}>Earnings</ThemedText>
            <ThemedText style={styles.totalColValue}>₹{totalIncome.toLocaleString()}</ThemedText>
          </View>
          <View style={[styles.totalCol, styles.totalColDivider]}>
            <ThemedText style={[styles.totalColLabel, { color: EXPENSE_COLOR }]}>Expenses</ThemedText>
            <ThemedText style={styles.totalColValue}>₹{totalExpenses.toLocaleString()}</ThemedText>
          </View>
          <View style={[styles.totalCol, styles.totalColDivider]}>
            <ThemedText style={[styles.totalColLabel, { color: SAVINGS_COLOR }]}>Savings</ThemedText>
            <ThemedText style={styles.totalColValue}>₹{totalSavings.toLocaleString()}</ThemedText>
          </View>
        </View>

        <View style={styles.segmentBar}>
          {barTotal > 0 && [
            <View key="in" style={{ flex: totalIncome, backgroundColor: INCOME_COLOR }} />,
            <View key="ex" style={{ flex: totalExpenses, backgroundColor: EXPENSE_COLOR }} />,
            <View key="sv" style={{ flex: totalSavings, backgroundColor: SAVINGS_COLOR }} />,
          ]}
        </View>
      </LinearGradient>
    </View>
  );

  const renderBalanceCard = ({ item, index }) => {
    const isPositive = item.balance >= 0;
    const balanceColor = isPositive ? INCOME_COLOR : EXPENSE_COLOR;
    const monthAbbr = item.month.substring(0, 3).toUpperCase();

    const stats = [
      { label: 'Earnings', value: item.income, color: INCOME_COLOR },
      { label: 'Expenses', value: item.expenses, color: EXPENSE_COLOR },
      { label: 'Savings', value: item.savings || 0, color: SAVINGS_COLOR },
    ];

    return (
      <AnimatedCard index={index} style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: palette.cardBackground, borderColor: palette.cardBorder }]}>
          <LinearGradient
            colors={['#2C5364', '#203A43']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.monthTile}
          >
            <ThemedText style={styles.monthTileText}>{monthAbbr}</ThemedText>
          </LinearGradient>

          <View style={styles.cardBody}>
            <View style={styles.cardTopRow}>
              <ThemedText style={[styles.cardMonth, { color: palette.textPrimary }]}>{item.month}</ThemedText>
              <ThemedText style={[styles.cardYear, { color: palette.textSecondary }]}>{item.year}</ThemedText>
            </View>
            <View style={styles.miniStats}>
              {stats.map((s) => (
                <View key={s.label} style={styles.miniStat}>
                  <ThemedText style={[styles.miniStatLabel, { color: s.color }]}>{s.label}</ThemedText>
                  <ThemedText style={[styles.miniStatValue, { color: palette.textPrimary }]}>
                    ₹{Number(s.value).toLocaleString()}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.netPill, { backgroundColor: isPositive ? '#dcfce7' : '#fee2e2' }]}>
            <Icon
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={13}
              color={balanceColor}
            />
            <ThemedText style={[styles.netPillText, { color: balanceColor }]}>
              {isPositive ? '+' : '-'}₹{Math.abs(item.balance).toLocaleString()}
            </ThemedText>
          </View>
        </View>
      </AnimatedCard>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.background }]}>
      <LoaderSpinner shouldLoad={loading} />
      <View style={styles.content}>
        {renderHeader()}
        <FlatList
          data={groupedArray}
          keyExtractor={(item) => `${item.month}-${item.year}`}
          renderItem={renderBalanceCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  // Header
  headerContainer: {
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  mainGradient: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  totalBalanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    fontWeight: '600',
  },
  totalBalanceAmount: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  totalsRow: {
    flexDirection: 'row',
    marginTop: 18,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  totalCol: {
    flex: 1,
    alignItems: 'center',
  },
  totalColDivider: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.15)',
  },
  totalColLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  totalColValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  segmentBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  // Cards
  cardContainer: {
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.07,
    // shadowRadius: 12,
    // elevation: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthTile: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  monthTileText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBody: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  cardMonth: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 6,
  },
  cardYear: {
    fontSize: 13,
    fontWeight: '500',
  },
  miniStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniStat: {
    flex: 1,
    flexDirection: 'column',
  },
  miniStatLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  miniStatValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  netPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  netPillText: {
    fontSize: 12.5,
    fontWeight: '800',
    marginLeft: 3,
  },
  listContainer: {
    paddingBottom: 16,
  },
});

export default BalanceList;
