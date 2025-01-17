import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from './AuthContext';

const ExpenseByCategoryList = () => {
    const { id } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [expenses, setExpenses] = useState([]);
  const [groupedExpenses, setGroupedExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [openYear, setOpenYear] = useState(false);
    const [Year, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [years, setYears] = useState([
      { label: '2024', value: '2024' },
      { label: '2025', value: '2025' },
      { label: '2026', value: '2026' },
  
    ]);
  

  useEffect(() => {
    const userId = id;
    // Fetch expenses for the selected year
    fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${userId}`)
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => console.log(err));
  }, [year]);

  const filteredTotalCostData = expenses.filter(
    (d) => d.year.toString() === Year
  );

  useEffect(() => {
    // Group expenses by category
    const grouped = filteredTotalCostData.reduce((acc, curr) => {
      const { category, cost } = curr;
      acc[category] = (acc[category] || 0) + parseFloat(cost);
      return acc;
    }, {});

    const groupedArray = Object.keys(grouped).map((key) => ({
      category: key,
      TotalCost: grouped[key],
    }));

    setGroupedExpenses(groupedArray);
    const total = groupedArray.reduce((sum, item) => sum + item.TotalCost, 0);
    setTotalAmount(total); 
  }, [Year,expenses]);

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Expenses by Category</Text> */}
      <DropDownPicker open={openYear} value={Year} items={years} setValue={setSelectedYear} setItems={setYears} placeholder="Select Year" style={styles.dropdown} dropDownContainerStyle={styles.dropdownList} listMode="SCROLLVIEW"
      setOpen={(isOpen) => {
        setOpenYear(isOpen);
      }}
      />
       <Text style={styles.totalText}>Total Expence Amount: ₹ {totalAmount}</Text>
      <FlatList
        data={groupedExpenses}
        keyExtractor={(item) => item.category}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.category}>{item.category}</Text>
            <Text>Total Cost: ₹{item.TotalCost}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default ExpenseByCategoryList;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  picker: { height: 50, marginBottom: 20 },
  item: { marginBottom: 10, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8 },
  category: { fontSize: 18, fontWeight: 'bold' },
  dropdown: { borderColor: "#ccc", width: "90%", marginBottom: 10 },
  dropdownList: { zIndex: 1, maxHeight: 800 },
  totalText: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
});
