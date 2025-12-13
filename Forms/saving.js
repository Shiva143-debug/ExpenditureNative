import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuth } from '../AuthContext';
import { addSaving } from '../services/apiService';
import ThemedText from '../components/ThemedText';
import ThemedTextInput from '../components/ThemedTextInput';
import ThemedTextAreaInput from '../components/ThemedTextAreaInput';
import { ScrollView } from 'react-native-gesture-handler';
import LoaderSpinner from '../LoaderSpinner';

const Saving = ({ palette }) => {
  const { id } = useAuth();
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
      await addSaving({ id, amount, date, note });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Saving added successfully', position: 'top', visibilityTime: 3000, autoHide: true });
      handleClear();
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
      <ThemedText style={[styles.label, { color: palette.savingText }]}>Amount (₹) :</ThemedText>
      <ThemedTextInput
        style={[styles.input, { borderColor: palette.savingBorder }]}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <ThemedText style={[styles.label, { color: palette.savingText }]}>Date :</ThemedText>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={[styles.dateButton, { borderColor: palette.savingBorder }]}
      >
        <ThemedText style={[styles.dateButtonText, { color: date ? palette.savingText : palette.tabInactiveText }]}>
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
      <ThemedText style={[styles.label, { color: palette.savingText }]}>Note (Optional) :</ThemedText>
      <ThemedTextAreaInput
        style={[styles.textArea, { borderColor: palette.savingBorder }]}
        placeholder="Add a note about this saving"
        value={note}
        onChangeText={setNote}
      />
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={handleClear} activeOpacity={0.85}>
          <LinearGradient colors={palette.savingClearGradient} style={styles.buttonGradient}>
            <ThemedText style={styles.buttonText}>Clear</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
          <LinearGradient colors={palette.savingButtonGradient} style={styles.buttonGradient}>
            <ThemedText style={styles.buttonTextPrimary}>Add</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </ScrollView>
    <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
  },
   scrollContainer: {
    flexGrow: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    marginTop: 10,
  },
  input: {
    marginBottom: 40,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 40,
  },
  dateButtonText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  buttonTextPrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default Saving;
