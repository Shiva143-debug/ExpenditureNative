import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Animated, Text, Alert } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedText from '../../components/ThemedText';
import LinearGradient from 'react-native-linear-gradient';
import { Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getIncomeByMonthYear, updateIncome } from "../../services/apiService";
import LoaderSpinner from '../../components/LoaderSpinner';
import ThemedView from '../../components/ThemedView';
import { useTheme } from '../../theme/useTheme';
import ThemedTextInput from '../../components/ThemedTextInput';
import { getIncomeSources, deleteIncome } from '../../services/apiService';
import {LIST_HEADER_GRADIENTS} from '../../theme/palettes';
import {formatDateKey, toDateKey} from '../../utils/format';
import FormDropdown from '../../components/FormDropdown';
import {cancelBackground} from '../../theme/colors';

const HEADER_GRADIENT = LIST_HEADER_GRADIENTS.income;

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
      }, [index, opacityAnim, translateY]);


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

  const formattedDate = formatDateKey(item.date);

  return (
    <Animated.View style={[{ transform: [{ translateY }], opacity: opacityAnim }]}>
      <View style={[styles.cardWrapper, { backgroundColor: accentPalette.cardBackground, borderColor: accentPalette.cardBorder, shadowColor: accentPalette.cardShadow }]}>
        <TouchableOpacity activeOpacity={0.82} onPress={() => onEdit?.(item)} style={styles.cardContent}>
          <View style={styles.leftSection}>
            <View style={[styles.iconBadge, { backgroundColor: accentPalette.iconBackground(0.18) }]}>
              <Icon name="account-balance-wallet" size={26} color={accentPalette.accent} />
            </View>
            <View style={styles.sourceDetails}>
              <ThemedText style={[styles.sourceLabel, { color: accentPalette.textPrimary }]}>{item.sourceName}</ThemedText>
              <View style={styles.dateRow}>
                <Icon name="event" size={13} color={accentPalette.textSecondary} />
                <ThemedText style={[styles.dateValue, { color: accentPalette.textSecondary }]}>{formattedDate}</ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.rightSection}>
            <ThemedText style={[styles.amountValue, { color: accentPalette.textPrimary }]}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</ThemedText>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                <Animated.View style={[{ transform: [{ scale: editScaleAnim }] }]}>
                  <Icon name="edit-note" size={18} color={accentPalette.accent} />
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                <Animated.View style={[{ transform: [{ scale: deleteScaleAnim }] }]}>
                  <Icon name="delete-outline" size={18} color="#dc2626" />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const IncomeList = () => {
  const route = useRoute();
  const { Month, Year } = route.params;
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredIncomeData, setFilteredIncomeData] = useState([]);
  const { palette, isDark } = useTheme();

  const [editVisible, setEditVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceValue, setSourceValue] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sourceData, setSourceData] = useState([]);
  // Re-fetch trigger for the list effect. Nothing toggles it today — the
  // setter was left over from an earlier manual-refresh button.
  const [refreshFlag] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState(new Date());

  const accentPalette = palette.list.income;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (!editVisible) {
      setSourceOpen(false);
    }
  }, [editVisible]);


  const getMonthlyIncome = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getIncomeByMonthYear(Month, Year);
      if (response?.status) {
        setIncomeData(Array.isArray(response.data) ? response.data : []);
      } else {
        setIncomeData([]);
        Alert.alert('Error', response?.message || 'Failed to fetch income data');
      }
    } catch (error) {
      console.error('Error fetching income data:', error);
      setIncomeData([]);
    } finally {
      setLoading(false);
    }
  }, [Month, Year]);

  useFocusEffect(
    React.useCallback(() => {
      if (Month && Year) {
        getMonthlyIncome();
      }
    }, [Month, Year, getMonthlyIncome])
  );

  // Filter income data based on search text
  React.useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredIncomeData(incomeData);
    } else {
      const lowerSearch = searchText.toLowerCase();
      setFilteredIncomeData(incomeData.filter(item =>
        (item.sourceName || '').toLowerCase().includes(lowerSearch) ||
        (item.amount || '').toString().includes(lowerSearch)
      ));
    }
  }, [incomeData, searchText]);

  const totalAmount = filteredIncomeData.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const renderHeader = () => (
    <LinearGradient colors={HEADER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
      <Icon name="account-balance-wallet" size={130} color="rgba(255,255,255,0.08)" style={styles.headerDecor} />
      <View style={styles.headerTopRow}>
        <View style={styles.headerTextWrap}>
          <View style={styles.monthPill}>
            <Icon name="calendar-month" size={14} color="#fff" />
            <ThemedText style={styles.monthPillText}>{monthNames[parseInt(Month, 10) - 1]} {Year}</ThemedText>
          </View>
        </View>
        <View style={styles.headerAvatar}>
          <Icon name="trending-up" size={24} color="#fff" />
        </View>
      </View>
      <View style={[styles.totalCard, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
        <ThemedText style={styles.totalLabel}>Total Income</ThemedText>
        <ThemedText style={styles.totalAmount}>₹{totalAmount.toLocaleString('en-IN')}</ThemedText>
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
              const response = await deleteIncome(item.id);
              if (response?.status) {
                await getMonthlyIncome();
                Alert.alert("Success", response.message || "Income source deleted successfully");
              } else {
                Alert.alert("Error", response?.message || "Failed to delete income source");
              }
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
    setSelectedItem(item);

    setSourceValue(item.sourceId);

    setEditAmount(item.amount.toString());
    setEditDate(new Date(item.date));

    setEditVisible(true);
  };


  const handleUpdateIncome = async () => {
    if (!sourceValue || !editAmount) {
      Alert.alert("Validation", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await updateIncome(selectedItem.id, {
        sourceId: sourceValue,
        amount: editAmount,
        date: toDateKey(editDate),
      });

      if (response?.status) {
        setEditVisible(false);
        await getMonthlyIncome();
        Alert.alert("Success", response.message || "Income source updated successfully");
      } else {
        Alert.alert("Error", response?.message || "Failed to update income source");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update income source");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await getIncomeSources();
        if (response?.status) {
          const data = response.data;
          if (data) {
            const transformedData = data.map(item => ({
              label: item.sourceName,
              value: item.id,
              key: item.id.toString()
            }));
            setSourceData(transformedData);
          }
        } else {
          Alert.alert('Error', response?.message || 'Failed to fetch sources');
        }

      } catch (error) {
        console.error('Error fetching sources:', error);
        Alert.alert('Error', 'Failed to fetch sources');
      }
    };

    fetchSources();
  }, [refreshFlag]);

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
    <View style={{ flex: 1 }}>
      <LinearGradient colors={accentPalette.background} style={StyleSheet.absoluteFillObject} />
      <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <LoaderSpinner shouldLoad={loading} />
        <View style={styles.headerSection}>
          {renderHeader()}
        </View>
        <View style={styles.searchSection}>
          <ThemedTextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search source Name,amount..."
            style={[styles.searchInput, { borderColor: accentPalette.cardBorder, backgroundColor: accentPalette.cardBackground, color: accentPalette.textPrimary }]}
          />
        </View>
        <FlatList
          data={filteredIncomeData}
          keyExtractor={(item, index) => item.id?.toString() || item.source + index}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="trending-up" size={48} color={accentPalette.emptyIcon} />
              <ThemedText style={[styles.emptyText, { color: accentPalette.textSecondary }]}>No Income Sources Found</ThemedText>
            </View>
          }
        />

      <Modal
        transparent
        animationType="fade"
        visible={editVisible}
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: accentPalette.dialogBackground }
          ]}>

            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: accentPalette.textPrimary }]}>Edit Income Source</ThemedText>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Icon name="close" size={24} color={accentPalette.textPrimary} />
              </TouchableOpacity>
            </View>

            <ThemedText style={[styles.inputLabel, { color: accentPalette.textPrimary }]}>Source Name</ThemedText>

            <FormDropdown
              open={sourceOpen} onOpenChange={setSourceOpen}
              value={sourceValue} onChange={setSourceValue}
              items={sourceData} setItems={setSourceData}
              placeholder="Select Source"
              palette={accentPalette} variant="dialog"
            />


            {showDatePicker && (
              <DateTimePicker
                value={editDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setEditDate(selectedDate);
                  }
                }}
              />
            )}


            <ThemedText style={[styles.inputLabel, { color: accentPalette.textPrimary }]}>Amount</ThemedText>
            <ThemedTextInput
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="numeric"
              style={[styles.input, { borderColor: accentPalette.cardBorder, backgroundColor: accentPalette.pickerBackground, color: accentPalette.textPrimary }]}
            />

            <ThemedText style={[styles.inputLabel, { color: accentPalette.textPrimary }]}>Date</ThemedText>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: accentPalette.cardBorder }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateButtonText, { color: accentPalette.textPrimary }]}>
                {formatDateKey(editDate)}
              </Text>
            </TouchableOpacity>


            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: cancelBackground(isDark) }]}
                onPress={() => setEditVisible(false)}
              >
                <Text style={[styles.buttonText, { color: accentPalette.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.addButton, { backgroundColor: accentPalette.accent }]}
                onPress={handleUpdateIncome}
              >
                <Text style={styles.addButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  sourceDetails: {
    flex: 1,
  },
  sourceLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  rightSection: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 16,
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
    paddingVertical: 70,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 22,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  picker: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    marginBottom: 15,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 600,
  },
  dropdownText: {
    fontSize: 15,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 13,
    borderRadius: 12,
    flex: 1,
  },
  cancelButton: {
    marginRight: 10,
    alignItems: 'center',
  },
  addButton: {
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  dateButton: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  dateButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default IncomeList;
