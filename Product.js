import { useState } from "react";
import { TextInput as MaterialTextInput, Button, Dialog, Portal, Provider as PaperProvider } from 'react-native-paper';
import { Text, View, StyleSheet } from 'react-native';
import { styleConstants } from "./Styles"
import DropDownPicker from 'react-native-dropdown-picker';
// import { Icon, MD3Colors } from 'react-native-paper';
// import Icon from 'react-native-vector-icons/FontAwesome';
import Icon from '@mdi/react';
import { mdiPlusBox } from '@mdi/js';

const Product = () => {
    const [visible, setVisible] = useState(false);
    const [product, setProduct] = useState("")
    const [category, setCategory] = useState("")
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        { label: 'Java', value: 'java' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'Python', value: 'python' },
    ]);

    const handleProductChange = (product) => {
        setProduct(product)
    }
    const handleCategoryChange = (category) => {
        setCategory(category)
    }

    const onProductSubmit = () => {
        console.log("product submit")
    };

    const onDialogOpen = () => {
        console.log("button Clicked")
        setVisible(!visible)
    }

    const hideDialog = () => setVisible(false);

    const handleCategorySubmit = () => {
        console.log("submitclicked")
        hideDialog();
    }

    return (
        <PaperProvider>
        <View style={{ flex: 1 }}>
            <Text style={styles.MainText}>CATEGORY -- PRODUCT</Text>
            <View style={{ display: "flex" }}>
                <DropDownPicker open={open} value={value} items={items} setOpen={setOpen} setValue={setValue} setItems={setItems} placeholder="Select Category" style={styles.dropdown} />
                {/* <Icon source="camera" color={MD3Colors.error50} size={20} onPress={onDialogOpen} /> */}
                
                {/* <Icon name="home" size={30} color="#900" /> */}
                <Icon path={mdiPlusBox} size={1} />
                {/* <Button onPress={onDialogOpen}>Click</Button> */}
            </View>
            <MaterialTextInput placeholder="Enter Product/Item Name" style={styles.textInput} value={product} mode="outlined" label="Product" onChangeText={handleProductChange} />

            <View style={styles.Buttoncontainer}>
                <Button mode="contained" onPress={() => console.log('Pressed')} theme={{ colors: { primary: 'black' } }} style={styles.button}> Clear</Button>
                <Button mode="contained" onPress={onProductSubmit} theme={{ colors: { primary: 'green' } }} style={styles.button}> Submit</Button>
            </View>

        
                    <Portal>
                        <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
                            <Dialog.Title style={styles.MainText}>ADD CATEGORY</Dialog.Title>
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
        padding: 10,
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
        fontWeight: styleConstants.textFontWeight
    },
    dropdown: {
        borderColor: '#ccc',
        margin: styleConstants.margin,
        width: "70%"
    },
    dialog: {
        alignSelf: 'center',
        width: '90%',
      },

})

export default Product