// import { useEffect, useState } from "react";
// import { TextInput as MaterialTextInput, Button } from 'react-native-paper';
// import { Text, View, StyleSheet, ScrollView } from 'react-native';
// import DropDownPicker from 'react-native-dropdown-picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { launchImageLibrary } from "react-native-image-picker";
// import { styleConstants } from "./Styles"


// const Expence = () => {

//     const [cost, setCost] = useState("")
//     const [purchaseDate, setPurchaseDate] = useState(new Date())
//     const [description, setDescription] = useState("")
//     const [taxpercentage, setTaxPercentage] = useState(null)
//     const [taxamount, setTaxAmount] = useState(null)
//     const [selectedImage, setSelectedImage] = useState(null);

//     const [categoryOpen, setCategoryOpen] = useState(false);
//     const [categoryValue, setCategoryValue] = useState(null);
//     const [categoryData, setCategoryData] = useState([]);

//     const [productOpen, setProductOpen] = useState(false);
//     const [productValue, setProductValue] = useState(null);
//     const [productData, setProductData] = useState([]);

//     const [sourceOpen, setSourceOpen] = useState(false);
//     const [sourceValue, setSourceValue] = useState(null);
//     const [sourceData, setSourceData] = useState([]);


//     const [taxDropOpen, setTaxDropOpen] = useState(false);
//     const [isTaxApplicableValue, setTaxApplicableValue] = useState('no');
//     const [TaxApplicableData, TaxDropdownValues] = useState([{ label: 'YES', value: 'yes' }, { label: 'No', value: 'no' }]);

//     useEffect(() => {
//         fetch(`https://exciting-spice-armadillo.glitch.me/categories/1`)
//             .then(res => res.json())
//             .then(data => setCategoryData(data))
//             .catch(err => console.error(err));
//     }, []);

//     const handleCostChange = (cost) => {
//         setCost(cost)
//     }

//     const handleDescriptionChange = (description) => {
//         setDescription(description)
//     }

//     const handleTaxPercentageChange = (taxpercentage) => {
//         setTaxPercentage(taxpercentage)
//         const calculatedTaxAmount = (cost * (taxpercentage / 100)).toFixed(2);
//         setTaxAmount(calculatedTaxAmount);

//     }

//     const onDateChange = (event, selectedDate) => {
//         if (selectedDate) {
//             setPurchaseDate(selectedDate); 
//         }
//     };


    // const handleImageChange = () => {
    //     launchImageLibrary(
    //         {
    //             mediaType: "photo",
    //             includeBase64: true,
    //         },
    //         (response) => {
    //             if (response.didCancel) {
    //                 console.log("User cancelled image picker");
    //             } else if (response.errorCode) {
    //                 console.error("Image Picker Error: ", response.errorMessage);
    //             } else {
    //                 const base64Image = response.assets[0].base64;
    //                 setSelectedImage(base64Image); 
    //             }
    //         }
    //     );
    // };

//     const onSourceSubmit = () => {
//         const values = { id: 1, source: sourceName, amount, date };
//         axios
//             .post('https://exciting-spice-armadillo.glitch.me/addSource', values)
//             .then(res => {
//                 console.log(res.data);
//                 Toast.show({
//                     type: 'success',
//                     text1: 'Success',
//                     text2: 'Source of Income added successfully!',
//                 });
//                 // Reset form
//                 setSourceName('');
//                 setAmount('');
//                 setDate('');
//             })
//             .catch(err => {
//                 console.error(err);
//                 Toast.show({
//                     type: 'error',
//                     text1: 'Error',
//                     text2: 'Failed to add Source of Income.',
//                 });
//             });
//     };

//     const onClear = () => {
//         setCost("")
//         setPurchaseDate(new Date());
//         setDescription("")
//         setTaxPercentage(null)
//         setTaxAmount(null)
//         setCategoryValue(null)
//         setProductValue(null)
//         setSourceValue(null)
//     }

//     return (
//         <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

//             <Text style={styles.MainText}>Expence</Text>
//             <DropDownPicker open={categoryOpen} value={categoryValue} items={categoryData} setOpen={setCategoryOpen} setValue={setCategoryValue} setItems={setCategoryData} placeholder="Select Category" style={styles.dropdown} />
//             <DropDownPicker open={productOpen} value={productValue} items={productData} setOpen={setProductOpen} setValue={setProductValue} setItems={setProductData} placeholder="Select Product" style={styles.dropdown} />
//             <MaterialTextInput placeholder="Enter Cost" style={styles.textInput} value={cost} mode="outlined" label="Cost" onChangeText={handleCostChange} />
//             <DateTimePicker value={purchaseDate} mode="date" display="default" onChange={()=>onDateChange} />
//             <DropDownPicker open={sourceOpen} value={sourceValue} items={sourceData} setOpen={setSourceOpen} setValue={setSourceValue} setItems={setSourceData} placeholder="Select Source" style={styles.dropdown} />
//             <MaterialTextInput placeholder="Enter Description" style={styles.textInput} value={description} mode="outlined" label="Description" onChangeText={handleDescriptionChange} />
            // {/* <Button title="Pick an Image" onPress={handleImageChange} />
            // {selectedImage && (
            //     <Image source={{ uri: `data:image/jpeg;base64,${selectedImage}` }} style={styles.image}/>
            // )} */}
//             <DropDownPicker open={taxDropOpen} value={isTaxApplicableValue} items={TaxApplicableData} setOpen={setTaxDropOpen} setValue={setTaxApplicableValue} setItems={TaxDropdownValues} placeholder="IS Tax Applicable" style={styles.dropdown} />
//             {isTaxApplicableValue === 'yes' &&
//                 <View>
//                     <MaterialTextInput placeholder="Enter percentage (number)" style={styles.textInput} value={taxpercentage} mode="outlined" label="Tax Percentage" keyboardType="numeric" onChangeText={handleTaxPercentageChange} />
//                     <MaterialTextInput placeholder="Tax Amount" style={styles.textInput} value={taxamount} mode="outlined" label="Tax Amount" />
//                 </View>
//             }

//             <View style={styles.Buttoncontainer}>
//                 <Button mode="contained" onPress={onClear} theme={{ colors: { primary: 'black' } }} style={styles.button}> Clear</Button>
//                 <Button mode="contained" onPress={onSourceSubmit} theme={{ colors: { primary: 'green' } }} style={styles.button}> Submit</Button>
//             </View>
//         </ScrollView>
//     )
// }

// const styles = StyleSheet.create({
//     Buttoncontainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         padding: 10,
//     },
//     button: {
//         margin: styleConstants.margin
//     },
//     textInput: {
//         margin: styleConstants.marginTop
//     },
//     MainText: {
//         fontSize: styleConstants.fontSize,
//         marginTop: styleConstants.mainTextMarginTop,
//         textAlign: styleConstants.textAlign,
//         fontWeight: styleConstants.textFontWeight
//     },
//     dropdown: {
//         borderColor: '#ccc',
//         margin: styleConstants.margin,
//         width: "90%"
//     },
//     image: {
//         width: 200,
//         height: 200,
//         marginTop: 16,
//         borderRadius: 8,
//     },
// })

// export default Expence


import { useEffect, useState } from "react";
import { TextInput as MaterialTextInput, Button } from 'react-native-paper';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from "react-native-image-picker";
import { styleConstants } from "./Styles";

const Expence = () => {

    const [cost, setCost] = useState("");
    const [purchaseDate, setPurchaseDate] = useState(new Date());
    const [description, setDescription] = useState("");
    const [taxpercentage, setTaxPercentage] = useState(null);
    const [taxamount, setTaxAmount] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const [categoryOpen, setCategoryOpen] = useState(false);
    const [categoryValue, setCategoryValue] = useState("");
    const [categoryData, setCategoryData] = useState([]);

    const [productOpen, setProductOpen] = useState(false);
    const [productValue, setProductValue] = useState(null);
    const [productData, setProductData] = useState([]);

    const [sourceOpen, setSourceOpen] = useState(false);
    const [sourceValue, setSourceValue] = useState(null);
    const [sourceData, setSourceData] = useState([]);

    const [taxDropOpen, setTaxDropOpen] = useState(false);
    const [isTaxApplicableValue, setTaxApplicableValue] = useState(null);
    const [TaxApplicableData, TaxDropdownValues] = useState([
        { label: 'YES', value: 'yes' },
        { label: 'No', value: 'no' }
    ]);

    useEffect(() => {
        fetch(`https://exciting-spice-armadillo.glitch.me/categories/1`)
            .then(res => res.json())
            .then(data => {
                // Transform the data to include the `key` property
                const transformedData = data.map(item => ({
                    label: item.category, // Display text
                    value: item.category,      // The value to store
                    key: item.id         // Unique key
                }));
                setCategoryData(transformedData);
            })
            .catch(err => console.error(err));
    }, []);

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

    const onDateChange = (event, selectedDate) => {
        if (selectedDate) {
            setPurchaseDate(selectedDate);
        }
    };

    const handleImageChange = () => {
        launchImageLibrary(
            {
                mediaType: "photo",
                includeBase64: true,
            },
            (response) => {
                if (response.didCancel) {
                    console.log("User cancelled image picker");
                } else if (response.errorCode) {
                    console.error("Image Picker Error: ", response.errorMessage);
                } else {
                    const base64Image = response.assets[0].base64;
                    setSelectedImage(base64Image); 
                }
            }
        );
    };

    const onClear = () => {
        setCost("");
        setPurchaseDate(new Date());
        setDescription("");
        setTaxPercentage(null);
        setTaxAmount(null);
        setCategoryValue(null);
        setProductValue(null);
        setSourceValue(null);
    };
    

    const fetchProducts = (selectedCategory) => {
        const userId = 1;
        fetch(`https://exciting-spice-armadillo.glitch.me/products?category=FOOD&user_id=${userId}`)
            .then(res => res.json())
            // .then(data => setProductData(data))
            .then(data => {
                // Transform the data to the format DropDownPicker expects
                const transformedData = data.map(item => ({
                    label: item.product, // Adjust key to your API's product name field
                    value: item.id,         // Adjust key to your API's product ID field
                    key: item.id
                }));
                setProductData(transformedData);
            })
            .catch(err => console.log(err));
    };

 const onSetCategoryValue=(value)=>{
    console.log("Selected Category:", value); 
    setCategoryValue(value)
    fetchProducts(value)
 }


    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

            <Text style={styles.MainText}>Expense</Text>
            <DropDownPicker
                open={categoryOpen}
                value={categoryValue}
                items={categoryData}
                setOpen={setCategoryOpen}
                setValue={onSetCategoryValue}
                setItems={setCategoryData}
                placeholder="Select Category"
                style={styles.dropdown}
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
            {/* <DateTimePicker
                value={purchaseDate}
                mode="date"
                display="default"
                onChange={onDateChange}
            /> */}
            <DropDownPicker
                open={sourceOpen}
                value={sourceValue}
                items={sourceData}
                setOpen={setSourceOpen}
                setValue={setSourceValue}
                setItems={setSourceData}
                placeholder="Select Source"
                style={styles.dropdown}
            />
            <MaterialTextInput
                placeholder="Enter Description"
                style={styles.textInput}
                value={description}
                mode="outlined"
                label="Description"
                onChangeText={handleDescriptionChange}
            />
                    <Button title="Pick an Image" onPress={handleImageChange} />
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
                style={styles.dropdown}
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
                    onPress={() => console.log("Submit clicked")}
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
    image: {
        width: 200,
        height: 200,
        marginTop: 16,
        borderRadius: 8,
    },
});

export default Expence;
