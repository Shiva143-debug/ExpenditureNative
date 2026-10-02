import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, FlatList, TouchableOpacity, Animated, Alert} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import ThemedText from './ThemedText';
import ThemedTextInput from './ThemedTextInput';
import LoaderSpinner from './LoaderSpinner';
import DefaultLockInfo from './DefaultLockInfo';
import InTreeDialog, {DialogTitle, DialogFooter, DialogBusy} from './InTreeDialog';

import {useTheme} from '../theme/useTheme';
import {cancelBackground} from '../theme/colors';
import {commonStyles, manageStyles} from '../styles';

/**
 * Generic "manage a simple named list" screen.
 *
 * Categories and Income Sources were two ~530 line files that differed only in
 * their accent colours, copy, icon lookup and four small style choices. This
 * keeps the shared shell (header, search, animated card, in-tree add/edit
 * dialog, delete confirmation) in one place.
 *
 * Every visual difference between the two originals is an explicit prop below,
 * so nothing is silently normalised.
 */
const ManageListScreen = ({
  // -- accent / header ----------------------------------------------------
  /** Key into `SCREEN_ACCENTS`, e.g. 'categories' or 'sources'. */
  accentKey,
  /** Two-stop header gradient, e.g. ['#fb923c', '#ea580c']. */
  headerGradient,
  title,
  subtitle,

  // -- copy ---------------------------------------------------------------
  searchPlaceholder,
  emptyIcon,
  emptyLabel,
  addTitle,
  editTitle,
  confirmAddLabel = 'Add',
  confirmEditLabel = 'Update',
  lockedMessage,
  deleteTitle,
  deleteMessage,
  /** Item field to search / display. */
  getLabel,
  getIcon,
  iconSize = 32,
  /** Sources render a "Default Source" chip; categories do not. */
  showDefaultChip = false,
  defaultChipLabel = 'Default Source',

  // -- per-screen style opt-outs (preserved original differences) ----------
  /** Categories' label has no bottom margin; sources' has 6. */
  labelStyle,
  /** Categories hard-coded the empty text colour instead of using the palette. */
  emptyTextColor,
  /** Sources coloured the dialog's Cancel label from the palette. */
  cancelTextFromPalette = false,
  /** Sources coloured the dialog title from the palette. */
  titleFromPalette = false,
  /** Sources tinted the dialog input background from the palette. */
  inputBackgroundFromPalette = false,
  inputPlaceholder,
  dialogInputStyle,

  // -- data / actions -----------------------------------------------------
  fetchItems,
  /** `(trimmedName) => payload` for the create call. */
  createPayload,
  /** `(item, trimmedName) => Promise` for the update call. */
  onUpdate,
  onRemove,
  onSelect,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  const {palette: themePalettes, isDark} = useTheme();
  const palette = themePalettes.screen(accentKey);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchItems();
      setItems(response?.data || []);
    } catch (error) {
      console.error(`Error fetching ${title.toLowerCase()}:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchItems, title]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredItems(items);
    } else {
      const needle = searchText.toLowerCase();
      setFilteredItems(items.filter(item => (getLabel(item) || '').toLowerCase().includes(needle)));
    }
  }, [items, searchText, getLabel]);

  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingItem(null);
    setDraftName('');
  };

  const handleCreate = async () => {
    if (!draftName.trim()) return;
    try {
      setDialogLoading(true);
      const response = await createPayload(draftName.trim());
      if (response?.status) {
        closeDialog();
        load();
        Alert.alert('Success', response.message || `${title} added successfully`);
      } else {
        Alert.alert('Error', response?.message || `Failed to add ${title.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Error adding ${title.toLowerCase()}:`, error);
      Alert.alert('Error', `Failed to add ${title.toLowerCase()}`);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!draftName.trim() || !editingItem) return;
    try {
      setDialogLoading(true);
      const response = await onUpdate(editingItem, draftName.trim());
      if (response?.status) {
        closeDialog();
        load();
        Alert.alert('Success', response.message || `${title} updated successfully`);
      } else {
        Alert.alert('Error', response?.message || `Failed to update ${title.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Error updating ${title.toLowerCase()}:`, error);
      Alert.alert('Error', `Failed to update ${title.toLowerCase()}`);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleRemove = item => {
    const label = getLabel(item);
    Alert.alert(deleteTitle, deleteMessage(label), [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await onRemove(item);
            if (response?.status) {
              load();
              Alert.alert('Success', response.message || `${title} deleted successfully`);
            } else {
              Alert.alert('Error', response?.message || `Failed to delete ${title.toLowerCase()}`);
            }
          } catch (error) {
            console.error(`Error deleting ${title.toLowerCase()}:`, error);
            Alert.alert('Error', `Failed to delete ${title.toLowerCase()}`);
          }
        },
      },
    ]);
  };

  const handleEdit = item => {
    setEditingItem(item);
    setDraftName(getLabel(item));
    setShowAddDialog(true);
  };

  return (
    <View style={[commonStyles.container, {backgroundColor: palette.background}]}>
      <LoaderSpinner shouldLoad={loading} />

      <View style={commonStyles.headerSection}>
        <LinearGradient
          colors={headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={manageStyles.gradientCard}>
          <View style={manageStyles.topRow}>
            <View style={manageStyles.textWrap}>
              <ThemedText style={manageStyles.title}>{title}</ThemedText>
              <ThemedText style={manageStyles.subtitle}>{subtitle}</ThemedText>
            </View>
            <TouchableOpacity onPress={() => setShowAddDialog(true)} style={manageStyles.addButton}>
              <Icon name="add" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={commonStyles.searchSection}>
        <ThemedTextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder={searchPlaceholder}
          style={[
            commonStyles.searchInput,
            {borderColor: palette.cardBorder, backgroundColor: palette.surface, color: palette.textPrimary},
          ]}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({item, index}) => (
          <ManageRow
            item={item}
            index={index}
            palette={palette}
            getLabel={getLabel}
            getIcon={getIcon}
            iconSize={iconSize}
            showDefaultChip={showDefaultChip}
            defaultChipLabel={defaultChipLabel}
            lockedMessage={lockedMessage}
            labelStyle={labelStyle}
            onPress={onSelect}
            onEdit={handleEdit}
            onDelete={handleRemove}
          />
        )}
        contentContainerStyle={commonStyles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={manageStyles.emptyContainer}>
            <Icon name={emptyIcon} size={48} color={palette.emptyIcon} />
            <ThemedText
              style={[
                manageStyles.emptyText,
                emptyTextColor ? {color: emptyTextColor} : {color: palette.textSecondary},
              ]}>
              {emptyLabel}
            </ThemedText>
          </View>
        }
      />

      <InTreeDialog visible={showAddDialog} containerColor={palette.surface}>
        <DialogTitle color={titleFromPalette ? palette.textPrimary : undefined}>
          {editingItem ? editTitle : addTitle}
        </DialogTitle>
        <ThemedTextInput
          value={draftName}
          onChangeText={setDraftName}
          placeholder={inputPlaceholder}
          editable={!dialogLoading}
          style={[
            manageStyles.dialogInput,
            dialogInputStyle,
            {
              borderColor: palette.cardBorder,
              color: palette.textPrimary,
              backgroundColor: inputBackgroundFromPalette ? palette.background : undefined,
            },
          ]}
        />
        <DialogFooter
          onCancel={closeDialog}
          onConfirm={editingItem ? handleUpdate : handleCreate}
          confirmLabel={editingItem ? confirmEditLabel : confirmAddLabel}
          cancelBackground={cancelBackground(isDark)}
          cancelColor={cancelTextFromPalette ? palette.textPrimary : undefined}
          confirmColor={palette.accent}
          confirmDisabled={dialogLoading}
        />
        {dialogLoading && <DialogBusy color={palette.accent} />}
      </InTreeDialog>
    </View>
  );
};

/** Single animated row: icon badge, label, optional default chip, actions. */
const ManageRow = ({
  item,
  index,
  palette,
  getLabel,
  getIcon,
  iconSize,
  showDefaultChip,
  defaultChipLabel,
  lockedMessage,
  labelStyle,
  onPress,
  onEdit,
  onDelete,
}) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const isDefault = item.userId === 0;

  useFocusEffect(
    useCallback(() => {
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
    }, [index, opacityAnim, translateY]),
  );

  return (
    <Animated.View
      style={[
        {transform: [{translateY}], opacity: opacityAnim},
        manageStyles.card,
        {backgroundColor: palette.cardBackground, shadowColor: palette.cardShadow},
      ]}>
      <TouchableOpacity activeOpacity={0.82} onPress={() => onPress(item)}>
        <View style={manageStyles.cardContent}>
          <View style={manageStyles.leftSection}>
            <View style={[manageStyles.iconBadge, {backgroundColor: `${palette.cardAccent}22`}]}>
              <Icon name={getIcon(item)} size={iconSize} color={palette.cardAccent} />
            </View>
            <View style={manageStyles.labelWrap}>
              <ThemedText style={[manageStyles.label, labelStyle, {color: palette.textPrimary}]}>
                {getLabel(item)}
              </ThemedText>
              {showDefaultChip && isDefault && (
                <View style={[manageStyles.defaultChip, {backgroundColor: `${palette.cardAccent}18`}]}>
                  <ThemedText style={[manageStyles.defaultText, {color: palette.cardAccent}]}>
                    {defaultChipLabel}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={manageStyles.rightSection}>
            {isDefault ? (
              <DefaultLockInfo palette={palette} message={lockedMessage} />
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

export default ManageListScreen;
