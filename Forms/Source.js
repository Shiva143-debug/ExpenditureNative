import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";
import { useAuth } from "../AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import ThemedTextInput from '../components/ThemedTextInput';
import LinearGradient from 'react-native-linear-gradient';
import { getDefaultSources, addSource, addDefaultSource } from '../services/apiService';
import LoaderSpinner from "../LoaderSpinner";

const Source = () => {
  const { id } = useAuth();
  console.log(id);

  const [sourceName, setSourceName] = useState("");
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceValue, setSourceValue] = useState(null);
  const [sourceData, setSourceData] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleSourceChange = (sourceName) => setSourceName(sourceName);
  const handleAmountChange = (amount) => setAmount(amount);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isAddingSourceName, setIsAddingSourceName] = useState(false);

  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDate(formattedDate);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchSources = async () => {
      try {
        const data = await getDefaultSources(id);
        console.log(data);
        if (data) {
          const transformedData = data.map(item => ({
            label: item.source_name,
            value: item.source_name,
            key: item.id.toString()
          }));
          setSourceData(transformedData);
        }

      } catch (error) {
        console.error('Error fetching sources:', error);
        Toast.show({ type: "error", text1: "Error", text2: "Failed to fetch sources", position: "top" });
      }
    };

    fetchSources();
  }, [id, refreshFlag]);

  const onSourceSubmit = async () => {
    // Validate required fields
    if (!sourceValue) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Please select a source", position: "top" });
      return;
    }

    else if (!amount || amount.trim() === '') {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter an amount", position: "top" });
      return;
    }

    else if (!date) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Please select a date", position: "top" });
      return;
    }
    try {
      setIsAddingSource(true);
      const sourceData = { id: id, source: sourceValue, amount, date };
      await addSource(sourceData);
      Toast.show({
        type: "success", text1: "Success", text2: "Source added successfully", position: "top", visibilityTime: 3000, autoHide: true
      });

    } catch (error) {
      console.error('Error submitting Source:', error);
      Toast.show({ type: "error", text1: "Error", text2: "Failed to add Source", position: "top" });
    } finally {
      setIsAddingSource(false);
      setSourceValue("");
      setAmount("");
      setDate('');
    }
  };

  const onDialogOpen = () => {
    console.log("button Clicked")
    setVisible(!visible)
  }

  const hideDialog = () => {
    setVisible(false);
    setSourceName("")
  }

  const handleSourceSubmit = async () => {
    if (!sourceName) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter a source name", visibilityTime: 3000, autoHide: true });
      return;
    }
    try {
      setIsAddingSourceName(true);
      let sourceData = { id, sourceName }
      await addDefaultSource(sourceData);
      Toast.show({
        type: "success", text1: "Success", text2: "Source Name added successfully", position: "top", visibilityTime: 3000, autoHide: true
      });
      setRefreshFlag((prev) => !prev);

    } catch (error) {
      console.error('Error submitting Source Name:', error);
      Toast.show({ type: "error", text1: "Error", text2: "Failed to add Source Name", position: "top" });
    } finally {
      setIsAddingSourceName(false);
      setSourceName("");
      hideDialog();

    }
  }

  return (
    <>
      <LoaderSpinner shouldLoad={isAddingSource || isAddingSourceName} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.formContainer}>
            <View style={styles.sourceHeader}>
              <ThemedText style={styles.label}>Select Source:</ThemedText>
              <TouchableOpacity onPress={onDialogOpen}>
                <Icon name="add-circle" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>

            <DropDownPicker open={sourceOpen} value={sourceValue} items={sourceData} setOpen={setSourceOpen}
              setValue={setSourceValue} setItems={setSourceData} placeholder="Select Source"
              style={styles.dropdown} listMode="SCROLLVIEW" dropDownContainerStyle={styles.dropdownList} textStyle={styles.dropdownText}
            />

            <ThemedText style={styles.label}>Amount:</ThemedText>
            <ThemedTextInput placeholder="Enter Amount" value={amount}
              onChangeText={handleAmountChange} keyboardType="numeric" style={styles.input} />
            <ThemedText style={styles.label}>Select Date:</ThemedText>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
              <ThemedText style={styles.dateButtonText}>
                {date ? date : 'Select Date'}
              </ThemedText>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker value={date ? new Date(date) : new Date()}
                mode="date" display="default" onChange={handleDateChange} />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => { setSourceValue(""); setAmount(""); setDate(''); }} style={styles.clearButton}>
                <LinearGradient colors={['#757575', '#616161']} style={styles.buttonGradient}>
                  <ThemedText style={styles.buttonText}>Clear</ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={onSourceSubmit} style={styles.submitButton}>
                <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.buttonGradient}>
                  <ThemedText style={styles.buttonText}>Submit</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ThemedView>

          <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={hideDialog}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <ThemedView style={styles.modalContent}>
                  <ThemedText style={styles.modalTitle}>Add New Source</ThemedText>

                  <ThemedView style={styles.inputContainer}>
                    <ThemedText style={styles.modalLabel}>Source Name:</ThemedText>
                    <ThemedTextInput placeholder="Enter Source Name" value={sourceName} onChangeText={handleSourceChange} style={styles.modalInput} />
                  </ThemedView>

                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity onPress={hideDialog} style={styles.modalButton}>
                      <LinearGradient colors={['#757575', '#616161']} style={styles.buttonGradient}>
                        <ThemedText style={styles.buttonText}>Close</ThemedText>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSourceSubmit} style={styles.modalButton}>
                      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.buttonGradient}>
                        <ThemedText style={styles.buttonText}>Add </ThemedText>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </ThemedView>
              </View>
            </View>
          </Modal>
        </ThemedView>
      </ScrollView>
      <Toast />
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
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 20,
    borderRadius: 10,
    margin: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  formContainer: {
    padding: 2,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  dropdown: {
    borderColor: '#ccc',
    marginBottom: 15,
    borderRadius: 8,
  },
  dropdownList: {
    borderColor: '#ccc',
    maxHeight: 200,
  },
  dropdownText: {
    fontSize: 16,
  },
  input: {
    marginBottom: 15,
  },
  dateButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
    textAlign: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(190, 189, 189, 0.5)',
  },
  modalContainer: {
    height: 300,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  modalInput: {
    marginBottom: 10,
    borderRadius: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default Source;
