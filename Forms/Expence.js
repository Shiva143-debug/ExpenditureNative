import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Modal, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { request, PERMISSIONS } from 'react-native-permissions';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import ThemedTextInput from '../components/ThemedTextInput';
import ThemedTextAreaInput from '../components/ThemedTextAreaInput';
import { useAuth } from "../AuthContext";
import Toast from "react-native-toast-message";
import LinearGradient from 'react-native-linear-gradient';
import LoaderSpinner from '../LoaderSpinner';
import { getCategories as fetchCategories, getProducts as fetchProducts, addCategory, addProduct, addExpense } from '../services/apiService';

const Expense = () => {
    const { id } = useAuth();
    const [visible, setVisible] = useState(false);
    const [productVisible, setProductVisible] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(false);

    // Loading states
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [isAddingExpense, setIsAddingExpense] = useState(false);

    // New state variables for modals
    const [newCategory, setNewCategory] = useState("");
    const [newProduct, setNewProduct] = useState("");

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

    const [productOpen, setProductOpen] = useState(false);
    const [productValue, setProductValue] = useState("");
    const [productData, setProductData] = useState([]);

    // Replace taxDropOpen and isTaxApplicableValue with a single switch state
    const [isTaxApplicable, setIsTaxApplicable] = useState(false);

    // Modal visibility handlers
    const hideAddCategoryDialog = () => {
        setVisible(false);
        setNewCategory("");
    };

    const hideAddProductDialog = () => {
        setProductVisible(false);
        setNewProduct("");
    };

    // Submit handlers for new category and product
    const handleCategorySubmit = async () => {
        if (!newCategory.trim()) {
            Toast.show({  type: "error", text1: "Error", text2: "Please enter a category name", position: "top", visibilityTime: 3000 });
            return;
        }

        try {
            setIsAddingCategory(true);
            // Use the imported addCategory function from apiService
            await addCategory(id, newCategory);
            
            Toast.show({ type: "success", text1: "Success", text2: "Category added successfully", position: "top", visibilityTime: 3000 
            });
            setRefreshFlag(prev => !prev);
            hideAddCategoryDialog();
        } catch (error) {
            console.error('Error adding category:', error);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to add category", position: "top", visibilityTime: 3000 });
        } finally {
            setIsAddingCategory(false);
        }
    };

    const handleProductSubmit = async () => {
        if (!newProduct.trim()) {
            Toast.show({ type: "error", text1: "Error", text2: "Please enter a product name", position: "top", visibilityTime: 3000 });
            return;
        }

        if (!categoryValue) {
            Toast.show({  type: "error", text1: "Error", text2: "Please select a category", position: "top", visibilityTime: 3000 });
            return;
        }

        try {
            setIsAddingProduct(true);
            // Use the imported addProduct function from apiService
            await addProduct(id, categoryValue, newProduct);
            
            Toast.show({ type: "success", text1: "Success", text2: "Product added successfully", position: "top", visibilityTime: 3000 });
            setRefreshFlag(prev => !prev);
            hideAddProductDialog();
        } catch (error) {
            console.error('Error adding product:', error);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to add product", position: "top", visibilityTime: 3000 });
        } finally {
            setIsAddingProduct(false);
        }
    };

    // Permission and Initial Setup
    useEffect(() => {
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        try {
            const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
            console.log('Permission result:', result);
        } catch (error) {
            console.error('Permission error:', error);
        }
    };

    useEffect(() => {
        fetchCategoriesData();
    }, [id, refreshFlag])

    // Fetch Categories
    const fetchCategoriesData = async () => {
        try {
            // Use the imported fetchCategories function from apiService
            const data = await fetchCategories(id);
            
            if (data) {
                const transformedData = data.map(item => ({
                    label: item.category,
                    value: item.category,
                    key: item.id.toString()
                }));
                setCategoryData(transformedData);
                console.log('Categories fetched successfully.');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to load categories", position: "top", visibilityTime: 3000 });
        }
    };

    // Fetch Products when category changes
    useEffect(() => {
        const fetchProductsData = async () => {
            if (!categoryValue) return;

            try {
                // Use the imported fetchProducts function from apiService
                const data = await fetchProducts(id, categoryValue);
                
                if (data) {
                    const transformedData = data.map(item => ({
                        label: item.product,
                        value: item.product,
                        key: item.id.toString()
                    }));
                    setProductData(transformedData);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                Toast.show({ type: "error", text1: "Error", text2: "Failed to load products", position: "top", visibilityTime: 3000 });
            }
        };

        fetchProductsData();
    }, [categoryValue, refreshFlag, id]);

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
        setProductValue("");
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

        if (!productValue) {
            Toast.show({ type: "error", text1: "Validation Error", text2: "Please select or enter a product", position: "top" });
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
                id,
                category: categoryValue,
                product: productValue,
                cost,
                p_date: purchaseDate,
                description,
                is_tax_app: isTaxApplicable ? "yes" : "no",
                percentage: taxPercentage || "0",
                tax_amount: taxAmount || "0",
                image: selectedImage
            };

            // Use the imported addExpense function from apiService
            await addExpense(expenseData);
            
            Toast.show({ type: "success", text1: "Success", text2: "Expense added successfully", position: "top", visibilityTime: 3000, autoHide: true 
            });
            handleClear();
        } catch (error) {
            console.error('Error submitting expense:', error);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to add expense", position: "top" });
        } finally {
            setIsAddingExpense(false);
        }
    };

    return (
        <>
            <LoaderSpinner shouldLoad={isAddingCategory || isAddingProduct || isAddingExpense} />
            <ScrollView contentContainerStyle={styles.scrollContainer} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                <ThemedView style={styles.container}>
                    <ThemedView style={styles.formContainer}>
                        <View style={styles.rowContainer}>
                            <View style={styles.flexItem}>
                                <View style={styles.labelRow}>
                                    <ThemedText style={styles.label}>Category</ThemedText>
                                    <TouchableOpacity onPress={() => setVisible(true)}>
                                        <Icon name="add-circle" size={24} color="#4CAF50" />
                                    </TouchableOpacity>
                                </View>
                                <DropDownPicker open={categoryOpen} value={categoryValue} items={categoryData}
                                    setOpen={(isOpen) => {
                                        setCategoryOpen(isOpen);
                                        if (isOpen) setProductOpen(false);
                                    }}
                                    setValue={setCategoryValue} setItems={setCategoryData}
                                    placeholder="Select Category" style={styles.dropdown}
                                    dropDownContainerStyle={styles.dropdownList} textStyle={styles.dropdownText} listMode="SCROLLVIEW"
                                />
                            </View>

                            <View style={styles.flexItem}>
                                <View style={styles.labelRow}>
                                    <ThemedText style={styles.label}>Product/Service</ThemedText>
                                    {categoryValue && (
                                        <TouchableOpacity onPress={() => setProductVisible(true)}>
                                            <Icon name="add-circle" size={24} color="#4CAF50" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {categoryValue === "others" || categoryValue === "other" || categoryValue === "Other" || categoryValue === "OTHER" || categoryValue === "Others" || categoryValue === "OTHERS" ? (
                                    <ThemedTextInput placeholder="Enter Expense" value={productValue} onChangeText={setProductValue} style={styles.input} />
                                ) : (
                                    <DropDownPicker open={productOpen} value={productValue} items={productData}
                                        setOpen={(isOpen) => {
                                            setProductOpen(isOpen);
                                            if (isOpen) setCategoryOpen(false);
                                        }}
                                        setValue={setProductValue} setItems={setProductData} placeholder="Select Product"
                                        style={styles.dropdown} dropDownContainerStyle={styles.dropdownList} textStyle={styles.dropdownText} listMode="SCROLLVIEW"
                                    />
                                )}
                            </View>
                        </View>

                        <View style={styles.inputSection}>
                            <ThemedText style={styles.label}>Cost</ThemedText>
                            <ThemedTextInput placeholder="Enter Cost" value={cost} onChangeText={setCost} keyboardType="numeric" style={styles.input} />
                        </View>

                        <View style={styles.inputSection}>
                            <ThemedText style={styles.label}>Purchase Date</ThemedText>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                                <ThemedText style={styles.dateButtonText}>
                                    {purchaseDate || 'Select Date'}
                                </ThemedText>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker value={purchaseDate ? new Date(purchaseDate) : new Date()} mode="date" display="default" onChange={handleDateChange} />
                            )}
                        </View>

                        <View style={styles.inputSection}>
                            <ThemedText style={styles.label}>Description</ThemedText>
                            <ThemedTextAreaInput placeholder="Enter Description" value={description} onChangeText={setDescription} style={styles.textArea} />
                        </View>

                        <View style={styles.imageSection}>
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

                        <View style={styles.taxSection}>
                            <View style={styles.switchContainer}>
                                <ThemedText style={styles.label}>Tax Applicable</ThemedText>
                                <Switch value={isTaxApplicable} onValueChange={handleTaxToggle} trackColor={{ false: '#767577', true: '#81b0ff' }} thumbColor={isTaxApplicable ? '#1976D2' : '#f4f3f4'} />
                            </View>

                            {isTaxApplicable && (
                                <View style={styles.taxDetails}>
                                    <ThemedTextInput placeholder="Tax Percentage" value={taxPercentage} onChangeText={handleTaxPercentageChange} keyboardType="numeric" style={styles.input} />
                                    <ThemedTextInput placeholder="Tax Amount" value={taxAmount} editable={false} style={[styles.input, styles.disabledInput]}
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                                <LinearGradient colors={['#757575', '#616161']} style={styles.buttonGradient}>
                                    <ThemedText style={styles.buttonText}>Clear</ThemedText>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                                <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.buttonGradient}>
                                    <ThemedText style={styles.buttonText}>Submit</ThemedText>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ThemedView>
                </ThemedView>
            </ScrollView>
            <Toast />

            {/* Add Category Modal */}
            <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={hideAddCategoryDialog}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ThemedView style={styles.modalContent}>
                            <ThemedText style={styles.modalTitle}>Add New Category</ThemedText>
                            <ThemedView style={styles.inputContainer}>
                                <ThemedText style={styles.modalLabel}>Category Name:</ThemedText>
                                <ThemedTextInput placeholder="Enter Category Name" value={newCategory}
                                    onChangeText={setNewCategory} style={styles.modalInput} />
                            </ThemedView>

                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity onPress={hideAddCategoryDialog} style={styles.modalButton}>
                                    <LinearGradient colors={['#757575', '#616161']} style={styles.buttonGradient}>
                                        <ThemedText style={styles.buttonText}>Close</ThemedText>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleCategorySubmit} style={styles.modalButton}>
                                    <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.buttonGradient}>
                                        <ThemedText style={styles.buttonText}>Add </ThemedText>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </ThemedView>
                    </View>
                </View>
            </Modal>

            {/* Add Product Modal */}
            <Modal animationType="slide" transparent={true} visible={productVisible} onRequestClose={hideAddProductDialog}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ThemedView style={styles.modalContent}>
                            <ThemedText style={styles.modalTitle}>Add New Product</ThemedText>

                            <ThemedView style={styles.inputContainer}>
                                <ThemedText style={styles.modalLabel}>Category:</ThemedText>
                                <DropDownPicker open={categoryOpen} value={categoryValue} items={categoryData}
                                    setOpen={setCategoryOpen} setValue={setCategoryValue} setItems={setCategoryData}
                                    placeholder="Select Category" style={styles.modalDropdown} dropDownContainerStyle={styles.modalDropdownList} textStyle={styles.dropdownText} listMode="SCROLLVIEW" disabled={true}
                                />
                            </ThemedView>

                            <ThemedView style={styles.inputContainer}>
                                <ThemedText style={styles.modalLabel}>Product Name:</ThemedText>
                                <ThemedTextInput placeholder="Enter Product Name" value={newProduct} onChangeText={setNewProduct} style={styles.modalInput}
                                />
                            </ThemedView>

                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity onPress={hideAddProductDialog} style={styles.modalButton}>
                                    <LinearGradient colors={['#757575', '#616161']} style={styles.buttonGradient}>
                                        <ThemedText style={styles.buttonText}>Close</ThemedText>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleProductSubmit} style={styles.modalButton}>
                                    <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.buttonGradient}>
                                        <ThemedText style={styles.buttonText}>Add</ThemedText>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </ThemedView>
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
    container: {
        flex: 1,
    },
    formContainer: {
        padding: 2,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 15,
    },
    flexItem: {
        flex: 1,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    inputSection: {
        marginBottom: 20,
    },
    input: {
        height: 45,
        borderRadius: 8,
        marginBottom: 0,
    },
    dropdown: {
        borderColor: '#ccc',
        borderRadius: 8,
        height: 45,
    },
    dropdownList: {
        borderColor: '#ccc',
        maxHeight: 300,
    },
    dropdownText: {
        fontSize: 16,
    },
    textArea: {
        height: 100,
        borderRadius: 8,
        textAlignVertical: 'top',
        marginBottom: 0,
    },
    dateButton: {
        height: 45,
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 15,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#333',
    },
    imageButton: {
        marginBottom: 8,
    },
    imageButtonGradient: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 8,
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
        borderRadius: 8,
        marginBottom: 16,
    },
    taxSection: {
        marginBottom: 20,
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
        backgroundColor: '#f5f5f5',
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    clearButton: {
        flex: 1,
        marginRight: 8,
    },
    submitButton: {
        flex: 1,
        marginLeft: 8,
    },
    buttonGradient: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(190, 189, 189, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        height: 400,
        maxHeight: 800,
        width: '90%',
        elevation: 5,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        flex: 1,
        width: '100%',
        // marginBottom: 20,
    },
    modalLabel: {
        fontSize: 16,
        // marginBottom: 8,
        fontWeight: '500',
    },
    modalInput: {
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 20,
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    modalDropdown: {
        borderColor: '#ccc',
        borderRadius: 8,
        height: 45,
        marginBottom: 15,
    },
    modalDropdownList: {
        borderColor: '#ccc',
        maxHeight: 150,
    },
});

export default Expense;
