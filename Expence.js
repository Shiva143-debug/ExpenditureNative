import { useEffect, useState } from "react";
import { TextInput as MaterialTextInput, Button, Dialog, Portal } from 'react-native-paper';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";
import { styleConstants } from "./Styles";
import { useAuth } from './AuthContext';
import { request, PERMISSIONS } from 'react-native-permissions';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Expence = () => {
    const { id } = useAuth();
    console.log(id)
    const [visible, setVisible] = useState(false);
    const [productVisible, setProductVisible] = useState(false);
    const [category, setCategory] = useState("")
    const [refreshFlag, setRefreshFlag] = useState(false);


    const [cost, setCost] = useState(null);
    const [purchaseDate, setPurchaseDate] = useState('');
    const [description, setDescription] = useState("");
    const [taxpercentage, setTaxPercentage] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [taxamount, setTaxAmount] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");

    const [categoryOpen, setCategoryOpen] = useState(false);
    const [categoryValue, setCategoryValue] = useState("");
    const [categoryData, setCategoryData] = useState([]);

    const [productOpen, setProductOpen] = useState(false);
    const [productValue, setProductValue] = useState("");
    const [productData, setProductData] = useState([]);


    const [taxDropOpen, setTaxDropOpen] = useState(false);
    const [isTaxApplicableValue, setTaxApplicableValue] = useState("");
    const [TaxApplicableData, TaxDropdownValues] = useState([
        { label: 'YES', value: 'yes' },
        { label: 'No', value: 'no' }
    ]);

    const requestPermissions = async () => {
        const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        console.log(result);
    };

    useEffect(() => {
        requestPermissions();
    }, []);

    useEffect(() => {
        let userId = id
        fetch(`https://exciting-spice-armadillo.glitch.me/categories/${userId}`)
            .then(res => res.json())
            .then(data => {
                const transformedData = data.map(item => ({
                    label: item.category,
                    value: item.category,
                    key: item.id
                }));
                setCategoryData(transformedData);
            })
            .catch(err => console.error(err));
    }, [id, refreshFlag]);

    useEffect(() => {
        if (categoryValue) {
            fetchProducts()
        }

    }, [categoryValue,refreshFlag]);

    const handleDateChange = (_, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setPurchaseDate(formattedDate);
        }
    };

    const handleCostChange = (cost) => {
        setCost(cost);
    };
    const handleProductChange = (product) => {
        setProductValue(product);
    };

    const handleDescriptionChange = (description) => {
        setDescription(description);
    };

    const handleTaxPercentageChange = (taxpercentage) => {
        setTaxPercentage(taxpercentage);
        const calculatedTaxAmount = (cost * (taxpercentage / 100)).toFixed(2);
        setTaxAmount(calculatedTaxAmount);
    };

    const handleImageChange = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                includeBase64: true, // To get the base64 string
            },
            (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.errorCode) {
                    console.error('Image Picker Error: ', response.errorMessage);
                } else {
                    const base64Image = response.assets[0].base64;
                    setSelectedImage(base64Image);

                }
            }
        );
    };

    const onClear = () => {
        console.log("cleared")
        setCategoryValue("");
        setProductValue("");
        setCost("");
        setPurchaseDate("");
        setDescription("");
        setTaxApplicableValue("");
        setTaxPercentage(null);
        setTaxAmount(null);
    };

    const fetchProducts = () => {
        const userId = id;
        let category = categoryValue
        fetch(`https://exciting-spice-armadillo.glitch.me/products?category=${category}&user_id=${userId}`)
            .then(res => res.json())
            .then(data => {
                const transformedData = data.map(item => ({
                    label: item.product,
                    value: item.product,
                    key: item.id
                }));
                setProductData(transformedData);
            })
            .catch(err => console.log(err));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const expenseData = {
            id, category: categoryValue, product: productValue, cost, p_date: purchaseDate, description, is_tax_app: isTaxApplicableValue, percentage: taxpercentage, tax_amount: taxamount, image: selectedImage
        }

        if (isTaxApplicableValue === "no" || isTaxApplicableValue === "") {
            expenseData.is_tax_app = "no";
            expenseData.percentage = 0;
            expenseData.tax_amount = 0;
        }
        if (categoryValue === "select") {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Select category' });
            return;
        }
        else if (productValue === "") {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Select Product' });
            return;
        }
        else if (cost === "") {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Enter cost' });
            return;
        }
        else if (purchaseDate === "") {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please Select purchaseDate' });
            return;
        }

        else {
            axios.post("https://exciting-spice-armadillo.glitch.me/postExpenseData", expenseData)
                .then(res => {
                    console.log("cleared")
                    setCategoryValue("");
                    setProductValue("");
                    setCost("");
                    setPurchaseDate("");
                    setDescription("");
                    setTaxApplicableValue("");
                    setTaxPercentage(null);
                    setTaxAmount(null);
                })
                .catch(err => {
                    console.log(err);

                });
        }
    }

    const handleCategoryChange = (category) => {
        setCategory(category)
    }

    const onDialogOpen = () => {
        console.log("button Clicked")
        setVisible(!visible)
    }

    const onProductDialogOpen = () => {
        setProductVisible(!visible)
    }

    const hideDialog = () => {
        setVisible(false);
        setCategory("");
    }

    const hideProductDialog = () => {
        setProductVisible(false);
        setCategoryValue("")
        setProductValue("")
    }

    const handleCategorySubmit = () => {
        if (!category) {
            console.log("noo")
            // toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Please enter category' });
            return;
        }
        let categoryData = { id, category }
        axios.post("https://exciting-spice-armadillo.glitch.me/addshopcategory", categoryData)
            .then(res => {
                console.log(res);
                setCategory("")
                hideDialog();
                setRefreshFlag(true);
                // toast.current.show({ severity: 'success', summary: 'Success', detail: 'category added successfully' });
            })
            .catch(err => {
                setCategory("")
                console.log(err);
            });

        hideDialog();
    }

    const onProductSubmit = () => {
        const productData = { id, category: categoryValue, product:productValue };
        axios.post("https://exciting-spice-armadillo.glitch.me/addproduct", productData)
            .then((res) => {
                console.log(res);
                setCategoryValue("")
                setProductValue("")
                hideProductDialog()
                setRefreshFlag(true);
                // toast.current.show({ severity: 'success', summary: 'Success', detail: 'Product added successfully' });
                // setLoading(false);
                // setSelectedOption("select");
                // setValues({});
            })
            .catch((err) => {
                console.log(err);
                // toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error adding product' });
            });

    };


    // console.log("category", categoryValue, "value")

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Icon name="add-circle" size={20} color="gray" onPress={onDialogOpen} style={styles.icon} />
            <DropDownPicker open={categoryOpen} value={categoryValue} items={[...categoryData, { label: 'Others', value: 'others' }]} setOpen={setCategoryOpen} setValue={setCategoryValue} setItems={setCategoryData} placeholder="Select Category" style={styles.dropdown} listMode="SCROLLVIEW" dropDownContainerStyle={styles.dropdownList} />
            {categoryValue === "others" ? (
                <MaterialTextInput placeholder="Enter Expense" style={styles.textInput} mode="outlined" label="Expense" value={productValue} onChangeText={handleProductChange} />
            ) : (
                <View>
                    <Icon name="add-circle" size={20} color="gray" onPress={onProductDialogOpen} style={styles.icon} />
                    <DropDownPicker open={productOpen} value={productValue} items={productData} setOpen={setProductOpen} setValue={setProductValue} setItems={setProductData} placeholder="Select Expence" style={styles.dropdown}  listMode="SCROLLVIEW" dropDownContainerStyle={styles.dropdownList} />
                </View>
            )}

            <MaterialTextInput placeholder="Enter Cost" style={styles.textInput} value={cost} mode="outlined" label="Cost" keyboardType="numeric" onChangeText={handleCostChange} />
            <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.dateButton} > Date: {purchaseDate}</Button>
            {showDatePicker && (<DateTimePicker value={new Date()} mode="date" display="default" onChange={handleDateChange} />)}
            <MaterialTextInput placeholder="Enter Description" style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]} value={description} mode="outlined" label="Description" multiline={true} onChangeText={handleDescriptionChange} />
            <Button mode="contained" onPress={handleImageChange} style={{ margin: 10 }} > Pick an Image</Button>
            {selectedImage && (<Image source={{ uri: `data:image/jpeg;base64,${selectedImage}` }} style={styles.image} />)}
            <DropDownPicker open={taxDropOpen} value={isTaxApplicableValue} items={TaxApplicableData} setOpen={setTaxDropOpen} setValue={setTaxApplicableValue} setItems={TaxDropdownValues} placeholder="Is Tax Applicable" style={styles.dropdown} />
            {isTaxApplicableValue === 'yes' &&
                <View>
                    <MaterialTextInput placeholder="Enter percentage (number)" style={styles.textInput} value={taxpercentage} mode="outlined" label="Tax Percentage" keyboardType="numeric" onChangeText={handleTaxPercentageChange} />
                    <MaterialTextInput placeholder="Tax Amount" style={styles.textInput} value={taxamount} mode="outlined" label="Tax Amount" />
                </View>
            }

            <View style={styles.Buttoncontainer}>
                <Button mode="contained" onPress={onClear} theme={{ colors: { primary: 'black' } }} style={styles.button}> Clear</Button>
                <Button mode="contained" onPress={onSubmit} theme={{ colors: { primary: 'green' } }} style={styles.button}>  Submit</Button>
            </View>


            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
                    <Dialog.Content>
                        <MaterialTextInput placeholder="Enter Category Name" style={styles.textInput} value={category} mode="outlined" label="Category" onChangeText={handleCategoryChange} />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <View style={styles.DialogButtoncontainer}>
                            <Button mode="contained" onPress={hideDialog} theme={{ colors: { primary: 'black' } }} style={styles.button}> Close</Button>
                            <Button mode="contained" onPress={handleCategorySubmit} theme={{ colors: { primary: 'green' } }} style={styles.button}> Submit</Button>
                        </View>
                    </Dialog.Actions>
                </Dialog>
            </Portal>


            <Portal>
                <Dialog visible={productVisible} onDismiss={hideProductDialog} style={styles.dialog}>
                    <Dialog.Content>
                       
                    <DropDownPicker open={categoryOpen} value={categoryValue} items={categoryData} setOpen={setCategoryOpen} setValue={setCategoryValue} setItems={setCategoryData} placeholder="Select Category" style={styles.dropdown} listMode="SCROLLVIEW" dropDownContainerStyle={styles.dropdownList} /> 
                    <MaterialTextInput placeholder="Enter Product/Expence Name" style={styles.textInput} value={productValue} mode="outlined" label="Product" onChangeText={handleProductChange} />

                    </Dialog.Content>
                    <Dialog.Actions>
                        <View style={styles.DialogButtoncontainer}>
                            <Button mode="contained" onPress={hideProductDialog} theme={{ colors: { primary: 'black' } }} style={styles.button}> Close</Button>
                            <Button mode="contained" onPress={onProductSubmit} theme={{ colors: { primary: 'green' } }} style={styles.button}> Submit</Button>
                        </View>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    Buttoncontainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, },
    button: { margin: styleConstants.margin },
    textInput: { margin: styleConstants.marginTop, width: '90%' },
    dropdown: { borderColor: '#ccc', marginLeft: styleConstants.margin, marginBottom: styleConstants.margin, width: "90%", zIndex: 1, },
    dropdownList: { maxHeight: 800 },
    image: { width: 200, height: 200, marginTop: 16, borderRadius: 8, },
    dateButton: { marginTop: styleConstants.marginTop, margin: styleConstants.margin },
    icon: { paddingLeft: "90%" },
    dialog: { alignSelf: 'center', width: '90%' },
    DialogButtoncontainer: { flexDirection: 'row', justifyContent: 'space-between', },
});

export default Expence;
