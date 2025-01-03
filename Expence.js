import { useEffect, useState } from "react";
import { TextInput as MaterialTextInput, Button } from 'react-native-paper';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios"; 
import { styleConstants } from "./Styles";
import { useAuth } from './AuthContext';
import { request, PERMISSIONS } from 'react-native-permissions';
import { launchImageLibrary } from 'react-native-image-picker';

const Expence = () => {
    const { id } = useAuth();
    console.log(id)
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
    const [isTaxApplicableValue, setTaxApplicableValue] = useState("no");
    const [TaxApplicableData, TaxDropdownValues] = useState([
        { label: 'YES', value: 'yes' },
        { label: 'No', value: 'no' }
    ]);

    const requestPermissions = async () => {
        const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        console.log(result); // Check the result for permission status
      };

      useEffect(() => {
        requestPermissions();
      }, []);

    useEffect(() => {
        let userId =id
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

    useEffect(() => {
        if(categoryValue){
            fetchProducts()
        }
      
    }, [categoryValue]);

    const handleDateChange = (_, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
          // Format the selected date to "YYYY-MM-DD"
          const formattedDate = selectedDate.toISOString().split('T')[0];
          setPurchaseDate(formattedDate); // Save the formatted date as a string
        }
      };

    // const handleDateChange = (_, selectedDate) => {
    //     setShowDatePicker(false);
    //     if (selectedDate) {
    //       // Format the selected date to "DD/MM/YYYY"
    //       const formattedDate = selectedDate.toLocaleDateString('en-GB');
    //       setPurchaseDate(formattedDate); // Save the formatted date as a string
    //     }
    //   };

    const handleCostChange = (cost) => {
        setCost(cost);
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
        setCost("");
        setPurchaseDate("");
        setDescription("");
        setTaxPercentage(null);
        setTaxAmount(null);
        setCategoryValue("");
        setProductValue("");
    };
    

    const fetchProducts = () => {
        const userId = id;
        let category=categoryValue
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
            id, category: categoryValue, product: productValue, cost,  p_date: purchaseDate, description, is_tax_app: isTaxApplicableValue, percentage:taxpercentage, tax_amount: taxamount, image: selectedImage
        }

        if (isTaxApplicableValue === "no") {
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
                    // toast.current.show({ severity: 'success', summary: 'Success', detail: 'Expence added successfully' });
                    // document.getElementById("addForm").reset();
                    setTaxApplicableValue("no")
                    setTaxPercentage(null)
                    setTaxAmount(null)
                    setDescription("")
                    setPurchaseDate("")
                    setCost("")
                    setCategoryValue("");
                    setProductValue("");
                    // setAttachFile("")
                })
                .catch(err => {
                    console.log(err);
                    // toast.current.show({ severity: 'error', summary: 'Error', detail: err });

                });
        }
    }

    // const formattedDate = purchaseDate.toLocaleDateString('en-GB');

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

            {/* <Text style={styles.MainText}>Expense</Text> */}
            <DropDownPicker
                open={categoryOpen}
                value={categoryValue}
                items={categoryData}
                setOpen={setCategoryOpen}
                setValue={setCategoryValue}
                setItems={setCategoryData}
                placeholder="Select Category"
                style={styles.dropdown}
                listMode="SCROLLVIEW" 
                dropDownContainerStyle={styles.dropdownList} 
             
            />
            <DropDownPicker
                open={productOpen}
                value={productValue}
                items={productData}
                setOpen={setProductOpen}
                setValue={setProductValue}
                setItems={setProductData}
                placeholder="Select Product"
                style={styles.dropdown}
            />
            <MaterialTextInput
                placeholder="Enter Cost"
                style={styles.textInput}
                value={cost}
                mode="outlined"
                label="Cost"
                onChangeText={handleCostChange}


            />



<Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.dateButton} theme={{ colors: { primary: "blue" } }}>
        {/* Select Date: {formattedDate} */}
        Select Date: {purchaseDate}
      </Button>
      {showDatePicker && (
        <DateTimePicker value={new Date()}  mode="date"  display="default"  onChange={handleDateChange}/>
      )}

      
<MaterialTextInput
                placeholder="Enter Description"
                style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                value={description}
                mode="outlined"
                label="Description"
                multiline={true} 
                // numberOfLines={2} 
                onChangeText={handleDescriptionChange}
            />


                    <Button
    mode="contained"
    onPress={handleImageChange}
    style={{ margin: 10, backgroundColor: 'blue' }}
>
    Pick an Image
</Button>
            {selectedImage && (
                <Image source={{ uri: `data:image/jpeg;base64,${selectedImage}` }} style={styles.image}/>
            )} 



            <DropDownPicker
                open={taxDropOpen}
                value={isTaxApplicableValue}
                items={TaxApplicableData}
                setOpen={setTaxDropOpen}
                setValue={setTaxApplicableValue}
                setItems={TaxDropdownValues}
                placeholder="Is Tax Applicable"
                style={{marginTop:20}}
            />


            {isTaxApplicableValue === 'yes' &&
                <View>
                    <MaterialTextInput
                        placeholder="Enter percentage (number)"
                        style={styles.textInput}
                        value={taxpercentage}
                        mode="outlined"
                        label="Tax Percentage"
                        keyboardType="numeric"
                        onChangeText={handleTaxPercentageChange}
                    />
                    <MaterialTextInput
                        placeholder="Tax Amount"
                        style={styles.textInput}
                        value={taxamount}
                        mode="outlined"
                        label="Tax Amount"
                    />
                </View>
            }

            <View style={styles.Buttoncontainer}>
                <Button
                    mode="contained"
                    onPress={onClear}
                    theme={{ colors: { primary: 'black' } }}
                    style={styles.button}>
                    Clear
                </Button>
                <Button
                    mode="contained"
                    onPress={onSubmit}
                    theme={{ colors: { primary: 'green' } }}
                    style={styles.button}>
                    Submit
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    Buttoncontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
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
        width: "90%",
        zIndex: 1, 
    },
    dropdownList: { maxHeight: 800 },
    image: {
        width: 200,
        height: 200,
        marginTop: 16,
        borderRadius: 8,
    },
    dateButton: {
        marginTop: styleConstants.marginTop,
        margin: styleConstants.margin,
      },
});

export default Expence;
