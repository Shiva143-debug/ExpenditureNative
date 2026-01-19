import React, { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { FlatList, View, Image, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated, Alert, SafeAreaView, Switch, ScrollView, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from "react-native-image-picker";
import LoaderSpinner from '../../../components/LoaderSpinner';
import ThemedText from '../../../components/ThemedText';
import ThemedView from '../../../components/ThemedView';
import ThemedTextInput from '../../../components/ThemedTextInput';

import { getExpenseCosts, getCategories, getExpenseItemsByCategory, updateExpense, deleteExpense } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import { ThemeContext } from '../../../context/ThemeContext';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const parseCurrencyValue = (value) => {
  if (value === undefined || value === null) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  const sanitized = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(sanitized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getImageSource = (imageUri) => {
  if (!imageUri) return null;
  if (imageUri.startsWith('http') || imageUri.startsWith('https')) {
    return { uri: imageUri };
  } else if (imageUri.startsWith('data:')) {
    return { uri: imageUri };
  } else {
    // Assume base64
    return { uri: `data:image/jpeg;base64,${imageUri}` };
  }
};


const EditExpenseModal = ({ visible, expense, userId, onClose, onSave }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const palette = useMemo(() => isDark
    ? {
      background: '#0f172a',
      cardBorder: 'rgba(148, 163, 184, 0.16)',
      textPrimary: '#e2e8f0',
      textSecondary: '#94a3b8',
    }
    : {
      background: '#f5f7fb',
      cardBorder: 'rgba(15, 23, 42, 0.08)',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
    }, [isDark]
  );
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
      const data = await getCategories(userId);
      setCategoryData(
        data.map(item => ({
          label: item.category,
          value: item.category,
        }))
      );
    };
    loadCategories();
  }, [userId]);

  /** 🔹 Fetch ExpenseItems when category changes */
  useEffect(() => {
    if (!categoryValue) return;

    const loadExpenseItems = async () => {
      const data = await getExpenseItemsByCategory(userId, categoryValue);
      setExpenseItemData(
        data.map(item => ({
          label: item.expense_name,
          value: item.expense_name,
        }))
      );
    };
    loadExpenseItems();
  }, [categoryValue, userId]);

  useEffect(() => {
    if (!expense) return;

    setForm({
      ...expense,
      // p_date: new Date(expense.p_date),
      p_date: expense.p_date ? new Date(expense.p_date) : new Date(),
      is_tax_app: expense.is_tax_app === "yes",
      percentage: expense.percentage || 0,
      tax_amount: expense.tax_amount || 0,
    });

    setCategoryValue(expense.category);
    setExpenseItemValue(expense.expense_name);
  }, [expense]);

  // if (!form) return null;
  if (!expense) return null;

  /** 🔹 UPDATE FIELD */
  const updateField = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  /** 🔹 TAX TOGGLE */
  const handleTaxToggle = (value) => {
    if (!value) {
      updateField("is_tax_app", false);
      updateField("percentage", 0);
      updateField("tax_amount", 0);
    } else {
      updateField("is_tax_app", true);
    }
  };

  /** 🔹 TAX % CHANGE */
  const handleTaxPercentageChange = (val) => {
    const percentage = Number(val) || 0;
    const taxAmount = (Number(form.cost) * percentage) / 100;

    setForm(prev => ({
      ...prev,
      percentage,
      tax_amount: taxAmount.toFixed(2),
    }));
  };

  /** 🔹 IMAGE PICKER */
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
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          console.error('ImagePicker Error:', response.errorMessage);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to pick image",
            position: "top",
          });
          return;
        }

        if (response.assets?.length) {
          updateField("image", response.assets[0].base64); // ✅ FIXED
        }
      }
    );
  };

  /** 🔹 SAVE */
  const handleSave = () => {
    onSave({
      ...form,
      category: categoryValue,
      ExpenseItem: ExpenseItemValue,
      p_date: form.p_date.toISOString().split("T")[0],
      is_tax_app: form.is_tax_app ? "yes" : "no",
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[
          styles.modalCard,
          { backgroundColor: isDark ? '#111' : '#fff' }
        ]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Edit Expense</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* CATEGORY */}
            <ThemedText style={styles.modalLabel}>Category</ThemedText>
            <DropDownPicker
              open={categoryOpen}
              value={categoryValue}
              items={categoryData}
              setOpen={setCategoryOpen}
              setValue={setCategoryValue}
              setItems={setCategoryData}
              placeholder="Select Category"
              listMode="SCROLLVIEW"
              style={[styles.picker, { borderColor: palette.cardBorder, backgroundColor: palette.background }]}
              dropDownContainerStyle={[styles.dropdownList, { borderColor: palette.cardBorder, backgroundColor: palette.background }]}
              textStyle={[styles.dropdownText, { color: palette.textPrimary }]}
              zIndex={3000}
              theme={isDark ? 'DARK' : 'LIGHT'}
            />

            {/* Expense Item */}
            <ThemedText style={styles.modalLabel}>Expense Item</ThemedText>
            <DropDownPicker
              open={ExpenseItemOpen}
              value={ExpenseItemValue}
              items={ExpenseItemData}
              setOpen={setExpenseItemOpen}
              setValue={setExpenseItemValue}
              setItems={setExpenseItemData}
              placeholder="Select Expense Item"
              listMode="SCROLLVIEW"
              style={[styles.picker, { borderColor: palette.cardBorder, backgroundColor: palette.background }]}
              dropDownContainerStyle={[styles.dropdownList, { borderColor: palette.cardBorder, backgroundColor: palette.background }]}
              textStyle={[styles.dropdownText, { color: palette.textPrimary }]}
              zIndex={2000}
              theme={isDark ? 'DARK' : 'LIGHT'}
            />

            {/* COST */}
            <ThemedText style={styles.modalLabel}>Cost</ThemedText>
            <ThemedTextInput
              value={String(form.cost)}
              keyboardType="numeric"
              onChangeText={v => {
                const cost = Number(v) || 0;
                const tax_amount = form.is_tax_app
                  ? ((cost * form.percentage) / 100).toFixed(2)
                  : 0;

                setForm(prev => ({
                  ...prev,
                  cost,
                  tax_amount,
                }));
              }}
            />

            {/* DESCRIPTION */}
            <ThemedText style={styles.modalLabel}>Description</ThemedText>
            <ThemedTextInput
              value={form.description}
              onChangeText={v => updateField('description', v)}
            />

            {/* DATE */}
            <ThemedText style={styles.modalLabel}>Date</ThemedText>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {form.p_date instanceof Date
                  ? form.p_date.toISOString().split("T")[0]
                  : ""}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={form.p_date instanceof Date ? form.p_date : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (event.type === "dismissed") return;
                  if (!selectedDate) return;
                  setForm(prev => ({
                    ...prev,
                    p_date: selectedDate,
                  }));
                }}
              />
            )}

            {/* TAX SWITCH */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 12, alignItems: 'center' }}>
              <ThemedText>Tax Applicable</ThemedText>
              <Switch
                value={form.is_tax_app}
                onValueChange={handleTaxToggle}
              />
            </View>

            {/* TAX FIELDS */}
            {form.is_tax_app && (
              <>
                <ThemedText style={styles.modalLabel}>Tax Percentage</ThemedText>
                <ThemedTextInput
                  value={String(form.percentage)}
                  keyboardType="numeric"
                  onChangeText={handleTaxPercentageChange}
                />

                <ThemedText style={styles.modalLabel}>Tax Amount</ThemedText>
                <ThemedTextInput
                  value={String(form.tax_amount)}
                  editable={false}
                />
              </>
            )}

            {/* IMAGE */}
            {form.image && (
              <Image
                source={getImageSource(form.image)}
                style={{ height: 150, borderRadius: 8, marginVertical: 12 }}
              />
            )}

            <TouchableOpacity onPress={pickImage} style={{ marginBottom: 20 }}>
              <ThemedText style={{ color: '#0e4f5f', fontWeight: 'bold' }}>Change Image</ThemedText>
            </TouchableOpacity>

            {/* ACTIONS */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.addButton]}
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


const ItemReport = () => {
  const { id } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { category, Month, Year } = route.params;
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { theme } = useContext(ThemeContext);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const palette = theme === 'dark'
    ? {
      headerGradient: ['#121212ff', '#f71414ff'],
      headerTitle: '#E8ECF7',
      headerSubtitle: '#e4e5e9ff',
      cardGradient: ['#121212ff', '#f71414ff'],
      iconBackground: 'rgba(129, 140, 248, 0.22)',
      iconPrimary: '#f1f2f8ff',
      divider: 'rgba(247, 247, 247, 0.32)',
      chipBackground: 'rgba(235, 46, 46, 0.18)',
      chipLabel: '#C7D2FE',
      chipValue: '#E0E7FF',
      textPrimary: '#EEF2FF',
      textSecondary: '#CBD5F5',
      pillText: '#C7D2FE',
      totalLabel: '#E2E8F0',
      totalSubLabel: '#A5B4FC',
      totalAmount: '#C7D2FE',
      detailLabel: '#C7D2FE',
      descriptionText: '#E0E7FF',
      infoBackground: 'rgba(99, 102, 241, 0.14)',
      eyeBackground: 'rgba(79, 70, 229, 0.4)',
      shadow: 'rgba(8, 10, 30, 0.6)',
    }
    : {
      headerGradient: ['#121212ff', '#f71414ff'],
      headerTitle: '#E8ECF7',
      headerSubtitle: '#e4e8f1ff',
      cardGradient: ['#121212ff', '#f71414ff'],
      iconBackground: 'rgba(59, 130, 246, 0.12)',
      iconPrimary: '#f1f2f8ff',
      divider: 'rgba(148, 163, 184, 0.18)',
      chipBackground: 'rgba(235, 46, 46, 0.18)',
      chipLabel: '#C7D2FE',
      chipValue: '#E0E7FF',
      textPrimary: '#EEF2FF',
      textSecondary: '#EEF2FF',
      pillText: '#EEF2FF',
      totalLabel: '#EEF2FF',
      totalSubLabel: '#64748B',
      totalAmount: '#EEF2FF',
      detailLabel: '#C7D2FE',
      descriptionText: '#E0E7FF',
      infoBackground: 'rgba(148, 163, 184, 0.08)',
      eyeBackground: 'rgba(15, 23, 42, 0.12)',
      shadow: 'rgba(15, 23, 42, 0.25)',
    };

  const {
    headerGradient,
    headerTitle,
    headerSubtitle,
    cardGradient,
    iconBackground,
    iconPrimary,
    divider,
    chipBackground,
    chipLabel,
    chipValue,
    textPrimary,
    textSecondary,
    pillText,
    detailLabel,
    descriptionText,
    infoBackground,
    eyeBackground,
    shadow,
  } = palette;

  const getExpenses = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getExpenseCosts(id);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expense items:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getExpenses();
  }, [id]);

  const filteredItems = expenses.filter((item) => {
    const itemMonth = new Date(item.p_date).getMonth() + 1;
    const itemYear = new Date(item.p_date).getFullYear();
    return (
      (category ? item.category === category : true) &&
      (Month ? itemMonth == Month : true) &&
      (Year ? itemYear == Year : true)
    );
  });

  const handleDeleteExpense = (item) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
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
              await deleteExpense(item.id, id);
              // Refresh the expense data after deletion
              await getExpenses();
              Alert.alert("Success", "Expense deleted successfully");
              navigation.goBack();
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

      await updateExpense(updatedExpense.id, {
        ...updatedExpense,
        user_id: id,
      });

      await getExpenses(); // refresh list
      setEditModalVisible(false);
      Alert.alert("Success", "Expense updated Successfully");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Update failed");
    } finally {
      setLoading(false);
    }
  };


  const AnimatedItemCard = ({ item, index, onDelete, onEdit }) => {
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

    const isTaxApplicable = (item.is_tax_app || '').toLowerCase() === 'yes';
    const cost = parseCurrencyValue(item.cost);
    const providedTax = parseCurrencyValue(item.tax_amount);
    const taxAmountRaw = isTaxApplicable
      ? providedTax || Number((cost * 0.18).toFixed(2))
      : 0;
    const totalAmountValue = cost + taxAmountRaw;

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: entryAnim,
            transform: [{ translateY }],
            shadowColor: shadow,
          },
        ]}
      >
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Animated.View style={[{ transform: [{ scale: editScaleAnim }] }]}>
              <Icon name="edit" size={18} color={iconPrimary} />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
            <Animated.View style={[{ transform: [{ scale: deleteScaleAnim }] }]}>
              <Icon name="delete" size={18} color={iconPrimary} />
            </Animated.View>
          </TouchableOpacity>
        </View>
        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.ExpenseItemIcon, { backgroundColor: iconBackground }]}>
              <Icon name="shopping-bag" size={24} color={iconPrimary} />
            </View>
            <View style={styles.headerInfo}>
              <ThemedText style={[styles.ExpenseItemTitle, { color: textPrimary }]}>
                {item.expense_name}
              </ThemedText>
              <View style={styles.dateRow}>
                <Icon name="event" size={16} color={iconPrimary} />
                <ThemedText style={[styles.dateText, { color: textSecondary }]}>
                  {item.p_date}
                </ThemedText>
              </View>
            </View>
            <View style={styles.rightSection}>
              <View style={[styles.amountPill, { backgroundColor: chipBackground }]}>
                <ThemedText style={[styles.amountValue, { color: pillText }]}>
                  ₹{cost.toLocaleString()}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.metadataRow}>
            <View style={[styles.chip, { backgroundColor: chipBackground }]}>
              <ThemedText style={[styles.chipLabel, { color: chipLabel }]}>Category</ThemedText>
              <ThemedText style={[styles.chipValue, { color: chipValue }]}>{item.category}</ThemedText>
            </View>
            <View style={[styles.chip, { backgroundColor: chipBackground }]}>
              <ThemedText style={[styles.chipLabel, { color: chipLabel }]}>Tax Applicable</ThemedText>
              <ThemedText
                style={[
                  styles.chipValue,
                  { color: isTaxApplicable ? '#22C55E' : '#F97316' },
                ]}
              >
                {isTaxApplicable ? 'Yes' : 'No'}
              </ThemedText>
            </View>
            {isTaxApplicable && (
              <View style={[styles.chip, { backgroundColor: chipBackground }]}>
                <ThemedText style={[styles.chipLabel, { color: chipLabel }]}>Tax Amount</ThemedText>
                <ThemedText style={[styles.chipValue, { color: chipValue }]}>
                  ₹{taxAmountRaw.toLocaleString()}
                </ThemedText>
              </View>
            )}
          </View>


          {item.description && (
            <View style={[styles.descriptionContainer, { backgroundColor: infoBackground }]}>
              <ThemedText style={[styles.detailLabel, { color: detailLabel }]}>Notes</ThemedText>
              <ThemedText style={[styles.description, { color: descriptionText }]}>{item.description}</ThemedText>
            </View>
          )}

          {item.image && (
            <View style={[styles.imageContainer, { borderTopColor: divider }]}>
              <Image
                source={getImageSource(item.image)}
                style={styles.image}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={[styles.eyeIconButton, { backgroundColor: eyeBackground }]}
                onPress={() => setSelectedImage(item.image)}
              >
                <Icon name="remove-red-eye" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { shadowColor: shadow, backgroundColor: 'transparent' }]}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <ThemedText style={[styles.headerTitle, { color: headerTitle }]}>
            {category} Details
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: headerSubtitle }]}>
            {monthNames[parseInt(Month, 10) - 1]} {Year}
          </ThemedText>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <LoaderSpinner shouldLoad={loading} />
        <View style={styles.headerSection}>{renderHeader()}</View>

        <FlatList
          data={filteredItems}
          renderItem={({ item, index }) => (
            <AnimatedItemCard item={item} index={index} onDelete={handleDeleteExpense} onEdit={handleEditExpense} />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        <Modal
          visible={!!selectedImage}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Icon name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Image
              source={getImageSource(selectedImage)}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </ThemedView>

      <EditExpenseModal
        visible={editModalVisible}
        expense={editingExpense}
        userId={id}
        onClose={() => setEditModalVisible(false)}
        onSave={handleUpdateExpense}
      />


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    zIndex: 1,
    paddingHorizontal: 6,
    paddingTop: 0,
    paddingBottom: 16,
  },
  listSection: {
    flex: 1,
  },
  headerContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  headerContent: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
  cardWrapper: {
    borderRadius: 24,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 7,
  },
  card: {
    borderRadius: 24,
    padding: 20,
  },
  cardHeader: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionButtons: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 10,
  },
  editButton: {
    padding: 6,
    marginRight: 8,
  },
  deleteButton: {
    padding: 6,
  },
  ExpenseItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  ExpenseItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    marginLeft: 8,
  },
  amountPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 12,
  },
  chipLabel: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    opacity: 0.78,
  },
  chipValue: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.85,
  },
  totalSubLabel: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.6,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  descriptionContainer: {
    marginTop: 2,
    borderRadius: 18,
    padding: 16,
  },
  detailLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
    opacity: 0.65,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    marginTop: 18,
    borderTopWidth: 1,
    paddingTop: 16,
    borderRadius: 20,
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
  modalImage: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },

  modalCard: {
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

  modalLabel: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
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
    marginBottom: 10,
  },

  dateButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
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

});

export default ItemReport;
