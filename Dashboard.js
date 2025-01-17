import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from './AuthContext';


const Dashboard = () => {
  const { id } = useAuth();
  // console.log(id)
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
  const [totalTaxAmount, setTotalTaxAmount] = useState(0);
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

  useEffect(() => {
    const totalTax = filteredTotalCostData.reduce((acc, curr) => {
      const taxAmount = parseFloat(curr.tax_amount) || 0;
      return acc + taxAmount;
    }, 0);
    setTotalTaxAmount(totalTax);
  }, [filteredTotalCostData]);

  const handlePressExpence = () => {
    navigation.navigate('ExpensesList', { id, Month, Year });
  };

  const handlePressIncome = () => {
    navigation.navigate('IncomeList', { id, Month, Year });
  };

  const handlePressBalance = () => {
    navigation.navigate('BalanceList', { id });
  }

  const handlePressTax=()=>{
    const expensesWithTax = filteredTotalCostData.filter((item) => parseFloat(item.tax_amount) > 0);
    navigation.navigate('TaxAmountList', { expensesWithTax });
  }

  const handlePressExpenceByCat=()=>{
    navigation.navigate('ExpenseByCategoryList');
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
      <View style={styles.container}>
        <View style={styles.dropdownContainer}>
          {!openYear && (
            <DropDownPicker open={openMonth} value={Month} items={months} setValue={setSelectedMonth} setItems={setMonths} placeholder="Select Month" style={styles.dropdown} dropDownContainerStyle={styles.dropdownList} listMode="SCROLLVIEW"
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
          <Text style={{ fontWeight: "bold", paddingBottom: 10 }}>{months.find((m) => m.value === Month)?.label} Month </Text>
         

            <ImageBackground
              source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735803679/income2_v3vifl.webp' }}
              style={styles.IncomeCard}
            >
              <Text style={styles.summaryText2}><Icon name="currency-rupee" size={20} /> {grandTotal}</Text>
              <Icon name="arrow-forward" size={40}  style={styles.incomeicon} onPress={handlePressIncome} />
            </ImageBackground>
     

          
            <ImageBackground
              source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735804218/expece2_zefk2f.webp' }}
              style={styles.ExpenceCard}
            >
              <Text style={styles.summaryText3}> <Icon name="currency-rupee" size={20} />{totalAmount}</Text>
              <Icon name="arrow-forward" size={40}  style={styles.expenceicon} onPress={handlePressExpence} />
            </ImageBackground>
        

         
            <ImageBackground
              source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1735804863/available_cterqk.webp' }}
              style={styles.BalanceCard}
            >

              <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={[styles.summaryThirdText2, { color: (grandTotal - totalAmount) < 0 ? "red" : "green" }]}> <Icon name="currency-rupee" size={20} />{Math.abs(grandTotal - totalAmount)}</Text>
                <View style={{ paddingTop: 120, display: "flex", alignItems: "center" }}>
                  <Icon name="arrow-forward" size={40}  style={styles.balanceicon} onPress={handlePressBalance} />
                  <Text > View Total Balance</Text>
                </View>
              </View>
            </ImageBackground>


            <ImageBackground
              source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1737111055/tax_fnv9j7.jpg' }}
              style={styles.TaxCard}
            >
              <Text style={styles.summaryText4}> <Icon name="currency-rupee" size={20} />{totalTaxAmount}</Text>
              <Icon name="arrow-forward" size={40}  style={styles.taxicon} onPress={handlePressTax}/>
            </ImageBackground>
        
            <ImageBackground
              source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1737112480/categories_gi20mq.webp' }}
              style={styles.TaxCard}
            >
              <Text style={styles.summaryText5}>View Expences By</Text>

              <Icon name="arrow-forward" size={40} style={styles.icon} onPress={handlePressExpenceByCat}/>
            </ImageBackground>
       
    
        </View> 

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  dropdownContainer: { marginBottom: 20 },
  dropdown: { borderColor: "#ccc", width: "90%", marginBottom: 10 },
  dropdownList: { zIndex: 1, maxHeight: 800 },
  summary: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: 5 },
  summaryText2: { fontSize:32, fontWeight: "bold", paddingBottom: 10, color: "green" },
  summaryText3: { fontSize: 32, fontWeight: "bold", paddingBottom: 5, color: "red", transform: [{ rotate: "-9deg" }], },
  summaryThirdText2: { fontSize: 32, fontWeight: "bold", paddingTop: 150, },
  summaryText4: { fontSize: 32, fontWeight: "bold", paddingTop: 80,paddingLeft:30,color:"white" },
  summaryText5:{fontSize: 32, fontWeight: "bold", paddingTop: 20,paddingLeft:30},
  IncomeCard: { width: 400, height: 200, padding: 30, marginBottom: 20, display: "flex", justifyContent: "center", alignItems: "center" },
  ExpenceCard: { width: 400, height: 200, paddingLeft: 65, paddingTop: 65, marginBottom: 20, display: "flex" },
  BalanceCard: { width: 400, height: 200, marginBottom: 20 },
  TaxCard:{width: 400, height: 180, marginBottom: 20},
  icon:{marginTop:60,marginLeft:350,color:"black"},
  taxicon:{marginTop:10,marginLeft:350,color:"white"},
  balanceicon:{marginLeft:50,color:"black"},
  expenceicon:{marginTop:30,marginLeft:280,color:"white"},
  incomeicon:{marginLeft:300,color:"black"}
});

export default Dashboard;
