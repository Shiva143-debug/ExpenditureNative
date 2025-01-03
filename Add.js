import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet,ScrollView } from 'react-native';
import Expence from './Expence';
import Source from './Source';


const Add = () => {
  const [selectedTab, setSelectedTab] = useState('expense');

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            selectedTab === 'expense' ? styles.selectedExpense : styles.unselected,
          ]}
          onPress={() => handleTabChange('expense')}
        >
          <Text style={styles.buttonText}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            selectedTab === 'income' ? styles.selectedIncome : styles.unselected,
          ]}
          onPress={() => handleTabChange('income')}
        >
          <Text style={styles.buttonText}>Income</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.componentContainer}>
        {selectedTab === 'expense' ? <Expence /> : <Source/>}
      </View>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedExpense: {
    backgroundColor: 'red',
  },
  selectedIncome: {
    backgroundColor: 'green',
  },
  unselected: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  componentContainer: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Add;
