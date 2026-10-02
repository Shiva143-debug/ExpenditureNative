import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { request, PERMISSIONS } from 'react-native-permissions';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import Toast from "react-native-toast-message";
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from "@react-navigation/native";
import LoaderSpinner from "../../components/LoaderSpinner";
import { useTheme } from "../../theme/useTheme";
import ThemedTextAreaInput from "../../components/ThemedTextAreaInput";
import FormDropdown from '../../components/FormDropdown';
import { inputStyles as formStyles } from '../../styles';
import { getCategories,getExpenseItemsByCategory, addCategory, addExpenseItem, addExpense } from "../../services/apiService";

const Expense = () => {
    const { palette: themePalettes } = useTheme();
    const palette = themePalettes.form;
    const [visible, setVisible] = useState(false);
    const [ExpenseItemVisible, setExpenseItemVisible] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(false);

    // Loading states
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingExpenseItem, setIsAddingExpenseItem] = useState(false);
    const [isAddingExpense, setIsAddingExpense] = useState(false);

    // New state variables for modals
    const [newCategory, setNewCategory] = useState("");
    const [newExpenseItem, setNewExpenseItem] = useState("");

    // Form Fields
    const [cost, setCost] = useState("");
    const [purchaseDate, setPurchaseDate] = useState('');
    const [description, setDescription] = useState("");
    const [taxPercentage, setTaxPercentage] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [taxAmount, setTaxAmount] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);

    // Dropdowns
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [categoryValue, setCategoryValue] = useState("");
    const [categoryData, setCategoryData] = useState([]);

    const [ExpenseItemOpen, setExpenseItemOpen] = useState(false);
    const [ExpenseItemValue, setExpenseItemValue] = useState("");
    const [ExpenseItemData, setExpenseItemData] = useState([]);

    // Replace taxDropOpen and isTaxApplicableValue with a single switch state
    const [isTaxApplicable, setIsTaxApplicable] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            // Reset all form fields and dropdowns when screen comes into focus
            setCategoryOpen(false);
            setExpenseItemOpen(false);
            setCategoryValue("");
            setExpenseItemValue("");
            setCost("");
            setPurchaseDate("");
            setDescription("");
            setTaxPercentage("");
            setTaxAmount("");
            setSelectedImage(null);
            setIsTaxApplicable(false);
            return () => { };
        }, [])
    );


    // Modal visibility handlers
    const hideAddCategoryDialog = () => {
        setVisible(false);
        setNewCategory("");
    };

    const hideaddExpenseItemDialog = () => {
        setExpenseItemVisible(false);
        setNewExpenseItem("");
    };

    // Submit handlers for new category and ExpenseItem
    const handleCategorySubmit = async () => {
        if (!newCategory.trim()) {
            Toast.show({ type: "error", text1: "Error", text2: "Please enter a category name", position: "top", visibilityTime: 3000 });
            return;
        }

        try {
            setIsAddingCategory(true);
            const response = await addCategory(newCategory);

            if (response?.status) {
                Toast.show({
                    type: "success", text1: "Success", text2: response.message || "Category added successfully", position: "top", visibilityTime: 3000
                });
                setRefreshFlag(prev => !prev);
                hideAddCategoryDialog();
            } else {
                Toast.show({ type: "error", text1: "Error", text2: response?.message || "Failed to add category", position: "top", visibilityTime: 3000 });
            }
        } catch (error) {
            console.error('Error adding category:', error);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to add category", position: "top", visibilityTime: 3000 });
        } finally {
            setIsAddingCategory(false);
        }
    };

    const handleExpenseItemSubmit = async () => {
        if (!newExpenseItem.trim()) {
            Toast.show({ type: "error", text1: "Error", text2: "Please enter a ExpenseItem name", position: "top", visibilityTime: 3000 });
            return;
        }

        if (!categoryValue) {
            Toast.show({ type: "error", text1: "Error", text2: "Please select a category", position: "top", visibilityTime: 3000 });
            return;
        }

        try {
            setIsAddingExpenseItem(true);
            const response = await addExpenseItem(categoryValue, newExpenseItem);

            if (response?.status) {
                Toast.show({ type: "success", text1: "Success", text2: response.message || "Expense Item added successfully", position: "top", visibilityTime: 3000 });
                setRefreshFlag(prev => !prev);
                hideaddExpenseItemDialog();
            } else {
                Toast.show({ type: "error", text1: "Error", text2: response?.message || "Failed to add Expense Item", position: "top", visibilityTime: 3000 });
            }
        } catch (error) {
            console.error('Error adding Expense Item:', error);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to add Expense Item", position: "top", visibilityTime: 3000 });
        } finally {
            setIsAddingExpenseItem(false);
        }
    };

    // Permission and Initial Setup
    useEffect(() => {
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        if (Platform.OS !== 'android') return;
        try {
            // On Android 13+ (API 33+) READ_EXTERNAL_STORAGE is removed and the
            // image picker uses the system photo picker, so no permission is needed.
            if (Number(Platform.Version) >= 33) return;
            const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
            console.log('Permission result:', result);
        } catch (error) {
            console.error('Permission error:', error);
        }
    };

    useEffect(() => {
        getCategoriesData();
    }, [refreshFlag])

    // Fetch Categories
    const getCategoriesData = async () => {
        try {
            const response = await getCategories();
            if (response?.status) {
                const data = response.data;
                if (data) {
                    const transformedData = data.map(item => ({
                        label: item.category,
                        value: item.id,
                        key: item.id.toString()
                    }));
                    setCategoryData(transformedData);
                    console.log('Categories fetched successfully.');
                }
            } else {
                Toast.show({ type: "error", text1: "Error", text2: response?.message || "Failed to load categories", position: "top", visibilityTime: 3000 });
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to load categories", position: "top", visibilityTime: 3000 });
        }
    };

    // Fetch ExpenseItems when category changes
    useEffect(() => {
        const getExpenseItemsByCategoryData = async () => {
            if (!categoryValue) return;

            try {
                // Use the imported getExpenseItemsByCategory function from apiService
                const response = await getExpenseItemsByCategory(categoryValue);

                if (response?.status) {
                    const data = response.data;
                    if (data) {
                        const transformedData = data.map(item => ({
                            label: item.expenseName,
                            value: item.id,
                            key: item.id.toString()
                        }));
                        setExpenseItemData(transformedData);
                    }
                } else {
                    Toast.show({ type: "error", text1: "Error", text2: response?.message || "Failed to load ExpenseItems", position: "top", visibilityTime: 3000 });
                }
            } catch (error) {
                console.error('Error fetching ExpenseItems:', error);
                Toast.show({ type: "error", text1: "Error", text2: "Failed to load ExpenseItems", position: "top", visibilityTime: 3000 });
            }
        };

        getExpenseItemsByCategoryData();
    }, [categoryValue, refreshFlag]);

    const handleImagePicker = () => {
        launchImageLibrary({
            mediaType: 'photo', includeBase64: true,
            maxHeight: 800, maxWidth: 800, quality: 0.7,
        }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.error('ImagePicker Error:', response.errorMessage);
                Toast.show({ type: "error", text1: "Error", text2: "Failed to pick image", position: "top" });
            } else {
                setSelectedImage(response.assets[0].base64);
            }
        });
    };

    const handleDateChange = (_, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setPurchaseDate(selectedDate.toISOString().split('T')[0]);
        }
    };

    const handleTaxPercentageChange = (value) => {
        setTaxPercentage(value);
        if (value && cost) {
            const calculatedTax = (parseFloat(cost) * (parseFloat(value) / 100)).toFixed(2);
            setTaxAmount(calculatedTax);
        }
    };

    const handleTaxToggle = (value) => {
        setIsTaxApplicable(value);
        if (!value) {
            setTaxPercentage("");
            setTaxAmount("");
        }
    };

    const handleClear = () => {
        setCategoryValue("");
        setExpenseItemValue("");
        setCost("");
        setPurchaseDate("");
        setDescription("");
        setTaxPercentage("");
        setTaxAmount("");
        setSelectedImage(null);
        setIsTaxApplicable(false);
    };

    const handleSubmit = async () => {
        // Validation
        if (!categoryValue) {
            Toast.show({ type: "error", text1: "Validation Error", text2: "Please select a category", position: "top" });
            return;
        }

        if (!ExpenseItemValue) {
            Toast.show({ type: "error", text1: "Validation Error", text2: "Please select or enter a ExpenseItem", position: "top" });
            return;
        }

        if (!cost) {
            Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter cost", position: "top" });
            return;
        }

        if (!purchaseDate) {
            Toast.show({ type: "error", text1: "Validation Error", text2: "Please select purchase date", position: "top" });
            return;
        }

        try {
            setIsAddingExpense(true);
            const expenseData = {
                categoryId: categoryValue,
                expenseItemId: ExpenseItemValue,
                cost,
                pDate: purchaseDate,
                description,
                isTaxApp: isTaxApplicable ? "yes" : "no",
                percentage: taxPercentage || "0",
                taxAmount: taxAmount || "0",
                image: selectedImage
            };

            const response = await addExpense(expenseData);

            if (response?.status) {
                Toast.show({
                    type: "success", text1: "Success", text2: response.message || "Expense added successfully", position: "top", visibilityTime: 3000, autoHide: true
                });
                handleClear();
            } else {
                Toast.show({ type: "error", text1: "Error", text2: response?.message || "Failed to add expense", position: "top" });
            }
        } catch (error) {
            console.error('Error submitting expense:', error);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to add expense", position: "top" });
        } finally {
            setIsAddingExpense(false);
        }
    };

    const selectedCategoryName = categoryData.find((c) => c.value === categoryValue)?.label || '';
    const isOthers = ['others', 'other', 'Other', 'OTHER', 'Others', 'OTHERS'].includes(selectedCategoryName);

    return (
        <>
            <LoaderSpinner shouldLoad={isAddingCategory || isAddingExpenseItem || isAddingExpense} />
            <ScrollView contentContainerStyle={styles.scrollContainer} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                <View style={formStyles.row}>
                    <View style={formStyles.flexItem}>
                        <View style={formStyles.labelRow}>
                            <ThemedText style={[formStyles.label, { color: palette.textSecondary, marginBottom: 0 }]}>Category :</ThemedText>
                            <TouchableOpacity onPress={() => setVisible(true)}>
                                <Icon name="add-circle" size={24} color={palette.primary} />
                            </TouchableOpacity>
                        </View>
                        <FormDropdown
                            open={categoryOpen} onOpenChange={setCategoryOpen}
                            onOpened={() => setExpenseItemOpen(false)}
                            value={categoryValue} onChange={setCategoryValue}
                            items={categoryData} setItems={setCategoryData}
                            placeholder="Select Category" palette={palette}
                        />
                    </View>

                    <View style={formStyles.flexItem}>
                        <View style={formStyles.labelRow}>
                            <ThemedText style={[formStyles.label, { color: palette.textSecondary, marginBottom: 0 }]}>Expense Item :</ThemedText>
                            {categoryValue && (
                                <TouchableOpacity onPress={() => setExpenseItemVisible(true)}>
                                    <Icon name="add-circle" size={24} color={palette.primary} />
                                </TouchableOpacity>
                            )}
                        </View>
                        {isOthers ? (
                            <ThemedTextInput placeholder="Enter Expense" value={ExpenseItemValue} onChangeText={setExpenseItemValue} style={[formStyles.input, { borderColor: palette.fieldBorder }]} />
                        ) : (
                            <FormDropdown
                                open={ExpenseItemOpen} onOpenChange={setExpenseItemOpen}
                                onOpened={() => setCategoryOpen(false)}
                                value={ExpenseItemValue} onChange={setExpenseItemValue}
                                items={ExpenseItemData} setItems={setExpenseItemData}
                                placeholder="Select Expence" palette={palette}
                            />
                        )}
                    </View>
                </View>

                <View style={formStyles.fieldGroup}>
                    <ThemedText style={[formStyles.label, { color: palette.textSecondary }]}>Amount (₹) :</ThemedText>
                    <ThemedTextInput placeholder="Enter Amount" value={cost} onChangeText={setCost} keyboardType="numeric" style={[formStyles.input, { borderColor: palette.fieldBorder }]} />
                </View>

                <View style={formStyles.fieldGroup}>
                    <ThemedText style={[formStyles.label, { color: palette.textSecondary }]}>Date :</ThemedText>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}
                        style={[formStyles.dateButton, { borderColor: palette.fieldBorder }]}
                    >
                        <ThemedText style={[formStyles.dateButtonText, { color: purchaseDate ? palette.textPrimary : palette.textSecondary }]}>
                            {purchaseDate || 'Select Date'}
                        </ThemedText>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={purchaseDate ? new Date(purchaseDate) : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                </View>

                <View style={formStyles.fieldGroup}>
                    <ThemedText style={[formStyles.label, { color: palette.textSecondary }]}>Description (Optional) :</ThemedText>
                    <ThemedTextAreaInput placeholder="Enter Description" value={description} onChangeText={setDescription} style={[formStyles.textArea, { borderColor: palette.fieldBorder }]} />
                </View>

                <View style={formStyles.fieldGroup}>
                    <TouchableOpacity onPress={handleImagePicker} style={styles.imageButton}>
                        <LinearGradient colors={['#1976D2', '#1565C0']} style={styles.imageButtonGradient}>
                            <Icon name="photo-camera" size={24} color="#FFF" />
                            <ThemedText style={styles.imageButtonText}>
                                {selectedImage ? 'Change Image' : 'Add Image'}
                            </ThemedText>
                        </LinearGradient>
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image source={{ uri: `data:image/jpeg;base64,${selectedImage}` }} style={styles.selectedImage} />
                    )}
                </View>

                <View style={formStyles.fieldGroup}>
                    <View style={styles.switchContainer}>
                        <ThemedText style={[formStyles.label, { color: palette.textSecondary }]}>Tax Applicable :</ThemedText>
                        <Switch value={isTaxApplicable} onValueChange={handleTaxToggle} trackColor={{ false: '#767577', true: '#81b0ff' }} thumbColor={isTaxApplicable ? '#1976D2' : '#f4f3f4'} />
                    </View>

                    {isTaxApplicable && (
                        <View style={styles.taxDetails}>
                            <ThemedTextInput placeholder="Enter Tax Percentage" value={taxPercentage} onChangeText={handleTaxPercentageChange} keyboardType="numeric" style={[formStyles.input, { borderColor: palette.fieldBorder }]} />
                            <ThemedTextInput placeholder="Tax Amount" value={taxAmount} editable={false} style={[formStyles.input, styles.disabledInput, { borderColor: palette.fieldBorder }]}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                        <LinearGradient colors={['#64748b', '#475569']} style={formStyles.buttonGradient}>
                            <ThemedText style={styles.buttonText}>Clear</ThemedText>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                        <LinearGradient colors={['#4CAF50', '#2E7D32']} style={formStyles.buttonGradient}>
                            <ThemedText style={styles.buttonText}>Submit</ThemedText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <Toast />

            {/* Add Category Modal */}
            <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={hideAddCategoryDialog}>
                <View style={[styles.modalOverlay, { backgroundColor: palette.glassOverlay }]}>
                    <View style={[styles.modalContainer, { backgroundColor: palette.glassContainer, borderColor: palette.glassBorder }]}>
                        <ThemedText style={[styles.modalTitle, { color: palette.textPrimary }]}>Add New Category</ThemedText>
                        <View style={styles.inputContainer}>
                            <ThemedText style={[styles.modalLabel, { color: palette.textSecondary }]}>Category Name:</ThemedText>
                            <ThemedTextInput placeholder="Enter Category Name" value={newCategory}
                                onChangeText={setNewCategory} style={[styles.modalInput, { borderColor: palette.fieldBorder }]} />
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity onPress={hideAddCategoryDialog} style={styles.modalButton}>
                                <LinearGradient colors={['#64748b', '#475569']} style={formStyles.buttonGradient}>
                                    <ThemedText style={styles.buttonText}>Close</ThemedText>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCategorySubmit} style={styles.modalButton}>
                                <LinearGradient colors={['#4CAF50', '#2E7D32']} style={formStyles.buttonGradient}>
                                    <ThemedText style={styles.buttonText}>Add</ThemedText>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add ExpenseItem Modal */}
            <Modal animationType="fade" transparent={true} visible={ExpenseItemVisible} onRequestClose={hideaddExpenseItemDialog}>
                <View style={[styles.modalOverlay, { backgroundColor: palette.glassOverlay }]}>
                    <View style={[styles.modalContainer, { backgroundColor: palette.glassContainer, borderColor: palette.glassBorder }]}>
                        <ThemedText style={[styles.modalTitle, { color: palette.textPrimary }]}>Add Expense Item</ThemedText>

                        <View style={styles.inputContainer}>
                            <ThemedText style={[styles.modalLabel, { color: palette.textSecondary }]}>Category:</ThemedText>
                            <FormDropdown
                                open={categoryOpen} onOpenChange={setCategoryOpen}
                                value={categoryValue} onChange={setCategoryValue}
                                items={categoryData} setItems={setCategoryData}
                                placeholder="Select Category" palette={palette} disabled
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={[styles.modalLabel, { color: palette.textSecondary }]}>Expense Item Name:</ThemedText>
                            <ThemedTextInput placeholder="Enter Expense Item Name" value={newExpenseItem} onChangeText={setNewExpenseItem} style={[styles.modalInput, { borderColor: palette.fieldBorder }]}
                            />
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity onPress={hideaddExpenseItemDialog} style={styles.modalButton}>
                                <LinearGradient colors={['#64748b', '#475569']} style={formStyles.buttonGradient}>
                                    <ThemedText style={styles.buttonText}>Close</ThemedText>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleExpenseItemSubmit} style={styles.modalButton}>
                                <LinearGradient colors={['#4CAF50', '#2E7D32']} style={formStyles.buttonGradient}>
                                    <ThemedText style={styles.buttonText}>Add</ThemedText>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    imageButton: {
        marginBottom: 16,
    },
    imageButtonGradient: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageButtonText: {
        color: '#FFF',
        fontSize: 16,
        marginLeft: 8,
    },
    selectedImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    taxDetails: {
        gap: 15,
    },
    disabledInput: {
        backgroundColor: 'transparent',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    clearButton: {
        flex: 1,
    },
    submitButton: {
        flex: 1,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        padding: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 12,
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    modalInput: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        marginVertical: 0,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        paddingTop: 10,
    },
    modalButton: {
        flex: 1,
    },
});

export default Expense;
