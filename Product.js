import { useState, useEffect } from "react";
import { TextInput as MaterialTextInput, Button, Dialog, Portal, Provider as PaperProvider } from 'react-native-paper';
import { Text, View, StyleSheet } from 'react-native';
import { styleConstants } from "./Styles"
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from './AuthContext';
import axios from "axios";

const Product = () => {
    const { id } = useAuth();
    console.log(id)
    const [visible, setVisible] = useState(false);
    const [product, setProduct] = useState("")
    const [category, setCategory] = useState("")

    const [categoryOpen, setCategoryOpen] = useState(false);
    const [categoryValue, setCategoryValue] = useState("");
    const [categoryData, setCategoryData] = useState([]);


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
    }, []);

    const handleProductChange = (product) => {
        setProduct(product)
    }
    const handleCategoryChange = (category) => {
        setCategory(category)
    }

    const onProductSubmit = () => {
        const productData = { id, category: categoryValue, product };
        axios.post("https://exciting-spice-armadillo.glitch.me/addproduct", productData)
            .then((res) => {
                console.log(res);
                setCategoryValue("")
                setProduct("")
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

    const onDialogOpen = () => {
        console.log("button Clicked")
        setVisible(!visible)
    }

    const hideDialog = () => {
        setVisible(false);
        setCategory("");
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
                // toast.current.show({ severity: 'success', summary: 'Success', detail: 'category added successfully' });
            })
            .catch(err => {
                setCategory("")
                console.log(err);
            });

        hideDialog();
    }

    console.log(categoryValue)

    return (
        <PaperProvider>
            <View style={{ flex: 1 }}>
                <Text style={styles.MainText}>CATEGORY -- PRODUCT</Text>
                <Text style={{ paddingLeft: 25, fontSize: 18 }} onPress={onDialogOpen}>If You want New Category ? <Icon name="add-circle" size={20} color="gray" onPress={onDialogOpen} style={styles.icon} /></Text>
                <View style={styles.dropIconContainer}>
                    <DropDownPicker open={categoryOpen} value={categoryValue} items={categoryData} setOpen={setCategoryOpen} setValue={setCategoryValue} setItems={setCategoryData} placeholder="Select Category" style={styles.dropdown} listMode="SCROLLVIEW"
                        dropDownContainerStyle={styles.dropdownList} />
                </View>

                <MaterialTextInput placeholder="Enter Product/Item Name" style={styles.textInput} value={product} mode="outlined" label="Product" onChangeText={handleProductChange} />

                <View style={styles.Buttoncontainer}>
                    <Button mode="contained" onPress={() => console.log('Pressed')} theme={{ colors: { primary: 'black' } }} style={styles.button}> Clear</Button>
                    <Button mode="contained" onPress={onProductSubmit} theme={{ colors: { primary: 'green' } }} style={styles.button}> Submit</Button>
                </View>

                <Portal>
                    <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
                        {/* <Dialog.Title style={styles.MainText}>ADD CATEGORY</Dialog.Title> */}
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

            </View>
        </PaperProvider>
    )
}

const styles = StyleSheet.create({
    Buttoncontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 5,
    },
    DialogButtoncontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        margin: styleConstants.margin
    },
    textInput: {
        margin: styleConstants.marginTop
    },
    MainText: {
        fontSize: styleConstants.fontSize,
        marginTop: styleConstants.mainTextMarginTop,
        textAlign: styleConstants.textAlign,
        fontWeight: styleConstants.textFontWeight,
        paddingBottom: 20
    },
    dropdown: {
        borderColor: '#ccc',
        margin: styleConstants.margin,
        width: "90%"
    },
    dropdownList: { maxHeight: 600 },
    dropIconContainer: {
        display: "flex"
    },
    dialog: {
        alignSelf: 'center',
        width: '90%',
    },
    icon: {
        width: '10%'
    },

})

export default Product