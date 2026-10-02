import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { addSaving } from '../../services/apiService';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import LoaderSpinner from '../../components/LoaderSpinner';
import ThemedTextAreaInput from '../../components/ThemedTextAreaInput';
import { inputStyles as formStyles } from '../../styles';


const Saving = ({ palette }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isAddingSaving, setIsAddingSaving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      // Reset all form fields when screen comes into focus
      setAmount('');
      setDate('');
      setNote('');
      return () => { };
    }, [])
  );

  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleClear = () => {
    setAmount('');
    setDate('');
    setNote('');
  };

  const handleSubmit = async () => {
    if (!amount.trim()) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please enter amount', position: 'top' });
      return;
    }
    if (!date) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please select date', position: 'top' });
      return;
    }
    try {
      setIsAddingSaving(true);
      const response = await addSaving({ amount, date, note });
      if (response?.status) {
        Toast.show({ type: 'success', text1: 'Success', text2: response.message || 'Saving added successfully', position: 'top', visibilityTime: 3000, autoHide: true });
        handleClear();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: response?.message || 'Failed to add saving', position: 'top' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to add saving', position: 'top' });
    } finally {
      setIsAddingSaving(false);
    }
  };

  return (
    <>
      <LoaderSpinner shouldLoad={isAddingSaving} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={formStyles.fieldGroup}>
        <ThemedText style={[formStyles.label, { color: palette.savingText }]}>Amount (₹) :</ThemedText>
        <ThemedTextInput
          style={[formStyles.input, { borderColor: palette.savingBorder }]}
          placeholder="Enter amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>
      <View style={formStyles.fieldGroup}>
        <ThemedText style={[formStyles.label, { color: palette.savingText }]}>Date :</ThemedText>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[formStyles.dateButton, { borderColor: palette.savingBorder }]}
        >
          <ThemedText style={[formStyles.dateButtonText, { color: date ? palette.savingText : palette.tabInactiveText }]}>
            {date || 'Select Date'}
          </ThemedText>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date ? new Date(date) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>
      <View style={formStyles.fieldGroup}>
        <ThemedText style={[formStyles.label, { color: palette.savingText }]}>Note (Optional) :</ThemedText>
        <ThemedTextAreaInput
          style={[formStyles.textArea, { borderColor: palette.savingBorder }]}
          placeholder="Add a note about this saving"
          value={note}
          onChangeText={setNote}
        />
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={handleClear} activeOpacity={0.85}>
          <LinearGradient colors={palette.savingClearGradient} style={formStyles.buttonGradient}>
            <ThemedText style={styles.buttonText}>Clear</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
          <LinearGradient colors={palette.savingButtonGradient} style={formStyles.buttonGradient}>
            <ThemedText style={styles.buttonTextPrimary}>Submit</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </ScrollView>
    <Toast />
    </>
  );
};

const styles = StyleSheet.create({
   scrollContainer: {
    flexGrow: 1,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonTextPrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default Saving;
