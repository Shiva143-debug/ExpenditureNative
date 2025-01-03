import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from './AuthContext';
import CustomDropdown from "./CustomDropdown";

const Dashboard = () => {
  const { id } = useAuth();
  console.log(id)
  const [openMonth, setOpenMonth] = useState(false);
  const [Month, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [months, setMonths] = useState([
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ]);

  const [openYear, setOpenYear] = useState(false);
  const [Year, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [years, setYears] = useState([
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' },
    { label: '2026', value: '2026' },
    
  ]);

  const [totalCostData, setExpenseCost] = useState([]);
  const [totalIncomeData, setTotalIncome] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const userId = id;
    fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${userId}`)
      .then(res => res.json())
      .then(data => setExpenseCost(data))
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    const userId = id;
    if (Month && Year) {
      fetch(`https://exciting-spice-armadillo.glitch.me/getSource/${userId}/${Month}/${Year}`)
        .then(res => res.json())
        .then(data => setTotalIncome(Array.isArray(data) ? data : []))
        .catch(err => console.log(err));
    }
  }, [Month, Year]);

  const filteredTotalCostData = totalCostData.filter(
    (d) => d.month.toString() === Month && d.year.toString() === Year
  );

  const groupedData = filteredTotalCostData.reduce((acc, curr) => {
    const { category, cost } = curr;
    acc[category] = (acc[category] || 0) + parseFloat(cost);
    return acc;
  }, {});

  const groupedArray = Object.keys(groupedData).map((key) => ({
    category: key,
    TotalCost: groupedData[key],
  }));

  const totalAmount = groupedArray.reduce((acc, curr) => acc + curr.TotalCost, 0);
  const grandTotal = totalIncomeData.reduce((acc, curr) => acc + curr.amount, 0);

  const handlePressExpence = () => {
    navigation.navigate('ExpensesList', { id, Month, Year });
  };

  const handlePressIncome = () => {
    navigation.navigate('IncomeList', { id, Month, Year });
  };

  const handlePressBalance = () => {
    navigation.navigate('BalanceList', { id });
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
      <View style={styles.container}>
        <View style={styles.dropdownContainer}>
          {!openYear && (
            <DropDownPicker open={openMonth} value={Month} items={months} setValue={setSelectedMonth} setItems={setMonths} placeholder="Select Month" style={styles.dropdown} dropDownContainerStyle={styles.dropdownList}  listMode="SCROLLVIEW" 
              setOpen={(isOpen) => {
                setOpenMonth(isOpen);
                if (isOpen) setOpenYear(false);
              }}
            />
          )}

          {!openMonth && (
            <DropDownPicker open={openYear} value={Year} items={years} setValue={setSelectedYear} setItems={setYears} placeholder="Select Year" style={styles.dropdown} dropDownContainerStyle={styles.dropdownList} listMode="SCROLLVIEW" 
              setOpen={(isOpen) => {
                setOpenYear(isOpen);
                if (isOpen) setOpenMonth(false);
              }} />
          )}
        </View>

        <View style={styles.summary}>

          <TouchableOpacity onPress={handlePressIncome}>
            <ImageBackground
              source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735803679/income2_v3vifl.webp' }}
              style={styles.IncomeCard}
            >
              <Text style={styles.summaryText}> {months.find((m) => m.value === Month)?.label}  Income</Text>
              <Text style={styles.summaryText2}><Icon name="currency-rupee" size={20} /> {grandTotal}</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePressExpence}>
            <ImageBackground
              source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735804218/expece2_zefk2f.webp' }}
              style={styles.ExpenceCard}
            >
              <Text style={styles.summaryText}>{months.find((m) => m.value === Month)?.label} Expences </Text>
              <Text style={styles.summaryText2}> <Icon name="currency-rupee" size={20} />{totalAmount}</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePressBalance}>
            <ImageBackground
              source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735804863/available_cterqk.webp' }}
              style={styles.BalanceCard}
            >
              <Text style={styles.summaryThirdText1}> Available Balance</Text>
              <Text style={styles.summaryThirdText2}> <Icon name="currency-rupee" size={20} />{grandTotal - totalAmount}</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  dropdownContainer: { marginBottom: 20 },
  dropdown: { borderColor: "#ccc", width: "90%", marginBottom: 10 },
  dropdownList: { zIndex: 1,maxHeight: 800 },
  summary: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: 5 },
  summaryText: { fontSize: 28, fontWeight: "bold", color: "white" },
  summaryText2: { fontSize: 28, fontWeight: "bold", paddingBottom: 10 },
  summaryThirdText1: { fontSize: 28, fontWeight: "bold", paddingTop: 10, color: "white" },
  summaryThirdText2: { fontSize: 28, fontWeight: "bold", paddingTop: 90, color: "green" },
  IncomeCard: { width: 400, height: 200, padding: 30, marginBottom: 20, display: "flex", justifyContent: "center", alignItems: "center" },
  ExpenceCard: { width: 400, height: 200, padding: 25, marginBottom: 20, display: "flex", },
  BalanceCard: { width: 400, height: 200, padding: 25, marginBottom: 20, color: "white" }
});

export default Dashboard;
