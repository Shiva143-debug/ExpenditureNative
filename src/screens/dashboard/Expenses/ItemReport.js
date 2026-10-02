import React, { useEffect, useState, useRef } from 'react';
import { FlatList, View, Image, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated, Alert, SafeAreaView, Switch, ScrollView, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from "react-native-image-picker";
import Toast from "react-native-toast-message";
import LoaderSpinner from '../../../components/LoaderSpinner';
import ThemedText from '../../../components/ThemedText';
import ThemedView from '../../../components/ThemedView';
import ThemedTextInput from '../../../components/ThemedTextInput';

import { getExpenseCosts, getCategories, getExpenseItemsByCategory, updateExpense, deleteExpense } from '../../../services/apiService';
import { useTheme } from '../../../theme/useTheme';
import { MODAL_BACKDROP } from '../../../theme/backdrop';
import { LIST_HEADER_GRADIENTS } from '../../../theme/palettes';
import { dateKeyToLocal, pad2, parseCurrencyValue, toDateKey } from '../../../utils/format';
import FormDropdown from '../../../components/FormDropdown';
import { cancelBackground } from '../../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HEADER_GRADIENT = LIST_HEADER_GRADIENTS.expense;

const getImageSource = (imageUri) => {
  if (!imageUri) return null;
  if (imageUri.startsWith('http') || imageUri.startsWith('https')) {
    return { uri: imageUri };
  } else if (imageUri.startsWith('data:')) {
    return { uri: imageUri };
  } else {
    return { uri: `data:image/jpeg;base64,${imageUri}` };
  }
};

// Falls back to the raw value (or an em dash) when the date is unparseable,
// which the shared `formatDateKey` does not do.
const formatExpenseDate = (value) => {
  const d = dateKeyToLocal(value);
  if (!d) return value == null || value === '' ? 'â€”' : String(value);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const EditExpenseModal = ({ visible, expense, palette, isDark, onClose, onSave }) => {
  const [form, setForm] = useState({});
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [ExpenseItemOpen, setExpenseItemOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [ExpenseItemValue, setExpenseItemValue] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [ExpenseItemData, setExpenseItemData] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const response = await getCategories();
      const data = response?.status ? response.data : [];
      setCategoryData(
        data.map(item => ({
          label: item.category,
          value: item.id,
        }))
      );
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!categoryValue) return;
    const loadExpenseItems = async () => {
      const response = await getExpenseItemsByCategory(categoryValue);
      const data = response?.status ? response.data : [];
      setExpenseItemData(
        data.map(item => ({
          label: item.expenseName,
          value: item.expenseItemId,
        }))
      );
    };
    loadExpenseItems();
  }, [categoryValue]);

  useEffect(() => {
    if (!expense) return;
    setForm({
      ...expense,
      pDate: dateKeyToLocal(expense.pDate) || new Date(),
      isTaxApp: expense.isTaxApp === "yes",
      percentage: expense.percentage || 0,
      taxAmount: expense.taxAmount || 0,
    });
    setCategoryValue(expense.categoryId != null ? expense.categoryId : expense.category);
    setExpenseItemValue(expense.expenseItemId);
  }, [expense]);

  if (!expense) return null;

  const updateField = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleTaxToggle = (value) => {
    if (!value) {
      updateField("isTaxApp", false);
      updateField("percentage", 0);
      updateField("taxAmount", 0);
    } else {
      updateField("isTaxApp", true);
    }
  };

  const handleTaxPercentageChange = (val) => {
    const percentage = Number(val) || 0;
    const taxAmount = (Number(form.cost) * percentage) / 100;
    setForm(prev => ({
      ...prev,
      percentage,
      taxAmount: taxAmount.toFixed(2),
    }));
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 800,
        maxWidth: 800,
        quality: 0.7,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Toast.show({ type: "error", text1: "Error", text2: "Failed to pick image", position: "top" });
          return;
        }
        if (response.assets?.length) {
          updateField("image", response.assets[0].base64);
        }
      }
    );
  };

  const handleSave = () => {
    onSave({
      ...form,
      categoryId: categoryValue,
      expenseItemId: ExpenseItemValue,
        pDate: toDateKey(form.pDate),
      isTaxApp: form.isTaxApp ? "yes" : "no",
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: palette.cardBackground }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={[styles.modalTitle, { color: palette.textPrimary }]}>Update Expense</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={palette.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <ThemedText style={[styles.modalLabel, { color: palette.textPrimary }]}>Category</ThemedText>
            <FormDropdown
              open={categoryOpen} onOpenChange={setCategoryOpen}
              value={categoryValue} onChange={setCategoryValue}
              items={categoryData} setItems={setCategoryData}
              placeholder="Select Category"
              palette={palette} variant="dialog"
            />

            <ThemedText style={[styles.modalLabel, { color: palette.textPrimary }]}>Expense Item</ThemedText>
            <FormDropdown
              open={ExpenseItemOpen} onOpenChange={setExpenseItemOpen}
              value={ExpenseItemValue} onChange={setExpenseItemValue}
              items={ExpenseItemData} setItems={setExpenseItemData}
              placeholder="Select Expense Item"
              palette={palette} variant="dialog"
            />

            <ThemedText style={[styles.modalLabel, { color: palette.textPrimary }]}>Cost</ThemedText>
            <ThemedTextInput
              value={String(form.cost)}
              keyboardType="numeric"
              onChangeText={v => {
                const cost = Number(v) || 0;
                const taxAmount = form.isTaxApp ? ((cost * form.percentage) / 100).toFixed(2) : 0;
                setForm(prev => ({ ...prev, cost, taxAmount }));
              }}
              style={[styles.input, { borderColor: palette.cardBorder, backgroundColor: palette.pickerBackground, color: palette.textPrimary }]}
            />

            <ThemedText style={[styles.modalLabel, { color: palette.textPrimary }]}>Description</ThemedText>
            <ThemedTextInput
              value={form.description}
              onChangeText={v => updateField('description', v)}
              style={[styles.input, { borderColor: palette.cardBorder, backgroundColor: palette.pickerBackground, color: palette.textPrimary }]}
            />

            <ThemedText style={[styles.modalLabel, { color: palette.textPrimary }]}>Date</ThemedText>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: palette.cardBorder }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateButtonText, { color: palette.textPrimary }]}>
                {form.pDate instanceof Date ? formatExpenseDate(form.pDate) : ''}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={form.pDate instanceof Date ? form.pDate : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (event.type === "dismissed") return;
                  if (!selectedDate) return;
                  setForm(prev => ({ ...prev, pDate: selectedDate }));
                }}
              />
            )}

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 12, alignItems: 'center' }}>
              <ThemedText style={{ color: palette.textPrimary }}>Tax Applicable</ThemedText>
              <Switch value={form.isTaxApp} onValueChange={handleTaxToggle} />
            </View>

            {form.isTaxApp && (
              <>
                <ThemedText style={[styles.modalLabel, { color: palette.textPrimary }]}>Tax Percentage</ThemedText>
                <ThemedTextInput
                  value={String(form.percentage)}
                  keyboardType="numeric"
                  onChangeText={handleTaxPercentageChange}
                  style={[styles.input, { borderColor: palette.cardBorder, backgroundColor: palette.pickerBackground, color: palette.textPrimary }]}
                />

                <ThemedText style={[styles.modalLabel, { color: palette.textPrimary }]}>Tax Amount</ThemedText>
                <ThemedTextInput
                  value={String(form.taxAmount)}
                  editable={false}
                  style={[styles.input, { borderColor: palette.cardBorder, backgroundColor: palette.pickerBackground, color: palette.textSecondary }]}
                />
              </>
            )}

            {form.image && (
              <Image source={getImageSource(form.image)} style={{ height: 150, borderRadius: 8, marginVertical: 12 }} />
            )}

            <TouchableOpacity onPress={pickImage} style={{ marginBottom: 20 }}>
              <ThemedText style={{ color: palette.accent, fontWeight: 'bold' }}>Change Image</ThemedText>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: cancelBackground(isDark) }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: palette.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.addButton, { backgroundColor: palette.accent }]}
                onPress={handleSave}
              >
                <Text style={styles.addButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};


const AnimatedItemCard = ({ item, index, palette, onDelete, onEdit, onImagePress }) => {
  const entryAnim = useRef(new Animated.Value(0)).current;
  const deleteScaleAnim = useRef(new Animated.Value(1)).current;
  const editScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 420,
      delay: index * 90,
      useNativeDriver: true,
    }).start();
  }, [entryAnim, index]);

  const translateY = entryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  const handleDeletePress = () => {
    Animated.sequence([
      Animated.timing(deleteScaleAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(deleteScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => onDelete?.(item));
  };

  const handleEditPress = () => {
    Animated.sequence([
      Animated.timing(editScaleAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(editScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => onEdit?.(item));
  };

  const isTaxApplicable = item.isTaxApp;
  const cost = parseCurrencyValue(item.cost);
  const providedTax = parseCurrencyValue(item.taxAmount);
  const taxAmountRaw = isTaxApplicable ? (providedTax || Number((cost * 0.18).toFixed(2))) : 0;
  const totalAmountValue = cost ;

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: entryAnim,
          transform: [{ translateY }],
          backgroundColor: palette.cardBackground,
          borderColor: palette.cardBorder,
          shadowColor: palette.cardShadow,
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <View style={[styles.iconBadge, { backgroundColor: palette.iconBackground(0.18) }]}>
            <Icon name="shopping-bag" size={26} color={palette.accent} />
          </View>
          <View style={styles.itemDetails}>
            <ThemedText style={[styles.itemTitle, { color: palette.textPrimary }]}>{totalAmountValue.toLocaleString('en-IN')}</ThemedText>
            <View style={styles.dateRow}>
              <Icon name="event" size={13} color={palette.textSecondary} />
              <Text style={[styles.dateText, { color: palette.textSecondary }]}>
                {formatExpenseDate(item.pDate)}
              </Text>
            </View>

          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
              <Animated.View style={[{ transform: [{ scale: editScaleAnim }] }]}>
                <Icon name="edit-note" size={18} color={palette.accent} />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
              <Animated.View style={[{ transform: [{ scale: deleteScaleAnim }] }]}>
                <Icon name="delete-outline" size={18} color="#dc2626" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.metadataRow}>
          <View style={[styles.chip, { backgroundColor: palette.iconBackground(0.12) }]}>
            <ThemedText style={[styles.chipLabel, { color: palette.textSecondary }]}>Category</ThemedText>
            <ThemedText style={[styles.chipValue, { color: palette.textPrimary }]}>{item.category}</ThemedText>
          </View>
          <View style={[styles.chip, { backgroundColor: palette.iconBackground(0.12) }]}>
            <ThemedText style={[styles.chipLabel, { color: palette.textSecondary }]}>Expense</ThemedText>
            <ThemedText style={[styles.chipValue, { color: palette.textPrimary }]}>{item.expenseName}</ThemedText>
          </View>
          <View style={[styles.chip, { backgroundColor: palette.iconBackground(0.12) }]}>
            <ThemedText style={[styles.chipLabel, { color: palette.textSecondary }]}>Tax Applicable</ThemedText>
            <ThemedText style={[styles.chipValue, { color: isTaxApplicable ? '#16a34a' : '#f97316' }]}>
              {isTaxApplicable ? 'Yes' : 'No'}
            </ThemedText>
          </View>
          {isTaxApplicable && (
            <View style={[styles.chip, { backgroundColor: palette.iconBackground(0.12) }]}>
              <ThemedText style={[styles.chipLabel, { color: palette.textSecondary }]}>Tax Amount</ThemedText>
              <ThemedText style={[styles.chipValue, { color: palette.textPrimary }]}>
                {taxAmountRaw.toLocaleString('en-IN')}
              </ThemedText>
            </View>
          )}
        </View>

        {item.description && (
          <View style={[styles.noteDivider, { borderTopColor: palette.cardBorder }]}>
            <ThemedText style={[styles.detailLabel, { color: palette.accent }]}>Notes</ThemedText>
            <ThemedText style={[styles.description, { color: palette.textSecondary }]}>{item.description}</ThemedText>
          </View>
        )}

        {item.image && (
          <View style={[styles.imageContainer, { borderTopColor: palette.cardBorder }]}>
            <Image source={getImageSource(item.image)} style={styles.image} resizeMode="cover" />
            <TouchableOpacity
              style={[styles.eyeIconButton, { backgroundColor: palette.accent }]}
              onPress={onImagePress}
            >
              <Icon name="remove-red-eye" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const ItemReport = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, Month, Year } = route.params;
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { palette: themePalettes, isDark } = useTheme();
  const palette = themePalettes.list.itemReport;

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const getExpenses = async () => {
    try {
      setLoading(true);
      const response = await getExpenseCosts();
      setExpenses(response?.data || []);
    } catch (error) {
      console.error('Error fetching expense items:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getExpenses();
  }, []);

  const filteredItems = expenses.filter((item) => {
    const itemDate = dateKeyToLocal(item.pDate);
    const itemMonth = item.month != null
      ? Number(item.month)
      : ((itemDate ? itemDate.getMonth() : 0) + 1);
    const itemYear = item.year != null
      ? Number(item.year)
      : (itemDate ? itemDate.getFullYear() : 0);
    return (
      (category ? item.category === category : true) &&
      (Month ? itemMonth === Number(Month) : true) &&
      (Year ? itemYear === Number(Year) : true)
    );
  });

  const totalAmount = filteredItems.reduce((acc, item) => {
    const cost = parseCurrencyValue(item.cost);
    return acc + cost ;
  }, 0);

  const handleDeleteExpense = (item) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await deleteExpense(item.id);
              if (response?.status) {
                await getExpenses();
                Alert.alert("Success", response.message || "Expense deleted successfully");
                navigation.goBack();
              } else {
                Alert.alert("Error", response?.message || "Failed to delete expense");
              }
            } catch (error) {
              console.error("Error deleting expense:", error);
              Alert.alert("Error", "Failed to delete expense");
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

  const handleEditExpense = (item) => {
    setEditingExpense(item);
    setEditModalVisible(true);
  };

  const handleUpdateExpense = async (updatedExpense) => {
    try {
      setLoading(true);
      const response = await updateExpense(updatedExpense.id, { ...updatedExpense });
      if (response?.status) {
        await getExpenses();
        setEditModalVisible(false);
        Alert.alert("Success", response.message || "Expense updated Successfully");
        navigation.goBack();
      } else {
        Alert.alert("Error", response?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <LinearGradient colors={HEADER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
      <Icon name="receipt-long" size={130} color="rgba(255,255,255,0.08)" style={styles.headerDecor} />
      <View style={styles.headerTopRow}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <ThemedText style={styles.headerTitle}>{category} Details</ThemedText>
        </View>
        <View style={styles.headerAvatar}>
          <Icon name="inventory" size={24} color="#fff" />
        </View>
      </View>
      <View style={[styles.totalCard, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
        <ThemedText style={styles.totalLabel}>Total Amount</ThemedText>
        <ThemedText style={styles.totalAmount}>₹{totalAmount.toLocaleString('en-IN')}</ThemedText>
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <LinearGradient colors={palette.background} style={StyleSheet.absoluteFillObject} />
        <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
          <LoaderSpinner shouldLoad={loading} />
          <View style={styles.headerSection}>{renderHeader()}</View>

          <FlatList
            data={filteredItems}
            renderItem={({ item, index }) => (
              <AnimatedItemCard
                item={item}
                index={index}
                palette={palette}
                onDelete={handleDeleteExpense}
                onEdit={handleEditExpense}
                onImagePress={() => setSelectedImage(item.image)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="receipt-long" size={48} color={palette.emptyIcon} />
                <ThemedText style={[styles.emptyText, { color: palette.textSecondary }]}>No expenses found</ThemedText>
              </View>
            }
          />

          <Modal
            visible={!!selectedImage}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedImage(null)}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImage(null)}>
                <Icon name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Image source={getImageSource(selectedImage)} style={styles.fullScreenImage} resizeMode="contain" />
            </View>
          </Modal>
        </ThemedView>

        <EditExpenseModal
          visible={editModalVisible}
          expense={editingExpense}
          palette={palette}
          isDark={isDark}
          onClose={() => setEditModalVisible(false)}
          onSave={handleUpdateExpense}
        />
      </View>
    </SafeAreaView>
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
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
    fontSize: 20,
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
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    marginLeft: 6,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  editButton: {
    padding: 6,
  },
  deleteButton: {
    padding: 6,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    marginBottom: 10,
  },
  chipLabel: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  chipValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  noteDivider: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    paddingTop: 14,
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  eyeIconButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MODAL_BACKDROP,
    padding: 20,
  },
  modalCard: {
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
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
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

export default ItemReport;
