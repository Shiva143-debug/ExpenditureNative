import React, { useEffect, useState, useRef, useContext } from "react";
import ThemedText from "../components/ThemedText";
import ThemedView from "../components/ThemedView";
import ThemedTextInput from "../components/ThemedTextInput";
import ThemedTextAreaInput from "../components/ThemedTextAreaInput";
import { getSavingsData, deleteSaving, addSaving } from "../services/apiService";
import { StyleSheet, FlatList, View, TouchableOpacity, Alert, Modal, Platform, Animated, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import LoaderSpinner from "../LoaderSpinner";
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import { ThemeContext } from "../context/ThemeContext";

const savingsPalette = {
  light: {
    header: ['#cffafe', '#a5f3fc'],
    accent: '#0e4f5f',
    accentSoft: '#4a9ca7',
    surface: '#ecfeff',
    cardShadow: '#00000022',
    iconGlow: 'rgba(14, 79, 95, 0.28)',
    emptyIcon: '#94a3b8',
    cardGradient: ['#4a9ca7', '#3d8db3ff'],
    cardAccent: '#0f172a',
  },
  dark: {
    header: ['#0f172a', '#0e7490'],
    accent: '#38bdf8',
    accentSoft: '#67e8f9',
    surface: '#071524',
    cardShadow: '#00000055',
    iconGlow: 'rgba(56, 189, 248, 0.35)',
    emptyIcon: '#475569',
    cardGradient: ['#0f172a', '#0e7490'],
    cardAccent: '#e2e8f0',
  },
};

const AnimatedSavingsCard = ({ item, index, onDelete, onEdit, palette }) => {
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
    ]).start(() => onDelete?.(item.id));
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

  return (
    <Animated.View style={[{ transform: [{ translateY }], opacity: opacityAnim }]}>    
      <LinearGradient colors={palette.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.cardWrapper, { shadowColor: palette.cardShadow }]}> 
        <TouchableOpacity activeOpacity={0.82} onPress={() => onEdit?.(item)} style={styles.gradientTouchable}>
          <View style={styles.cardContent}>
            <View style={styles.leftSection}>
              <View style={[styles.iconBadge, { backgroundColor: `${palette.cardAccent}22` }]}>
                <Icon name="savings" size={32} color={palette.cardAccent} />
              </View>
              <View style={styles.savingDetails}>
                <ThemedText style={[styles.savingLabel, { color: palette.cardAccent }]}>
                  {item.note || 'Savings'}
                </ThemedText>
                <View style={styles.dateRow}>
                  <Icon name="event" size={13} color={`${palette.cardAccent}cc`} />
                  <Text style={[styles.dateValue, { color: `${palette.cardAccent}cc` }]}> {item.date}</Text>
                </View>
              </View>
            </View>
            <View style={styles.rightSection}>
              <ThemedText style={[styles.amountValue, { color: palette.cardAccent }]}>
                ₹{parseFloat(item.amount).toLocaleString('en-IN')}
              </ThemedText>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                  <Animated.View style={[{ transform: [{ scale: editScaleAnim }] }] }>
                    <Icon name="edit" size={18} color={palette.cardAccent} />
                  </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                  <Animated.View style={[{ transform: [{ scale: deleteScaleAnim }] }] }>
                    <Icon name="delete" size={18} color="#dc2626" />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

const SavingsList = () => {
    const { id } = useAuth();
    const { theme } = useContext(ThemeContext);
    const [savings, setSavings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredSavings, setFilteredSavings] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState('');
    const palette = theme === 'dark' ? savingsPalette.dark : savingsPalette.light;

    const [showDatePicker, setShowDatePicker] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [id])
    );

    // Filter savings based on search text
    React.useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredSavings(savings);
        } else {
            const lowerSearch = searchText.toLowerCase();
            setFilteredSavings(savings.filter(item =>
                (item.note || '').toLowerCase().includes(lowerSearch) ||
                (item.amount || '').toString().includes(lowerSearch)
            ));
        }
    }, [savings, searchText]);

    const fetchData = async () => {
        setLoading(true)
        const data = await getSavingsData(id);
        setSavings(data || []);
        setLoading(false);
    };


    const handleDateChange = (_, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setDate(formattedDate);
        }
    };

    const handleAddSaving = async () => {
        // Validate required fields
        if (!amount) {
            Toast.show({ type: "error", text1: "Validation Error", text2: "Please Enter Amount", position: "top" });
            return;
        }

        else if (!date) {
            Toast.show({ type: "error", text1: "Validation Error", text2: "Please select a date", position: "top" });
            return;
        }

        try {
            setLoading(true);
            const savingData = { id,amount, date, note};
            await addSaving(savingData);
            Toast.show({
                type: "success", text1: "Success", text2: "Saving Data added successfully", position: "top", visibilityTime: 3000, autoHide: true
            });

        } catch (error) {
            console.error('Error submitting Saving Data:', error);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to add Saving Data", position: "top" });
        } finally {
            setLoading(false);
            handleClear();
             setModalVisible(false);
            await fetchData();
        }
    };


    const handleClear = () => {
        setAmount("");
        setNote("");
        setDate('');

    }
    const totalSavings = savings.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    const renderHeader = () => (
        <LinearGradient colors={palette.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
          <View style={styles.headerTopRow}>
            <View>
              <ThemedText style={[styles.headerTitle, { color: palette.accent }]}>Savings</ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: palette.accentSoft }]}>Manage your savings</ThemedText>
            </View>
            <Icon name="savings" size={40} color={palette.accent} />
          </View>
          <View style={[styles.totalCard, { backgroundColor: palette.iconGlow }]}>
            <View style={styles.totalCardContent}>
              <View>
                <ThemedText style={[styles.totalLabel, { color: palette.accentSoft }]}>Total Savings</ThemedText>
                <ThemedText style={[styles.totalAmount, { color: palette.accent }]}>₹{totalSavings.toLocaleString('en-IN')}</ThemedText>
              </View>
              <TouchableOpacity
                style={styles.addButtonHeader}
                onPress={() => setModalVisible(true)}
              >
                <Icon name="add-circle" size={48} color={palette.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
    );

    const onDeleteSaving = (savingId) => {
        Alert.alert(
            "Delete Saving",
            "Are you sure you want to delete this saving?",
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
                            await deleteSaving(savingId, id);
                            // After successful deletion, refresh the savings list
                            await fetchData();
                            Alert.alert("Success", "Saving deleted successfully");
                        } catch (error) {
                            console.error("Error deleting saving:", error);
                            Alert.alert("Error", "Failed to delete saving");
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

    const onEditSaving = (item) => {
        console.log('Edit saving:', item);
    };

    const renderItem = ({ item, index }) => (
        <AnimatedSavingsCard  item={item} 
            index={index} onDelete={onDeleteSaving} onEdit={onEditSaving} palette={palette}
        />
    );


    return (
        <ThemedView style={[styles.container, { backgroundColor: palette.surface }]}>
            <Toast />
            <LoaderSpinner shouldLoad={loading} />
            <View style={styles.headerSection}>
                {renderHeader()}
            </View>
            <View style={styles.searchSection}>
                <ThemedTextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search notes or amounts..."
                    style={styles.searchInput}
                />
            </View>
            <FlatList
                data={filteredSavings}  keyExtractor={(item) => item.id.toString()} renderItem={renderItem} 
                contentContainerStyle={styles.listContainer}  showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="savings" size={48}  />
                        <ThemedText style={styles.emptyText}>No savings yet</ThemedText>
                    </View>
                }
            />

            {/* Add Saving Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <ThemedView style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Add New Saving</ThemedText>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        <ThemedText style={styles.inputLabel}>Amount (₹)</ThemedText>
                        <ThemedTextInput style={styles.input} placeholder="Enter amount" keyboardType="numeric" value={amount} onChangeText={(text) => setAmount(text)} />


                        <ThemedText style={styles.inputLabel}>Select Date:</ThemedText>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                            <ThemedText style={styles.dateButtonText}>
                                {date ? date : 'Select Date'}
                            </ThemedText>
                        </TouchableOpacity>


                        {showDatePicker && (
                            <DateTimePicker value={date ? new Date(date) : new Date()}
                                mode="date" display="default" onChange={handleDateChange} />
                        )}
                        <ThemedText style={styles.inputLabel}>Note (Optional)</ThemedText>
                        <ThemedTextAreaInput style={styles.textArea} placeholder="Add a note about this saving" value={note} onChangeText={(text) => setNote(text)} />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClear}>
                                <ThemedText style={styles.buttonText}>Clear</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleAddSaving} >
                                <ThemedText style={styles.addButtonText}>Add </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </ThemedView>
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
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        fontWeight: '500',
    },
    totalCard: {
        borderRadius: 14,
        padding: 16,
    },
    totalCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 6,
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: '700',
    },
    addButtonHeader: {
        justifyContent: 'center',
        alignItems: 'center',
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
    gradientTouchable: {
        flex: 1,
        borderRadius: 16,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
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
        color:"#ffffff"
    },
    savingDetails: {
        flex: 1,
    },
    savingLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
    dateButton: {
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 20,
    },
    dateButtonText: {
        fontSize: 16,
        textAlign: 'center',
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
});

export default SavingsList;
