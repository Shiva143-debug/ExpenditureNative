import React, { useEffect, useState, useRef } from "react";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedTextAreaInput from "../../components/ThemedTextAreaInput";
import { StyleSheet, FlatList, View, TouchableOpacity, Alert, Modal, Animated, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import LoaderSpinner from "../../components/LoaderSpinner";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import { useTheme } from "../../theme/useTheme";
import { getSavingsData, deleteSaving, updateSavings } from "../../services/apiService";
import { LIST_HEADER_GRADIENTS } from "../../theme/palettes";
import { dateKeyToLocal, formatDateKey, toDateKey } from "../../utils/format";
import { cancelBackground } from "../../theme/colors";

const HEADER_GRADIENT_DARK = LIST_HEADER_GRADIENTS.savingsDark;

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

    const formattedDate = formatDateKey(item.date);

    return (
        <Animated.View style={[{ transform: [{ translateY }], opacity: opacityAnim }]}>
            <View style={[styles.cardWrapper, { backgroundColor: palette.cardBackground, borderColor: palette.cardBorder, shadowColor: palette.cardShadow }]}>
                <TouchableOpacity activeOpacity={0.82} onPress={() => onEdit?.(item)} style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                        <View style={[styles.iconBadge, { backgroundColor: palette.iconBackground(0.18) }]}>
                            <Icon name="savings" size={26} color={palette.accent} />
                        </View>
                        <View style={styles.savingDetails}>
                            <ThemedText style={[styles.amountValue, { color: palette.textPrimary }]}>
                                ₹{parseFloat(item.amount).toLocaleString('en-IN')}
                            </ThemedText>
                            <View style={styles.dateRow}>
                                <Icon name="event" size={13} color={palette.textSecondary} />
                                <Text style={[styles.dateValue, { color: palette.textSecondary }]}>{formattedDate}</Text>
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
                    {item.note ? (
                        <View style={[styles.noteDivider, { borderTopColor: palette.cardBorder }]}>
                            <ThemedText style={[styles.savingLabel, { color: palette.textSecondary }]} numberOfLines={2}>
                                Notes: {item.note}
                            </ThemedText>
                        </View>
                    ) : null}
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const SavingsList = () => {
    const { palette: themePalettes, isDark } = useTheme();
    const [savings, setSavings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredSavings, setFilteredSavings] = useState([]);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState('');
    const palette = themePalettes.list.savings;

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingSaving, setEditingSaving] = useState(null);
    const [dialogLoading, setDialogLoading] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
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
        setLoading(true);
        const response = await getSavingsData();
        setSavings(response?.data || []);
        setLoading(false);
    };

    const handleDateChange = (_, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(toDateKey(selectedDate));
        }
    };

    const totalSavings = filteredSavings.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const renderHeader = () => {
    const headerColors = {
      gradient: HEADER_GRADIENT_DARK,
      title: '#ffffff',
      sub: 'rgba(255,255,255,0.85)',
      decor: 'rgba(255,255,255,0.08)',
      avatarBg: 'rgba(255,255,255,0.22)',
      totalBg: 'rgba(255,255,255,0.16)',
    };

    return (
      <LinearGradient colors={headerColors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
        <Icon name="savings" size={130} color={headerColors.decor} style={styles.headerDecor} />
        <View style={styles.headerTopRow}>
          <View style={styles.headerTextWrap}>
            <ThemedText style={[styles.headerTitle, { color: headerColors.title }]}>Savings</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: headerColors.sub }]}>Manage your savings</ThemedText>
          </View>
          <View style={[styles.headerAvatar, { backgroundColor: headerColors.avatarBg }]}>
            <Icon name="savings" size={24} color={headerColors.title} />
          </View>
        </View>
        <View style={[styles.totalCard, { backgroundColor: headerColors.totalBg }]}>
          <ThemedText style={[styles.totalLabel, { color: headerColors.sub }]}>Total Savings</ThemedText>
          <ThemedText style={[styles.totalAmount, { color: headerColors.title }]}>₹{totalSavings.toLocaleString('en-IN')}</ThemedText>
        </View>
      </LinearGradient>
    );
  };

    const onDeleteSaving = (savingId) => {
        Alert.alert(
            "Delete Saving",
            "Are you sure you want to delete this saving?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const response = await deleteSaving(savingId);
                            if (response?.status) {
                                await fetchData();
                                Alert.alert("Success", response.message || "Saving deleted successfully");
                            } else {
                                Alert.alert("Error", response?.message || "Failed to delete saving");
                            }
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

    const onUpdateSavings = (item) => {
        setEditingSaving(item);
        setAmount(item.amount.toString());
        setNote(item.note || '');
        setDate(toDateKey(item.date));
        setEditModalVisible(true);
    };

    const handleUpdateSavings = async () => {
        if (!editingSaving || !amount || !date) {
            Toast.show({
                type: "error",
                text1: "Validation Error",
                text2: "Amount and Date are required",
                position: "top"
            });
            return;
        }

        try {
            setDialogLoading(true);

            const response = await updateSavings(editingSaving.id, {
                amount,
                date,
                note
            });

            if (response?.status) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: response.message || "Savings updated successfully",
                    position: "top"
                });

                setEditModalVisible(false);
                setEditingSaving(null);
                await fetchData();
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: response?.message || "Failed to update savings",
                    position: "top"
                });
            }
        } catch (error) {
            console.error("Error updating savings:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to update savings",
                position: "top"
            });
        } finally {
            setDialogLoading(false);
        }
    };

    const renderItem = ({ item, index }) => (
        <AnimatedSavingsCard
            item={item}
            index={index}
            onDelete={onDeleteSaving}
            onEdit={onUpdateSavings}
            palette={palette}
        />
    );

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient colors={palette.background} style={StyleSheet.absoluteFillObject} />
            <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
                <Toast />
                <LoaderSpinner shouldLoad={loading} />
                <View style={styles.headerSection}>
                    {renderHeader()}
                </View>
                <View style={styles.searchSection}>
                    <ThemedTextInput
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Search note,amount..."
                        style={[styles.searchInput, { borderColor: palette.cardBorder, backgroundColor: palette.cardBackground, color: palette.textPrimary }]}
                    />
                </View>
                <FlatList
                    data={filteredSavings}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="savings" size={48} color={palette.emptyIcon} />
                            <ThemedText style={[styles.emptyText, { color: palette.textSecondary }]}>No savings Found</ThemedText>
                        </View>
                    }
                />

                {/* Edit Saving Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={editModalVisible}
                    onRequestClose={() => setEditModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: palette.dialogBackground }]}>
                            <View style={styles.modalHeader}>
                                <ThemedText style={[styles.modalTitle, { color: palette.textPrimary }]}>Edit Saving</ThemedText>
                                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                    <Icon name="close" size={24} color={palette.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ThemedText style={[styles.inputLabel, { color: palette.textPrimary }]}>Amount (₹)</ThemedText>
                            <ThemedTextInput
                                style={[styles.input, { borderColor: palette.cardBorder, backgroundColor: palette.pickerBackground, color: palette.textPrimary }]}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />

                            <ThemedText style={[styles.inputLabel, { color: palette.textPrimary }]}>Select Date</ThemedText>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={[styles.dateButton, { borderColor: palette.cardBorder }]}
                            >
                                <Text style={[styles.dateButtonText, { color: palette.textPrimary }]}>
                                    {formatDateKey(date) || 'Select Date'}
                                </Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={dateKeyToLocal(date) || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                />
                            )}

                            <ThemedText style={[styles.inputLabel, { color: palette.textPrimary }]}>Note (Optional)</ThemedText>
                            <ThemedTextAreaInput
                                style={[styles.textArea, { borderColor: palette.cardBorder, backgroundColor: palette.pickerBackground, color: palette.textPrimary }]}
                                value={note}
                                onChangeText={setNote}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton, { backgroundColor: cancelBackground(isDark) }]}
                                    onPress={() => setEditModalVisible(false)}
                                >
                                    <Text style={[styles.buttonText, { color: palette.textPrimary }]}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.addButton, { backgroundColor: palette.accent }]}
                                    onPress={handleUpdateSavings}
                                    disabled={dialogLoading}
                                >
                                    <Text style={styles.addButtonText}>
                                        {dialogLoading ? "Updating..." : "Update"}
                                    </Text>
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
    headerSubtitle: {
        fontSize: 13.5,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '500',
        marginTop: 4,
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
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    savingDetails: {
        flex: 1,
    },
    savingLabel: {
        fontSize: 12.5,
        fontWeight: '500',
    },
    noteLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 3,
    },
    noteDivider: {
        borderTopWidth: 1,
        paddingTop: 8,
        marginTop: 10,
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
    amountValue: {
        fontSize: 17,
        fontWeight: '700',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 6,
        marginLeft: 8,
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
    input: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },
    textArea: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        minHeight: 70,
        textAlignVertical: 'top',
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

export default SavingsList;
