import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import LinearGradient from 'react-native-linear-gradient';
import { getIncomeSources, addIncome, addIncomeSource, } from '../../services/apiService';
import { useFocusEffect } from "@react-navigation/native";
import LoaderSpinner from "../../components/LoaderSpinner";
import { useTheme } from "../../theme/useTheme";
import { inputStyles as formStyles } from '../../styles';
import FormDropdown from '../../components/FormDropdown';

const Source = () => {
  const { palette: themePalettes } = useTheme();
  const palette = themePalettes.form;

  const [sourceName, setSourceName] = useState("");
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceValue, setSourceValue] = useState(null);
  const [sourceData, setSourceData] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleSourceChange = value => setSourceName(value);
  const handleAmountChange = value => setAmount(value);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isAddingSourceName, setIsAddingSourceName] = useState(false);

  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDate(formattedDate);
    }
  };


      useFocusEffect(
          React.useCallback(() => {
              // Reset all form fields and dropdowns when screen comes into focus
              setSourceOpen(false);
              setSourceValue(null);
              setSourceName("");
              setAmount("");
              setDate('');
              return () => { };
          }, [])
      );
  
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await getIncomeSources();
        if (response?.status) {
          const data = response.data;
          const transformedData = data.map(item => ({
            label: item.sourceName,
            value: item.id,
            key: item.id.toString()
          }));
          setSourceData(transformedData);
        } else {
          Toast.show({ type: "error", text1: "Error", text2: response?.message || "Failed to fetch sources", position: "top" });
        }

      } catch (error) {
        console.error('Error fetching sources:', error);
        Toast.show({ type: "error", text1: "Error", text2: "Failed to fetch sources", position: "top" });
      }
    };

    fetchSources();
  }, [refreshFlag]);

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
      const payload = { sourceId: sourceValue, amount, date };
      const response = await addIncome(payload);
      if (response?.status) {
        Toast.show({
          type: "success", text1: "Success", text2: response.message || "Source added successfully", position: "top", visibilityTime: 3000, autoHide: true
        });
      } else {
        Toast.show({
          type: "error", text1: "Error", text2: response?.message || "Failed to add Source", position: "top"
        });
      }

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
      const payload = { sourceName };
      const response = await addIncomeSource(payload);
      if (response?.status) {
        Toast.show({
          type: "success", text1: "Success", text2: response.message || "Source Name added successfully", position: "top", visibilityTime: 3000, autoHide: true
        });
        setRefreshFlag((prev) => !prev);
      } else {
        Toast.show({
          type: "error", text1: "Error", text2: response?.message || "Failed to add Source Name", position: "top"
        });
      }

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
      <ScrollView contentContainerStyle={styles.scrollContainer} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
          <View style={formStyles.fieldGroup}>
            <View style={styles.sourceHeader}>
              <ThemedText style={[formStyles.label, { color: palette.textSecondary, marginBottom: 0 }]}>Select Source of Income:</ThemedText>
              <TouchableOpacity onPress={onDialogOpen}>
                <Icon name="add-circle" size={24} color={palette.primary} />
              </TouchableOpacity>
            </View>

            <FormDropdown
              open={sourceOpen} onOpenChange={setSourceOpen}
              value={sourceValue} onChange={setSourceValue}
              items={sourceData} setItems={setSourceData}
              placeholder="Select Source" palette={palette} zClosed={1000}
            />
          </View>

          <View style={formStyles.fieldGroup}>
            <ThemedText style={[formStyles.label, { color: palette.textSecondary }]}>Amount (₹) :</ThemedText>
            <ThemedTextInput placeholder="Enter Amount" value={amount}
              onChangeText={handleAmountChange} keyboardType="numeric" style={[formStyles.input, { borderColor: palette.fieldBorder }]} />
          </View>

          <View style={formStyles.fieldGroup}>
            <ThemedText style={[formStyles.label, { color: palette.textSecondary }]}>Date:</ThemedText>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[formStyles.dateButton, { borderColor: palette.fieldBorder }]}>
              <ThemedText style={[formStyles.dateButtonText, { color: date ? palette.textPrimary : palette.textSecondary }]}>
                {date ? date : 'Select Date'}
              </ThemedText>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker value={date ? new Date(date) : new Date()}
                mode="date" display="default" onChange={handleDateChange} />
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => { setSourceValue(""); setAmount(""); setDate(''); }} style={styles.clearButton}>
              <LinearGradient colors={['#64748b', '#475569']} style={formStyles.buttonGradient}>
                <ThemedText style={styles.buttonText}>Clear</ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={onSourceSubmit} style={styles.submitButton}>
              <LinearGradient colors={['#4CAF50', '#2E7D32']} style={formStyles.buttonGradient}>
                <ThemedText style={styles.buttonText}>Submit</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
      </ScrollView>

          <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={hideDialog}>
            <View style={[styles.modalOverlay, { backgroundColor: palette.glassOverlay }]}>
              <View style={[styles.modalContainer, { backgroundColor: palette.glassContainer, borderColor: palette.glassBorder }]}>
                <ThemedText style={[styles.modalTitle, { color: palette.textPrimary }]}>Add New Source</ThemedText>

                <View style={styles.inputContainer}>
                  <ThemedText style={[styles.modalLabel, { color: palette.textSecondary }]}>Source Name:</ThemedText>
                  <ThemedTextInput placeholder="Enter Source Name" value={sourceName} onChangeText={handleSourceChange} style={[styles.modalInput, { borderColor: palette.fieldBorder }]} />
                </View>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity onPress={hideDialog} style={styles.modalButton}>
                    <LinearGradient colors={['#64748b', '#475569']} style={formStyles.buttonGradient}>
                      <ThemedText style={styles.buttonText}>Close</ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSourceSubmit} style={styles.modalButton}>
                    <LinearGradient colors={['#4CAF50', '#2E7D32']} style={formStyles.buttonGradient}>
                      <ThemedText style={styles.buttonText}>Add</ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
       
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  clearButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
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
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 0,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default Source;
