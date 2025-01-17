import React, { useState, useEffect } from "react";
import { TextInput as MaterialTextInput, Button, Dialog, Portal } from "react-native-paper";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { styleConstants } from "./Styles";
import { useAuth } from "./AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import Toast from "react-native-toast-message";
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Source = () => {
  const { id } = useAuth();
  console.log(id);

  const [sourceName, setSourceName] = useState("");
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceValue, setSourceValue] = useState("");
  const [sourceData, setSourceData] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);


  const handleSourceChange = (sourceName) => setSourceName(sourceName);
  const handleAmountChange = (amount) => setAmount(amount);

  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDate(formattedDate);
    }
  };

  useEffect(() => {
    const userId = id;
    fetch(`https://exciting-spice-armadillo.glitch.me/getdefaultsources/${userId}`)
      .then(res => res.json())
      .then(data => {
        const transformedData = data.map(item => ({
          label: item.source_name,
          value: item.source_name,
          key: item.id
        }));
        setSourceData(transformedData);
      })
      .catch(err => console.log(err));

  }, [id,refreshFlag]);

  const onSourceSubmit = () => {
    const values = { id: id, source: sourceValue, amount, date };
    axios
      .post("https://exciting-spice-armadillo.glitch.me/addSource", values)
      .then((res) => {
        console.log(res.data);
        Toast.show({ type: "success", text1: "Success", text2: "Source of Income added successfully!" });
        setSourceValue("");
        setAmount("");
        setDate('');
      })
      .catch((err) => {
        console.error(err);
        Toast.show({ type: "error", text1: "Error", text2: "Failed to add Source of Income.", });
      });
  };

  const onDialogOpen = () => {
    console.log("button Clicked")
    setVisible(!visible)
  }

  const hideDialog = () => {
    setVisible(false);
    setSourceName("")
  }

  const handleSourceSubmit = () => {
    if (!sourceName) {
      console.log("noo")
      return;
    }
    let sourceData = { id, sourceName }
    axios.post("https://exciting-spice-armadillo.glitch.me/adddefaultsource", sourceData)
      .then(res => {
        console.log(res);
        setSourceName("")
        hideDialog();
        setRefreshFlag((prev) => !prev);
      })
      .catch(err => {
        setSourceName("")
        console.log(err);
      });

    hideDialog();
  }

  return (
    <ScrollView contentContainerStyle={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Icon name="add-circle" size={20} color="gray" onPress={onDialogOpen} style={styles.icon} />
        <DropDownPicker open={sourceOpen} value={sourceValue} items={sourceData} setOpen={setSourceOpen} setValue={setSourceValue} setItems={setSourceData} placeholder="Select Source" style={styles.dropdown} listMode="SCROLLVIEW" dropDownContainerStyle={styles.dropdownList} />
        <MaterialTextInput placeholder="Enter Amount" style={styles.textInput} value={amount} mode="outlined" label="Amount" keyboardType="numeric" onChangeText={handleAmountChange} />

        <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.dateButton} >Date: {date}</Button>
        {showDatePicker && (<DateTimePicker value={new Date()} mode="date" display="default" onChange={handleDateChange} />)}

        <View style={styles.Buttoncontainer}>
          <Button mode="contained" onPress={() => { setSourceValue(""); setAmount(""); setDate(''); }} theme={{ colors: { primary: "black" } }} style={styles.button}>Clear </Button>
          <Button mode="contained" onPress={onSourceSubmit} theme={{ colors: { primary: "green" } }} style={styles.button}>Submit</Button>
        </View>
      </View>

      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
          <Dialog.Content>
            <MaterialTextInput placeholder="Enter Source Name" style={styles.textInput} value={sourceName} mode="outlined" label="Source" onChangeText={handleSourceChange} />
          </Dialog.Content>
          <Dialog.Actions>
            <View style={styles.DialogButtoncontainer}>
              <Button mode="contained" onPress={hideDialog} theme={{ colors: { primary: 'black' } }} style={styles.button}> Close</Button>
              <Button mode="contained" onPress={handleSourceSubmit} theme={{ colors: { primary: 'green' } }} style={styles.button}> Submit</Button>
            </View>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  dropdown: { borderColor: '#ccc', margin: styleConstants.margin, width: "90%", zIndex: 1, },
  dropdownList: { maxHeight: 800 },
  dialog: {
    alignSelf: 'center',
    width: '90%',
  },
  DialogButtoncontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }, icon: {
    paddingLeft: "90%"
  }
});

export default Source;
