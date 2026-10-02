import React, { useState, useRef } from 'react';
import { View, FlatList, TouchableOpacity, Animated, Alert } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LoaderSpinner from '../../components/LoaderSpinner';
import DefaultLockInfo from '../../components/DefaultLockInfo';
import FormDropdown from '../../components/FormDropdown';
import InTreeDialog, { DialogTitle, DialogFooter, DialogBusy } from '../../components/InTreeDialog';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import { useTheme } from '../../theme/useTheme';
import { cancelBackground, OVERLAY } from '../../theme/colors';
import { commonStyles, manageStyles } from '../../styles';
import { getExpenseItemIcon } from '../../theme/entityIcons';
import { getExpenseItems, deleteExpenseItem, getCategories, addExpenseItem, updateExpenseItem } from '../../services/apiService';

// Title of DropDownPicker's full-screen category list.
const MODAL_TITLE_STYLE = { fontSize: 18, fontWeight: '600' };

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
        }, [index, opacityAnim, translateY])

  );

  return (
    <Animated.View style={[{ transform: [{ translateY }], opacity: opacityAnim }, manageStyles.card, { backgroundColor: palette.cardBackground, shadowColor: palette.cardShadow }]}>
      <TouchableOpacity activeOpacity={0.82} onPress={onPress}>
        <View style={manageStyles.cardContent}>
          <View style={manageStyles.leftSection}>
            <View style={[manageStyles.iconBadge, { backgroundColor: `${palette.cardAccent}22` }]}>
              <Icon name={getExpenseItemIcon(item)} size={28} color={palette.cardAccent} />
            </View>
            <View style={manageStyles.labelWrap}>
              <ThemedText style={[manageStyles.label, { color: palette.textPrimary }]}>{item.expenseName}</ThemedText>
              <View style={[manageStyles.defaultChip, { backgroundColor: `${palette.cardAccent}18` }]}>
                <ThemedText style={[manageStyles.defaultText, { color: palette.cardAccent }]}>{item.category}</ThemedText>
              </View>
            </View>
          </View>
          <View style={manageStyles.rightSection}>
            {item.userId === 0 ? (
              <DefaultLockInfo
                palette={palette}
                message="This is a default expense item. You cannot edit or delete it."
              />
            ) : (
              <>
                <TouchableOpacity onPress={() => onEdit(item)} style={manageStyles.actionButton}>
                  <Icon name="edit-note" size={20} color={palette.cardAccent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item)} style={manageStyles.actionButton}>
                  <Icon name="delete-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProductsScreen = () => {
  const route = useRoute();
  const { categoryId } = route.params || {};
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newexpenseItem, setNewexpenseItem] = useState('');
  const [editingexpenseItem, setEditingexpenseItem] = useState(null);

  // Filter dropdown (options derived from fetched items)
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState(null);
  const [filterCategories, setFilterCategories] = useState([{ label: 'All', value: null }]);

  // Add/edit dialog category picker (full category list from backend)
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [dialogCategoryValue, setDialogCategoryValue] = useState(null);
  const [dialogCategoryData, setDialogCategoryData] = useState([]);

  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchFilteredData, setSearchFilteredData] = useState([]);
  const { isDark, palette: themePalettes } = useTheme();
  const palette = themePalettes.screen('products');

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [expenseItemsRes, categoriesRes] = await Promise.all([
        getExpenseItems(),
        getCategories(),
      ]);
      const expenseItemsData = expenseItemsRes?.status && Array.isArray(expenseItemsRes.data) ? expenseItemsRes.data : [];
      const categoriesData = categoriesRes?.status && Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

      setExpenseData(expenseItemsData);

      // Full category list for the add/edit dialog (value = category id)
      const categoryOptions = categoriesData
        .filter((cat) => cat && cat.id != null)
        .map((cat) => ({
          label: cat.categoryName || cat.category_name || cat.category,
          value: Number(cat.id),
        }));
      setDialogCategoryData(categoryOptions);

      // Filter options come from the full category list, not from the items we
      // received, so a newly created category is selectable straight away even
      // though it has no expense items yet
      setFilterCategories([
        { label: 'All', value: null },
        ...categoryOptions,
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setDialogCategoryData([]);
      setExpenseData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Initialise filter from the route param once items are loaded
  React.useEffect(() => {
    if (categoryId != null && filterCategories.some((c) => c.value === Number(categoryId))) {
      setFilterValue(Number(categoryId));
    } else {
      setFilterValue(null);
    }
  }, [categoryId, filterCategories]);

  // Apply category filter
  React.useEffect(() => {
    setFilteredData(
      filterValue == null
        ? expenseData
        : expenseData.filter((item) => Number(item.categoryId) === filterValue)
    );
  }, [expenseData, filterValue]);

  // Apply search filter
  React.useEffect(() => {
    const lower = searchText.trim().toLowerCase();
    if (!lower) {
      setSearchFilteredData(filteredData);
    } else {
      setSearchFilteredData(
        filteredData.filter((item) =>
          (item.expenseName || '').toLowerCase().includes(lower) ||
          (item.category || '').toLowerCase().includes(lower)
        )
      );
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
      const response = await addExpenseItem(dialogCategoryValue, newexpenseItem.trim());
      if (response?.status) {
        setNewexpenseItem('');
        setShowAddDialog(false);
        setDialogCategoryValue(null);
        setCategoryOpen(false);
        fetchData();
        Alert.alert('Success', response.message || 'Expense Item added successfully');
      } else {
        Alert.alert('Error', response?.message || 'Failed to add expenseItem');
      }
    } catch (error) {
      console.error('Error adding expenseItem:', error);
      Alert.alert('Error', 'Failed to add expenseItem');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleEditexpenseItem = (expenseItem) => {
    setEditingexpenseItem(expenseItem);
    setNewexpenseItem(expenseItem.expenseName);
    setShowAddDialog(true);
  };

  const handleupdateExpenseItem = async () => {
    if (!newexpenseItem.trim() || !editingexpenseItem) return;

    try {
      setDialogLoading(true);
      const response = await updateExpenseItem(
        editingexpenseItem.id, // expenseItem id
        newexpenseItem.trim()  // updated name
      );

      if (response?.status) {
        setNewexpenseItem('');
        setShowAddDialog(false);
        setEditingexpenseItem(null);
        Alert.alert('Success', response.message || 'Expense Name Updated successfully');
        fetchData();
      } else {
        Alert.alert('Error', response?.message || 'Failed to update expenseItem');
      }
    } catch (error) {
      console.error('Error updating expenseItem:', error);
      Alert.alert('Error', 'Failed to update expenseItem');
    } finally {
      setDialogLoading(false);
    }
  };

  const handledeleteExpenseItem = (expenseItem) => {
    Alert.alert(
      'Delete expense Item',
      `Are you sure you want to delete "${expenseItem.expenseName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteExpenseItem(expenseItem.id);
              if (response?.status) {
                fetchData();
                Alert.alert('Success', response.message || 'Expense Item deleted successfully');
              } else {
                Alert.alert('Error', response?.message || 'Expense Item deletion failed\nExpense Item is used in Expenses');
              }
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
    Alert.alert('expenseItem Selected', `Selected: ${expenseItem.expenseName}`);
  };

  const handleOpenAddDialog = React.useCallback(() => {
    setEditingexpenseItem(null);
    setNewexpenseItem('');
    setDialogCategoryValue(null);
    setCategoryOpen(false);
    setShowAddDialog(true);
    fetchData();
  }, [fetchData]);

  const renderHeader = () => (
    <LinearGradient
      colors={['#8b5cf6', '#6d28d9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={manageStyles.gradientCard}
    >
      <View style={manageStyles.topRow}>
        <View style={manageStyles.textWrap}>
          <ThemedText style={manageStyles.title}>Expense Items</ThemedText>
          <ThemedText style={manageStyles.subtitle}>Manage your expense items</ThemedText>
        </View>
        <TouchableOpacity onPress={handleOpenAddDialog} style={manageStyles.addButton}>
          <Icon name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
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
      <InTreeDialog containerColor={palette.surface} overlayColor={OVERLAY.scrimSoft}>
        <DialogTitle color={palette.textPrimary}>
          {editingexpenseItem ? 'Edit Expense Item' : 'Add Expense Item'}
        </DialogTitle>

        {!editingexpenseItem && (
          <View style={manageStyles.dropdownContainer}>
            <FormDropdown
              open={categoryOpen} onOpenChange={setCategoryOpen}
              value={dialogCategoryValue} onChange={setDialogCategoryValue}
              items={dialogCategoryData} setItems={setDialogCategoryData}
              placeholder="Select Category"
              palette={palette} variant="dialog"
              listMode="MODAL"
              modalProps={{animationType: 'fade'}}
              modalTitle="Select Category"
              modalTitleStyle={MODAL_TITLE_STYLE}
              backgroundColor={palette.background}
              style={manageStyles.pickerFlush}
              zClosed={2000}
            />
          </View>
        )}

        <ThemedTextInput
          value={newexpenseItem}
          onChangeText={setNewexpenseItem}
          placeholder="Enter Expense Item Name"
          style={[manageStyles.dialogInput, { borderColor: palette.cardBorder, backgroundColor: palette.background, color: palette.textPrimary }]}
          editable={!dialogLoading}
        />
        <DialogFooter
          onCancel={() => {
            setShowAddDialog(false);
            setEditingexpenseItem(null);
            setNewexpenseItem('');
            setDialogCategoryValue(null);
            if (!editingexpenseItem) {
              setCategoryOpen(false);
            }
          }}
          onConfirm={editingexpenseItem ? handleupdateExpenseItem : handleAddExpenseItem}
          confirmLabel={editingexpenseItem ? 'Update' : 'Add'}
          cancelBackground={cancelBackground(isDark)}
          cancelColor={palette.textPrimary}
          confirmColor={palette.accent}
          confirmDisabled={dialogLoading}
        />
        {dialogLoading && <DialogBusy color={palette.accent} />}
      </InTreeDialog>
    )
  );

  return (
    <View style={[commonStyles.container, { backgroundColor: palette.background }]}>
      <LoaderSpinner shouldLoad={loading} />
      <View style={commonStyles.headerSection}>
        {renderHeader()}
      </View>
      <View style={manageStyles.filterSection}>
        <FormDropdown
          open={filterOpen} onOpenChange={setFilterOpen}
          value={filterValue} onChange={setFilterValue}
          items={filterCategories} setItems={setFilterCategories}
          placeholder="Filter by Category"
          palette={palette} variant="dialog"
          listMode="MODAL"
          modalProps={{animationType: 'fade'}}
          modalTitle="Filter by Category"
          backgroundColor={palette.surface}
        />
      </View>
      <View style={commonStyles.searchSection}>
        <ThemedTextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search By Expense Items or categories..."
          style={[commonStyles.searchInput, { borderColor: palette.cardBorder, backgroundColor: palette.surface, color: palette.textPrimary }]}
        />
      </View>
      <FlatList
        data={searchFilteredData}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={commonStyles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={manageStyles.emptyContainer}>
            <Icon name="shopping-bag" size={48} color={palette.emptyIcon} />
            <ThemedText style={[manageStyles.emptyText, { color: palette.textSecondary }]}>
              No Expense Item found
            </ThemedText>
          </View>
        }
      />
      {renderAddDialog()}
    </View>
  );
};

export default ProductsScreen;
