import { useEffect, useState } from "react";
import { TextInput as MaterialTextInput, Button } from 'react-native-paper';
import { Text, View, StyleSheet,FlatList } from 'react-native';

import {styleConstants} from "./Styles"
// import { FlatList } from "react-native-gesture-handler";
// import axios from 'axios';
// import Toast from 'react-native-toast-message';

const Source = () => {

    const [sourceName, setSourceName] = useState("")
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState("")

    // const [categoryData,setCategoryData]=useState([])

    // itemArray=["a","b","c","d"]

    // useEffect(() => {
    //     const userId = 1;
    //     fetch(`https://exciting-spice-armadillo.glitch.me/categories/${userId}`)
    //         .then(res => res.json())
    //         .then(data =>setCategoryData(data)
    //             .catch(err => console.log(err))
    //         )
    //         .catch(err => console.log(err))
    // }, [1])


    const handleSourceNameChange = (source) => {
        setSourceName(source)
    }

    const handleAmountChange = (amount) => {
        setAmount(amount)
    }

    const handleDateChange = (date) => {
        setDate(date)
    }

    // const onSourceSubmit=()=>{
    //     const values = {id:1,source: sourceName, amount, date}
    //     axios.post("https://exciting-spice-armadillo.glitch.me/addSource", values)
        // .then(res => {
        //     console.log(res.data);
        //     // Toast.show({type: 'success',text1: 'Success',text2: 'Source of Income added successfully!',});
        //     setSourceName('');
        //     setAmount('');
        //     setDate('');
        //   })
        //   .catch(err => {
        //     console.error(err);
        //     // Toast.show({type: 'error',text1: 'Error',text2: 'Failed to add Source of Income.',})
        // });
    // }

    const onSourceSubmit = () => {
        const values = { id: 1, source: sourceName, amount, date };
        axios
          .post('https://exciting-spice-armadillo.glitch.me/addSource', values)
          .then(res => {
            console.log(res.data);
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'Source of Income added successfully!',
            });
            // Reset form
            setSourceName('');
            setAmount('');
            setDate('');
          })
          .catch(err => {
            console.error(err);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to add Source of Income.',
            });
          });
      };

    //   const renderRowItem=(rowItem)=>{
    //     console.log(rowItem.item.category)
    //     return(
    //         <View>
    //             <Text>{rowItem.item.category}</Text>
    //         </View>
    //     )
    //   }

    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.MainText}>SOURCE OF INCOME</Text>
            <MaterialTextInput placeholder="Enter source" style={styles.textInput} value={sourceName} mode="outlined" label="Source Name" onChangeText={handleSourceNameChange} />
            <MaterialTextInput placeholder="Enter Amount" style={styles.textInput} value={amount} mode="outlined" label="Amount" keyboardType="numeric" onChangeText={handleAmountChange} />
            <MaterialTextInput placeholder="DD/MM/YYYY" style={styles.textInput} value={date} mode="outlined" label="Enter Date" keyboardType="numeric" onChangeText={handleDateChange} />
            <View style={styles.Buttoncontainer}>
                <Button mode="contained" onPress={() => console.log('Pressed')} theme={{ colors: { primary: 'black' } }} style={styles.button}> Clear</Button>
                <Button mode="contained" onPress={() =>onSourceSubmit} theme={{ colors: { primary: 'green' } }} style={styles.button}> Submit</Button>
            </View>
{/* 
            <View>
                <FlatList 
                 data={categoryData}
                 renderItem={renderRowItem}
                />
            </View> */}
        </View>
    )
}

const styles = StyleSheet.create({
    Buttoncontainer: {
        flexDirection: 'row', 
        justifyContent: 'space-between',
        padding: 10, 
    },
    button: {
       margin:styleConstants.margin
    },
    textInput:{
        margin:styleConstants.marginTop
    },
    MainText:{
        fontSize:styleConstants.fontSize,
        marginTop:styleConstants.mainTextMarginTop,
        textAlign:styleConstants.textAlign,
        fontWeight:styleConstants.textFontWeight
    }

})

export default Source