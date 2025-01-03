import React, { useState } from "react";
import { TextInput as MaterialTextInput, Button } from "react-native-paper";
import { Text, View, StyleSheet,ScrollView } from "react-native";
import { styleConstants } from "./Styles";
import { useAuth } from "./AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios"; 
import Toast from "react-native-toast-message"; 

const Source = () => {
  const { id } = useAuth();
  console.log(id);

  const [sourceName, setSourceName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date()); 
  const [showDatePicker, setShowDatePicker] = useState(false); 

  const handleSourceNameChange = (source) => setSourceName(source);
  const handleAmountChange = (amount) => setAmount(amount);
  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onSourceSubmit = () => {
    const formattedDate = date.toISOString().split("T")[0]; 
    const values = { id: id, source: sourceName, amount, date: formattedDate };

    axios
      .post("https://exciting-spice-armadillo.glitch.me/addSource", values)
      .then((res) => {
        console.log(res.data);
        Toast.show({ type: "success", text1: "Success", text2: "Source of Income added successfully!"});
        setSourceName("");
        setAmount("");
        setDate(new Date());
      })
      .catch((err) => {
        console.error(err);
        Toast.show({ type: "error", text1: "Error", text2: "Failed to add Source of Income.",});
      });
  };

  return (
    <ScrollView contentContainerStyle={{  flex: 1 }}>
    <View style={{ flex: 1}}>
      {/* <Text style={styles.MainText}>SOURCE OF INCOME</Text> */}
      <MaterialTextInput placeholder="Enter source" style={styles.textInput} value={sourceName} mode="outlined" label="Source Name" onChangeText={handleSourceNameChange}/>
      <MaterialTextInput placeholder="Enter Amount" style={styles.textInput} value={amount} mode="outlined" label="Amount" keyboardType="numeric" onChangeText={handleAmountChange}/>
      <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.dateButton} theme={{ colors: { primary: "blue" } }}>
        Select Date
        {/* : {date.toLocaleDateString()} */}
      </Button>
      {showDatePicker && (
        <DateTimePicker value={date}  mode="date"  display="default"  onChange={handleDateChange}/>
      )}
      <View style={styles.Buttoncontainer}>
        <Button mode="contained" onPress={() => { setSourceName(""); setAmount(""); setDate(new Date()); }} theme={{ colors: { primary: "black" } }} style={styles.button}>Clear </Button>
        <Button mode="contained" onPress={onSourceSubmit} theme={{ colors: { primary: "green" } }} style={styles.button}>Submit</Button>
      </View>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  Buttoncontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  button: {
    margin: styleConstants.margin,
  },
  dateButton: {
    marginTop: styleConstants.marginTop,
    margin: styleConstants.margin,
  },
  textInput: {
    margin: styleConstants.marginTop,
  },
  MainText: {
    fontSize: styleConstants.fontSize,
    marginTop: styleConstants.mainTextMarginTop,
    textAlign: styleConstants.textAlign,
    fontWeight: styleConstants.textFontWeight,
  },
});

export default Source;
