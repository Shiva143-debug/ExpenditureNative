import React, { useEffect, useState } from "react";
import ThemedText from "../components/ThemedText";
import ThemedView from "../components/ThemedView";
import ThemedTextInput from "../components/ThemedTextInput";
import ThemedTextAreaInput from "../components/ThemedTextAreaInput";
import { getSavingsData, deleteSaving, addSaving } from "../services/apiService";
import { StyleSheet, FlatList, View, TouchableOpacity, Alert, Modal, Platform } from "react-native";
import { useAuth } from "../AuthContext";
import LoaderSpinner from "../LoaderSpinner";
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";

const SavingsList = () => {
    const { id } = useAuth();
    const [savings, setSavings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState('');

    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

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
        <ThemedView style={styles.headerContainer}>
            <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.headerGradient}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTitleContainer}>
                        <ThemedText style={styles.headerTitle}>Savings List</ThemedText>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Icon name="add-circle" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerAmount}>
                        <ThemedText style={styles.totalLabel}>Total Savings</ThemedText>
                        <ThemedText style={styles.totalAmount}> ₹{totalSavings.toLocaleString()}</ThemedText>
                    </View>
                </View>
            </LinearGradient>
        </ThemedView>
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

    const renderItem = ({ item }) => (
        <ThemedView style={styles.card}>
            <ThemedView style={styles.cardInner}>
                <View style={styles.cardTopRow}>
                    <ThemedText style={styles.dateText}>{item.date}</ThemedText>
                    <ThemedText style={styles.amountText}>₹{parseFloat(item.amount).toLocaleString()}</ThemedText>
                </View>
                <View style={styles.cardTopRow}>
                    {item.note ? (<ThemedText style={styles.noteText}>{item.note}</ThemedText>) : null}
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => console.log('Edit')}>
                            <Icon name="edit" size={20} color="#4CAF50" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => onDeleteSaving(item.id)}>
                            <Icon name="delete" size={20} color="#F44336" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ThemedView>
        </ThemedView>
    );


    return (
        <ThemedView style={styles.container}>
            <Toast />
            <LoaderSpinner shouldLoad={loading} />
            <View style={styles.headerSection}>
                {renderHeader()}
            </View>
            <FlatList data={savings} keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false} />

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
                                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
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
    listContainer: {
        padding: 15,
        paddingTop: 5,
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
    headerSection: {
        // paddingTop: 5,
        zIndex: 1,
        height: 100,
        marginBottom: 5,
    },
    headerContainer: {
        height: 50,
    },
    headerGradient: {
        borderRadius: 15,
        margin: 15,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        height: '100%',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
        marginRight: 10,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    headerAmount: {
        alignItems: 'flex-end',
        paddingRight: 5,
    },
    totalLabel: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 4,
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },

    card: {
        marginTop: 5,
        marginBottom: 10,
        borderRadius: 12,
    },

    cardInner: {
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    sourceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    textContainer: {
        flex: 1,
    },
    amountContainer: {
        paddingLeft: 15,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 12,
    },
    noData: {
        fontSize: 16,
        color: "#666",
        marginTop: 20,
    },
    list: {
        paddingBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
    },
    amount: {
        fontSize: 16,
        color: "#007AFF",
        marginTop: 4,
    },
    date: {
        fontSize: 14,
        color: "#888",
        marginTop: 2,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 14,
    },
    amountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    noteText: {
        fontSize: 15,
        marginTop: 4,
        lineHeight: 20,
        maxWidth: '70%',
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
        backgroundColor: 'red',
    },
    addButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        fontSize: 16,
    },
    addButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default SavingsList;
