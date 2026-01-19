import React, { useState, useRef, useContext } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Animated, Alert, ActivityIndicator } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import LoaderSpinner from '../../components/LoaderSpinner';
import { ThemeContext } from '../../context/ThemeContext';
import { getExpenseItems, deleteExpenseItem, getCategories, addExpenseItem, updateExpenseItem } from '../../services/apiService';

const productPalette = {
  light: {
    header: '#f1f5f9',
    background: '#f5f7fb',
    accent: '#0284c7',
    accentSoft: '#bae6fd',
    surface: '#ffffff',
    cardShadow: '#e2e8f01a',
    iconGlow: 'rgba(34, 211, 238, 0.35)',
    emptyIcon: '#64748b',
    cardBackground: '#ffffff',
    cardAccent: '#334155',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
  },
  dark: {

    header: 'rgba(35, 35, 35, 0.19)',
    background: '#0f172a',
    accent: '#0284c7',
    accentSoft: '#bae6fd',
    surface: '#0f172a',
    cardShadow: '#e0d9d955',
    iconGlow: 'rgba(34, 211, 238, 0.35)',
    emptyIcon: '#475569',
    cardBackground: 'rgba(255, 255, 255, 0.1)',
    cardAccent: '#e2e8f0',
    cardBorder: 'rgba(148, 163, 184, 0.16)',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    cardBorder: 'rgba(148, 163, 184, 0.16)',
  },
};

const AnimatedProductCard = ({ item, index, onPress, onEdit, onDelete, palette }) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
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
    }, [index])
  );

  return (
    <Animated.View style={[{ transform: [{ translateY }], opacity: opacityAnim }, styles.cardWrapper, { backgroundColor: palette.cardBackground, shadowColor: palette.cardShadow }]}>
      <TouchableOpacity activeOpacity={0.82} onPress={onPress}>
        <View style={styles.cardContent}>
          <View style={styles.leftSection}>
            <View style={[styles.iconBadge, { backgroundColor: `${palette.cardAccent}22` }]}>
              <Icon name="shopping-bag" size={32} color={palette.cardAccent} />
            </View>
            <View style={styles.productDetails}>
              <ThemedText style={[styles.productLabel, { color: palette.cardAccent }]}>{item.expense_name}</ThemedText>
              <ThemedText style={[styles.categoryText, { color: palette.cardAccent + '80' }]}>Category: {item.category}</ThemedText>
            </View>
          </View>
          <View style={styles.rightSection}>
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
              <Icon name="edit" size={20} color={palette.cardAccent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item)} style={styles.actionButton}>
              <Icon name="delete" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProductsScreen = () => {
  const route = useRoute();
  const { id, category } = route.params;
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newexpenseItem, setNewexpenseItem] = useState('');
  const [editingexpenseItem, setEditingexpenseItem] = useState(null);

  // Category dropdown states
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [dialogCategoryValue, setDialogCategoryValue] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchFilteredData, setSearchFilteredData] = useState([]);
  const { theme } = useContext(ThemeContext);
  const palette = theme === 'dark' ? productPalette.dark : productPalette.light;

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [expenseItemsData, categoriesData] = await Promise.all([
        getExpenseItems(id),
        getCategories(id)
      ]);
      console.log("all categories and expense items data", expenseItemsData);
      console.log("categories data", categoriesData);

      if (expenseItemsData && Array.isArray(expenseItemsData)) {
        setExpenseData(expenseItemsData);
      }

      if (categoriesData && Array.isArray(categoriesData)) {
        // Transform categories for dropdown
        const transformedCategories = categoriesData.map((cat, index) => ({
          label: cat.category_name || cat.category,
          value: cat.category_name || cat.category,
          key: (index + 1).toString()
        }));
        // Add "All" option at the beginning
        const allOption = { label: 'All', value: null, key: '0' };
        setCategoryData([allOption, ...transformedCategories]);

        // Set category value: prioritize route category, then "All"
        if (category && transformedCategories.some(cat => cat.value === category)) {
          setCategoryValue(category);
        } else {
          setCategoryValue(null); // Default to "All"
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setCategoryData([]);
      setExpenseData([]);
    } finally {
      setLoading(false);
    }
  }, [id, category, categoryValue]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Filter data based on selected category
  React.useEffect(() => {
    if (categoryValue === null) {
      setFilteredData(expenseData);
    } else {
      setFilteredData(expenseData.filter(item => item.category === categoryValue));
    }
  }, [expenseData, categoryValue]);

  // Filter data based on search text
  React.useEffect(() => {
    if (searchText.trim() === '') {
      setSearchFilteredData(filteredData);
    } else {
      const lowerSearch = searchText.toLowerCase();
      setSearchFilteredData(filteredData.filter(item =>
        (item.expense_name || '').toLowerCase().includes(lowerSearch) ||
        (item.category || '').toLowerCase().includes(lowerSearch)
      ));
    }
  }, [filteredData, searchText]);

  // Filter data based on selected category
  React.useEffect(() => {
    if (categoryValue === null) {
      setFilteredData(expenseData);
    } else {
      setFilteredData(expenseData.filter(item => item.category === categoryValue));
    }
  }, [expenseData, categoryValue]);

  // Filter data based on search text
  React.useEffect(() => {
    if (searchText.trim() === '') {
      setSearchFilteredData(filteredData);
    } else {
      const lowerSearch = searchText.toLowerCase();
      setSearchFilteredData(filteredData.filter(item =>
        (item.expense_name || '').toLowerCase().includes(lowerSearch) ||
        (item.category || '').toLowerCase().includes(lowerSearch)
      ));
    }
  }, [filteredData, searchText]);


  const handleAddExpenseItem = async () => {
    if (!newexpenseItem.trim()) return;

    if (!dialogCategoryValue) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setDialogLoading(true);
      await addExpenseItem(id, dialogCategoryValue, newexpenseItem.trim());
      setNewexpenseItem('');
      setShowAddDialog(false);
      setDialogCategoryValue(null);
      fetchData();
      Alert.alert("Success", "Expense Item added successfully");
    } catch (error) {
      console.error('Error adding expenseItem:', error);
      Alert.alert('Error', 'Failed to add expenseItem');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleEditexpenseItem = (expenseItem) => {
    setEditingexpenseItem(expenseItem);
    setNewexpenseItem(expenseItem.expense_name);
    setShowAddDialog(true);
  };
  const handleupdateExpenseItem = async () => {
    if (!newexpenseItem.trim() || !editingexpenseItem) return;

    try {
      setDialogLoading(true);
      await updateExpenseItem(
        editingexpenseItem.id, // expenseItem id
        id,                    // user id
        newexpenseItem.trim()  // updated name
      );

      setNewexpenseItem('');
      setShowAddDialog(false);
      setEditingexpenseItem(null);
      Alert.alert("Success", "Expense Name Updated successfully");
      fetchData();
    } catch (error) {
      console.error('Error updating expenseItem:', error);
      Alert.alert('Error', 'Failed to update expenseItem');
    } finally {
      setDialogLoading(false);
    }
  };


  const handledeleteExpenseItem = (expenseItem) => {
    if (expenseItem.user_id === 0) {
      Alert.alert('Cannot Delete', 'Default Expense Items cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete expense Item',
      `Are you sure you want to delete "${expenseItem.expense_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpenseItem(expenseItem.id, id);
              fetchData();
              Alert.alert("Success", "Expense Item deleted successfully");
            } catch (error) {
              console.error('Error deleting expense Item:', error);
              Alert.alert('Error', 'Expense Item deletion failed\nExpense Item is used in Expenses');
            }
          }
        }
      ]
    );
  };

  const handleexpenseItemPress = (expenseItem) => {
    Alert.alert('expenseItem Selected', `Selected: ${expenseItem.expense_name}`);
  };

  const renderHeader = () => (
    <View style={[styles.headerGradient, { backgroundColor: palette.header }]}>
      <View style={styles.headerTopRow}>
        <View>
          <ThemedText style={[styles.headerTitle, { color: palette.cardAccent }]}>Expense Items</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: palette.cardAccent }]}>Manage your Expense Items</ThemedText>
        </View>
        <TouchableOpacity onPress={() => { setShowAddDialog(true); setDialogCategoryValue(null); }} style={styles.addButton}>
          <Icon name="add" size={24} color={palette.cardAccent} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <AnimatedProductCard
      item={item}
      index={index}
      onPress={() => handleexpenseItemPress(item)}
      onEdit={handleEditexpenseItem}
      onDelete={handledeleteExpenseItem}
      palette={palette}
    />
  );

  const renderAddDialog = () => (
    showAddDialog && (
      <View style={styles.dialogOverlay}>
        <View style={[styles.dialog, { backgroundColor: palette.surface }]}>
          <ThemedText style={styles.dialogTitle}>
            {editingexpenseItem ? 'Edit Expense Item' : 'Add Expense Item'}
          </ThemedText>

          {!editingexpenseItem && (
            <View style={styles.dropdownContainer}>
         
              <DropDownPicker
                open={categoryOpen}
                value={dialogCategoryValue}
                items={categoryData}
                setOpen={setCategoryOpen}
                setValue={setDialogCategoryValue}
                setItems={setCategoryData}
                placeholder="Select Category"

                listMode="MODAL"          // 🔥 KEY FIX
                modalProps={{
                  animationType: 'fade',
                }}
                modalTitle="Select Category"
                modalTitleStyle={{
                  fontSize: 18,
                  fontWeight: '600',
                }}

                style={[
                  styles.picker,
                  {
                    borderColor: palette.cardBorder,
                    backgroundColor: palette.background,
                  },
                ]}
                dropDownContainerStyle={[
                  styles.dropdownList,
                  {
                    borderColor: palette.cardBorder,
                    backgroundColor: palette.background,
                  },
                ]}
                textStyle={[
                  styles.dropdownText,
                  { color: palette.textPrimary },
                ]}

                theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
              />


            </View>
          )}

          <ThemedTextInput
            value={newexpenseItem}
            onChangeText={setNewexpenseItem}
            placeholder="Enter Expense Item Name"
            style={styles.input}
            editable={!dialogLoading}
          />
          <View style={styles.dialogButtons}>
            <TouchableOpacity
              onPress={() => {
                setShowAddDialog(false);
                setEditingexpenseItem(null);
                setNewexpenseItem('');
                setDialogCategoryValue(null);
                if (!editingexpenseItem) {
                  setCategoryOpen(false);
                }
              }}
              style={styles.cancelButton}
              disabled={dialogLoading}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={editingexpenseItem ? handleupdateExpenseItem : handleAddExpenseItem}
              style={styles.saveButton}
              disabled={dialogLoading}
            >
              <ThemedText style={styles.saveButtonText}>
                {editingexpenseItem ? 'Update' : 'Add'}
              </ThemedText>
            </TouchableOpacity>
          </View>
          {dialogLoading && (
            <View style={styles.dialogLoader}>
              <ActivityIndicator size="large" color={palette.accent} />
            </View>
          )}
        </View>
      </View>
    )
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <LoaderSpinner shouldLoad={loading} />
      <View style={styles.headerSection}>
        {renderHeader()}
      </View>
      <View style={styles.searchSection}>
        <ThemedTextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search By Expense Items or categories..."
          style={styles.searchInput}
        />
      </View>
      <FlatList
        data={searchFilteredData}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="shopping-bag" size={48} color={palette.emptyIcon} />
            <ThemedText style={styles.emptyText}>
              No Expense Item found
            </ThemedText>
          </View>
        }
      />
      {renderAddDialog()}
    </View>
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
  filterSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 1000,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
  },

  headerGradient: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(35, 35, 35, 0.3)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
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
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  listContainer: {
    padding: 8,
    paddingBottom: 100,
  },
  cardWrapper: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryText: {
    fontSize: 14,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    blurRadius: 10,
  },
  dialog: {
    width: '80%',
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: '#0284c7',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(154, 151, 151, 0.3)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(35, 35, 35, 0.19)',
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dialogLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 3000,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  dropdownContainer: {
    marginBottom: 20,
    zIndex: 2000,
  },

  picker: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
  },

  dropdownList: {
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 200,
  },


  dropdownText: {
    fontSize: 15,
  },
});

export default ProductsScreen;