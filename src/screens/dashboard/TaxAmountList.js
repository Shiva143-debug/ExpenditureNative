import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, StyleSheet, Animated, Text } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LoaderSpinner from '../../components/LoaderSpinner';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedView from '../../components/ThemedView';
import { useTheme } from '../../theme/useTheme';
import { getCategoryIcon } from '../../theme/entityIcons';
import { getExpenseCosts } from '../../services/apiService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) { return '—'; }
  return parsed.toLocaleDateString('en-GB').replace(/\//g, '-');
};

const AnimatedTaxCard = ({ item, index, palette }) => {
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
  const cost = parseFloat(item.cost) || 0;
  const tax = parseFloat(item.taxAmount) || 0;

  return (
    <Animated.View style={[{ transform: [{ translateY }], opacity: opacityAnim }]}>
      <View style={[styles.cardWrapper, { backgroundColor: palette.cardBackground, borderColor: palette.cardBorder }]}>
        <View style={styles.cardTopRow}>
          <View style={[styles.iconBadge, { backgroundColor: `${palette.cardAccent}22` }]}>
            <Icon name={getCategoryIcon(item.category)} size={28} color={palette.cardAccent} />
          </View>
          <View style={styles.details}>
            <ThemedText style={[styles.itemName, { color: palette.textPrimary }]} numberOfLines={1}>
              {item.expenseName || 'Expense'}
            </ThemedText>
            <View style={styles.dateRow}>
              <Icon name="event" size={13} color={palette.textSecondary} />
              <Text style={[styles.dateValue, { color: palette.textSecondary }]}>{formatDate(item.pDate)}</Text>
            </View>
          </View>
          <View style={[styles.taxBadge, { backgroundColor: `${palette.accent}1F` }]}>
            <ThemedText style={[styles.taxBadgeLabel, { color: palette.accent }]}>TAX</ThemedText>
            <ThemedText style={[styles.taxBadgeText, { color: palette.accent }]}>
              ₹{tax.toLocaleString('en-IN')}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.metaRow, { borderTopColor: palette.cardBorder }]}>
          <View style={styles.metaBlock}>
            <ThemedText style={[styles.metaLabel, { color: palette.textSecondary }]}>Category</ThemedText>
            <ThemedText style={[styles.metaValue, { color: palette.textPrimary }]} numberOfLines={1}>
              {item.category || 'Uncategorized'}
            </ThemedText>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaBlockRight}>
            <ThemedText style={[styles.metaLabel, { color: palette.textSecondary }]}>Base Cost</ThemedText>
            <ThemedText style={[styles.metaValue, { color: palette.textPrimary }]}>
              ₹{cost.toLocaleString('en-IN')}
            </ThemedText>
          </View>
        </View>

        {item.description ? (
          <View style={[styles.noteDivider, { borderTopColor: palette.cardBorder }]}>
            <ThemedText style={[styles.description, { color: palette.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
};

const TaxAmountList = () => {
  const route = useRoute();
  const { Month, Year } = route?.params || {};
  const { isDark, palette: themePalettes } = useTheme();
  const palette = themePalettes.screen('tax');

  const [expensesWithTax, setExpensesWithTax] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getExpenseCosts();
      const rows = Array.isArray(response?.data) ? response.data : [];
      setExpensesWithTax(
        rows.filter((item) =>
          (parseFloat(item.taxAmount) || 0) > 0 &&
          (Month == null || item?.month?.toString() === String(Month)) &&
          (Year == null || item?.year?.toString() === String(Year))
        )
      );
    } catch (error) {
      console.error('Error fetching tax details:', error);
      setExpensesWithTax([]);
    } finally {
      setLoading(false);
    }
  }, [Month, Year]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    if (searchText === '') {
      setDebouncedSearch('');
      return;
    }
    const timeout = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  const filteredData = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) { return expensesWithTax; }
    return expensesWithTax.filter((item) =>
      (item.category || '').toLowerCase().includes(query) ||
      (item.expenseName || '').toLowerCase().includes(query) ||
      (item.description || '').toLowerCase().includes(query)
    );
  }, [expensesWithTax, debouncedSearch]);

  const totalTaxAmount = useMemo(
    () => filteredData.reduce((sum, item) => sum + (parseFloat(item.taxAmount) || 0), 0),
    [filteredData]
  );

  const periodLabel = Month && Year
    ? `${MONTH_NAMES[parseInt(Month, 10) - 1] || ''} ${Year}`.trim()
    : 'All periods';

  const renderHeader = () => (
    <LinearGradient
      colors={isDark ? ['#312e81', '#1e1b4b'] : ['#6366f1', '#4338ca']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <Icon name="receipt-long" size={130} color="rgba(255,255,255,0.08)" style={styles.headerDecor} />
      <View style={styles.headerTopRow}>
        <View style={styles.headerTextWrap}>
          <View style={styles.periodPill}>
            <Icon name="calendar-month" size={14} color="#fff" />
            <ThemedText style={styles.periodPillText}>{periodLabel}</ThemedText>
          </View>
        </View>
        <View style={styles.headerAvatar}>
          <Icon name="account-balance-wallet" size={24} color="#fff" />
        </View>
      </View>
      <View style={[styles.totalCard, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
        <ThemedText style={styles.totalLabel}>Total Tax Paid</ThemedText>
        <ThemedText style={styles.totalAmount}>₹{totalTaxAmount.toLocaleString('en-IN')}</ThemedText>
        <ThemedText style={styles.totalSub}>
          {filteredData.length} {filteredData.length === 1 ? 'entry' : 'entries'}
        </ThemedText>
      </View>
    </LinearGradient>
  );

  const renderItem = ({ item, index }) => (
    <AnimatedTaxCard item={item} index={index} palette={palette} />
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <LoaderSpinner shouldLoad={loading} />
        <View style={styles.headerSection}>
          {renderHeader()}
        </View>
        <View style={styles.searchSection}>
          <ThemedTextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search category, expense or note..."
            style={[styles.searchInput, { borderColor: palette.cardBorder, backgroundColor: palette.surface, color: palette.textPrimary }]}
          />
        </View>
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => (item.id != null ? item.id.toString() : index.toString())}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="receipt-long" size={48} color={palette.emptyIcon} />
              <ThemedText style={[styles.emptyText, { color: palette.textSecondary }]}>
                {debouncedSearch ? 'No matching tax entries' : 'No tax details found'}
              </ThemedText>
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
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  periodPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 4,
  },
  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#ffffff',
  },
  totalSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 4,
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
    padding: 16,

  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  details: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  taxBadge: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  taxBadgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  taxBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
  },
  metaBlock: {
    flex: 1,
  },
  metaBlockRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metaDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    marginHorizontal: 12,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 3,
  },
  noteDivider: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 12,
  },
  description: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
});

export default TaxAmountList;
