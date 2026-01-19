import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Animated, Text, Alert } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedText from '../../components/ThemedText';
import LinearGradient from 'react-native-linear-gradient';
import { Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getIncomeByMonthYear, updateIncome } from "../../services/apiService";
import DropDownPicker from 'react-native-dropdown-picker';
import LoaderSpinner from '../../components/LoaderSpinner';
import ThemedView from '../../components/ThemedView';
import { ThemeContext } from '../../context/ThemeContext';
import ThemedTextInput from '../../components/ThemedTextInput';
import { getIncomeSources, deleteIncome } from '../../services/apiService';


const colorProfiles = {
  light: {
    background: ['#dcfce7', '#bbf7d0'],
    accent: '#15803d',
    accentSoft: '#4a7c59',
    cardShadow: '#00000022',
    iconBackground: alpha => `rgba(21, 128, 61, ${alpha})`,
    listBackground: '#f1fff6',
    emptyIcon: '#9ca3af',
    cardAccent: '#0f172a',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    pickerBackground: '#f5f7fb',
  },
  dark: {
    background: ['#0f3a2d', '#0b1f16'],
    accent: '#34d399',
    accentSoft: '#5eead4',
    cardShadow: '#00000044',
    iconBackground: alpha => `rgba(52, 211, 153, ${alpha})`,
    listBackground: '#0b1913',
    emptyIcon: '#4b5563',
    cardAccent: '#e2e8f0',
    cardBorder: 'rgba(148, 163, 184, 0.16)',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    pickerBackground: '#0f172a',
  },
};

const buildGradientPair = (colors) => [colors[0], colors[1]];

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
  }, [index]);

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

  const getSourceConfig = (source) => {
    return { gradient: ['#456e62ff', '#0b1f16'], icon: 'attach-money', textColor: 'white' };
  };

  const config = getSourceConfig(item.source);
  const palette = accentPalette;

  return (
    <Animated.View style={[{ transform: [{ translateY }], opacity: opacityAnim }]}>
      <View style={[styles.cardWrapper, { shadowColor: palette.cardShadow }]}>
        <LinearGradient colors={config.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientCard}>
          <TouchableOpacity activeOpacity={0.82} onPress={() => onEdit?.(item)} style={styles.gradientTouchable}>
            <View style={styles.cardContent}>
              <View style={styles.leftSection}>
                <View style={[styles.iconBadge, { backgroundColor: palette.iconBackground(0.18) }]}>
                  <Icon name={config.icon} size={32} color={config.textColor} />
                </View>
                <View style={styles.sourceDetails}>
                  <ThemedText style={[styles.sourceLabel, { color: config.textColor }]}>{item.source}</ThemedText>
                  <View style={styles.dateRow}>
                    <Icon name="event" size={13} color="white" />
                    <Text style={[styles.dateValue, { color: 'white' }]}> {item.date}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.rightSection}>
                <ThemedText style={[styles.amountValue, { color: config.textColor }]}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</ThemedText>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                    <Animated.View style={[{ transform: [{ scale: editScaleAnim }] }]}>
                      <Icon name="edit" size={18} color={config.textColor} />
                    </Animated.View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                    <Animated.View style={[{ transform: [{ scale: deleteScaleAnim }] }]}>
                      <Icon name="delete" size={18} color="#dc2626" />
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

const IncomeList = () => {
  const route = useRoute();
  const { id, Month, Year } = route.params;
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredIncomeData, setFilteredIncomeData] = useState([]);
  const { theme } = useContext(ThemeContext);

  const [editVisible, setEditVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceValue, setSourceValue] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sourceData, setSourceData] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [editSource, setEditSource] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState(new Date());


  const accentPalette = theme === 'dark' ? colorProfiles.dark : colorProfiles.light;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  useEffect(() => {
    if (!editVisible) {
      setSourceOpen(false);
    }
  }, [editVisible]);


  const getMonthlyIncome = async () => {
    try {
      setLoading(true);
      const data = await getIncomeByMonthYear(id, Month, Year);
      if (Array.isArray(data)) {
        setIncomeData(data);
      } else {
        setIncomeData([]);
      }
    } catch (error) {
      console.error('Error fetching income data:', error);
      setIncomeData([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (id && Month && Year) {
        getMonthlyIncome();
      }
    }, [Month, Year, id])
  );

  // Filter income data based on search text
  React.useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredIncomeData(incomeData);
    } else {
      const lowerSearch = searchText.toLowerCase();
      setFilteredIncomeData(incomeData.filter(item =>
        (item.source || '').toLowerCase().includes(lowerSearch) ||
        (item.amount || '').toString().includes(lowerSearch)
      ));
    }
  }, [incomeData, searchText]);

  const totalAmount = filteredIncomeData.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const isDark = theme === 'dark';

  const renderHeader = () => (
    <LinearGradient colors={accentPalette.background} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
      <View style={styles.headerTopRow}>
        <View>
          <ThemedText style={[styles.headerTitle, { color: accentPalette.accent }]}>Income Sources</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: accentPalette.accentSoft }]}>{monthNames[parseInt(Month) - 1]} {Year}</ThemedText>
        </View>
        <Icon name="trending-up" size={40} color={accentPalette.accent} />
      </View>
      <View style={[styles.totalCard, { backgroundColor: accentPalette.iconBackground(0.18) }]}>
        <View>
          <ThemedText style={[styles.totalLabel, { color: accentPalette.accentSoft }]}>Total Income</ThemedText>
          <ThemedText style={[styles.totalAmount, { color: accentPalette.accent }]}>₹{totalAmount.toLocaleString('en-IN')}</ThemedText>
        </View>
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
              await deleteIncome(item.id, id);
              // Refresh the income data after deletion
              await getMonthlyIncome();
              Alert.alert("Success", "Income source deleted successfully");
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

    setEditSource(item.source);
    setSourceValue(item.source); // ✅ preselect dropdown

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

      await updateIncome(selectedItem.id, id, {
        source: sourceValue, // ✅ dropdown value
        amount: editAmount,
        date: editDate.toISOString().split('T')[0],
      });

      setEditVisible(false);
      await getMonthlyIncome();

      Alert.alert("Success", "Income source updated successfully");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update income source");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!id) return;

    const fetchSources = async () => {
      try {
        const data = await getIncomeSources(id);
        console.log(data);
        if (data) {
          const transformedData = data.map(item => ({
            label: item.source_name,
            value: item.source_name,
            key: item.id.toString()
          }));
          setSourceData(transformedData);
        }

      } catch (error) {
        console.error('Error fetching sources:', error);
        Toast.show({ type: "error", text1: "Error", text2: "Failed to fetch sources", position: "top" });
      }
    };

    fetchSources();
  }, [id, refreshFlag]);

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
    <ThemedView style={[styles.container, { backgroundColor: accentPalette.listBackground }]}>
      <LoaderSpinner shouldLoad={loading} />
      <View style={styles.headerSection}>
        {renderHeader()}
      </View>
      <View style={styles.searchSection}>
        <ThemedTextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search source Name,amount..."
          style={styles.searchInput}
        />
      </View>
      <FlatList
        data={filteredIncomeData}
        keyExtractor={(item, index) => item.source + index}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="trending-up" size={48} color={isDark ? '#666' : '#ccc'} />
            <ThemedText style={styles.emptyText}>No income sources found</ThemedText>
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
            { backgroundColor: isDark ? '#111' : '#fff' }
          ]}>

            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Income Source</ThemedText>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Icon name="close" size={24} />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.inputLabel}>Source Name</ThemedText>

            <DropDownPicker
              open={sourceOpen}
              value={sourceValue}
              items={sourceData}
              setOpen={setSourceOpen}
              setValue={setSourceValue}
              setItems={setSourceData}
              placeholder="Select Source"
              listMode="SCROLLVIEW"
              style={[styles.picker, { borderColor: accentPalette.cardBorder, backgroundColor: accentPalette.pickerBackground }]}
              dropDownContainerStyle={[styles.dropdownList, { borderColor: accentPalette.cardBorder, backgroundColor: accentPalette.pickerBackground }]}
              textStyle={[styles.dropdownText, { color: accentPalette.textPrimary }]}
              zIndex={3000}
              zIndexInverse={1000}
              theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
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


            <ThemedText style={styles.inputLabel}>Amount</ThemedText>
            <ThemedTextInput
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="numeric"
              style={styles.input}
            />

            <ThemedText style={styles.inputLabel}>Date</ThemedText>
              <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {editDate.toDateString()}
              </Text>
            </TouchableOpacity>


            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleUpdateIncome}
              >
                <Text style={styles.addButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  gradientTouchable: {
    flex: 1,
    borderRadius: 16,
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
  sourceDetails: {
    flex: 1,
  },
  sourceLabel: {
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
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    opacity: 0.6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
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
  },
  textArea: {
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  addButton: {
    backgroundColor: '#0e4f5f',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
    dateButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 40,
  },
  dateButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default IncomeList;
