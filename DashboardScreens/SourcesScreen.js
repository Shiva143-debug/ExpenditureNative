import React, { useState, useRef, useContext } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Animated, Alert } from 'react-native';
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getDefaultSources, addDefaultSource, deleteSource } from '../services/apiService';
import { useAuth } from '../AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import LoaderSpinner from '../LoaderSpinner';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import ThemedTextInput from '../components/ThemedTextInput';

const sourcePalette = {
  light: {
    header: '#f1f5f9',
    background: '#f8fafc',
    accent: '#059669',
    accentSoft: '#a7f3d0',
    surface: '#ffffff',
    cardShadow: '#e2e8f01a',
    iconGlow: 'rgba(52, 211, 153, 0.35)',
    emptyIcon: '#64748b',
    cardBackground: '#ffffff',
    cardAccent: '#334155',
  },
  dark: {
    header: 'rgba(35, 35, 35, 0.19)',
    background: '#000000',
    accent: '#059669',
    accentSoft: '#a7f3d0',
    surface: '#000000',
    cardShadow: '#e0d9d955',
    iconGlow: 'rgba(52, 211, 153, 0.35)',
    emptyIcon: '#475569',
    cardBackground: 'rgba(255, 255, 255, 0.1)',
    cardAccent: '#e2e8f0',
  },
};

const AnimatedSourceCard = ({ item, index, onPress, onEdit, onDelete, palette }) => {
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
              <Icon name="account-balance" size={32} color={palette.cardAccent} />
            </View>
            <View style={styles.sourceDetails}>
              <ThemedText style={[styles.sourceLabel, { color: palette.cardAccent }]}>{item.source_name}</ThemedText>
              {item.user_id === 0 && (
                <ThemedText style={[styles.defaultText, { color: palette.cardAccent + '80' }]}>Default Source</ThemedText>
              )}
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

const SourcesScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSource, setNewSource] = useState('');
  const [editingSource, setEditingSource] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredSources, setFilteredSources] = useState([]);
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const palette = theme === 'dark' ? sourcePalette.dark : sourcePalette.light;

  const fetchSources = async () => {
    try {
      setLoading(true);
      const data = await getDefaultSources(id);
      setSources(data || []);
    } catch (error) {
      console.error('Error fetching sources:', error);
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSources();
    }, [id])
  );

  // Filter sources based on search text
  React.useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredSources(sources);
    } else {
      const lowerSearch = searchText.toLowerCase();
      setFilteredSources(sources.filter(item =>
        (item.source_name || '').toLowerCase().includes(lowerSearch)
      ));
    }
  }, [sources, searchText]);

  const handleAddSource = async () => {
    if (!newSource.trim()) return;

    let sourceData = { sourceName: newSource.trim(), id }
    try {
      await addDefaultSource(sourceData);
      setNewSource('');
      setShowAddDialog(false);
      fetchSources();
    } catch (error) {
      console.error('Error adding source:', error);
      Alert.alert('Error', 'Failed to add source');
    }
  };

  const handleEditSource = (source) => {
    setEditingSource(source);
    setNewSource(source.source_name);
    setShowAddDialog(true);
  };

  const handleUpdateSource = async () => {
    if (!newSource.trim() || !editingSource) return;

    // For update, we need to delete the old one and add the new one
    // since there's no update API
    try {
      await deleteSource(editingSource.id, id);
      await addDefaultSource({
        source_name: newSource.trim(),
        user_id: id
      });
      setNewSource('');
      setShowAddDialog(false);
      setEditingSource(null);
      fetchSources();
    } catch (error) {
      console.error('Error updating source:', error);
      Alert.alert('Error', 'Failed to update source');
    }
  };

  const handleDeleteSource = (source) => {
    if (source.user_id === 0) {
      Alert.alert('Cannot Delete', 'Default sources cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete Source',
      `Are you sure you want to delete "${source.source_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSource(source.id, id);
              fetchSources();
            } catch (error) {
              console.error('Error deleting source:', error);
              Alert.alert('Error', 'Failed to delete source');
            }
          }
        }
      ]
    );
  };

  const handleSourcePress = (source) => {
    // Could navigate to income filtered by this source
    // For now, just show an alert
    Alert.alert('Source Selected', `Selected: ${source.source_name}`);
  };

  const renderHeader = () => (
    <View style={[styles.headerGradient, { backgroundColor: palette.header }]}>
      <View style={styles.headerTopRow}>
        <View>
          <ThemedText style={[styles.headerTitle, { color: palette.cardAccent }]}>Income Sources</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: palette.cardAccent }]}>Manage your income sources</ThemedText>
        </View>
        <TouchableOpacity onPress={() => setShowAddDialog(true)} style={styles.addButton}>
          <Icon name="add" size={24} color={palette.cardAccent} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <AnimatedSourceCard
      item={item}
      index={index}
      onPress={() => handleSourcePress(item)}
      onEdit={handleEditSource}
      onDelete={handleDeleteSource}
      palette={palette}
    />
  );

  const renderAddDialog = () => (
    showAddDialog && (
      <View style={styles.dialogOverlay}>
        <View style={[styles.dialog, { backgroundColor: palette.surface }]}>
          <ThemedText style={styles.dialogTitle}>
            {editingSource ? 'Edit Source' : 'Add Source'}
          </ThemedText>
          <ThemedTextInput
            value={newSource}
            onChangeText={setNewSource}
            placeholder="Enter source name"
            style={styles.input}
          />
          <View style={styles.dialogButtons}>
            <TouchableOpacity
              onPress={() => {
                setShowAddDialog(false);
                setEditingSource(null);
                setNewSource('');
              }}
              style={styles.cancelButton}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={editingSource ? handleUpdateSource : handleAddSource}
              style={styles.saveButton}
            >
              <ThemedText style={styles.saveButtonText}>
                {editingSource ? 'Update' : 'Save'}
              </ThemedText>
            </TouchableOpacity>
          </View>
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
          placeholder="Search sources..."
          style={styles.searchInput}
        />
      </View>
      <FlatList
        data={filteredSources}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="account-balance" size={48} color={palette.emptyIcon} />
            <ThemedText style={styles.emptyText}>No sources found</ThemedText>
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
  searchInput: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  headerGradient: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: 'rgba(35, 35, 35, 0.19)',
    borderWidth: 1,
    borderColor: 'rgba(35, 35, 35, 0.3)',
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
  sourceDetails: {
    flex: 1,
  },
  sourceLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  defaultText: {
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
    borderColor: '#059669',
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
    borderColor: 'rgba(35, 35, 35, 0.3)',
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
});

export default SourcesScreen;