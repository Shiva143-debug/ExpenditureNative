import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity ,ImageBackground} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import SelectDropdown from 'react-native-select-dropdown';

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 7 }, (_, index) => (currentYear - 3 + index).toString());

const Dashboard = ({ route }) => {
  const id = 1;
  const [Month, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [Year, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [totalCostData, setExpenseCost] = useState([]);
  const [totalIncomeData, setTotalIncome] = useState([]);
  const navigation = useNavigation();


  useEffect(() => {
    const userId = 1;
    fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${userId}`)
        .then(res => res.json())
        .then(data => setExpenseCost(data))
        .catch(err => console.log(err))

}, [1])

useEffect(() => {
    const userId = 1;
    const Month = 12;
    const Year =2024;
    fetch(`https://exciting-spice-armadillo.glitch.me/getSource/${userId}/${Month}/${Year}`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setTotalIncome(data);
            } else {
                setTotalIncome([])
            }
        })
    })
const filteredTotalCostData = totalCostData.filter((d) => {
    return d.month.toString() === "12" & d.year.toString() === "2024";
});


const groupedData = filteredTotalCostData.reduce((acc, curr) => {
    const { category, cost } = curr;
    acc[category] = (acc[category] || 0) + parseFloat(cost);
    return acc;
}, {});

const groupedArray = Object.keys(groupedData).map((key) => ({
    category: key,
    TotalCost: groupedData[key],
}));

//   useEffect(() => {
//     // Simulate fetching data
//     const fetchData = async () => {
//       const dummyExpenseData = [
//         { category: "Food", cost: 1500 },
//         { category: "Travel", cost: 3000 },
//         { category: "Shopping", cost: 2500 },
//       ];

//       const dummyIncomeData = [
//         { source: "Salary", amount: 10000 },
//         { source: "Freelancing", amount: 5000 },
//       ];

//       const groupedData = dummyExpenseData.map((item) => ({
//         category: item.category,
//         TotalCost: item.cost,
//       }));

//       setExpenseCost(dummyExpenseData);
//       setTotalIncome(dummyIncomeData);
//       setGroupedArray(groupedData);
//     };

//     fetchData();
//   }, []);

  const handleCategoryClick = (category) => {
    navigation.navigate("Reports", { category, Month, Year });
  };

  const totalAmount = groupedArray.reduce((acc, curr) => acc + curr.TotalCost, 0);
  const grandTotal = totalIncomeData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
        <SelectDropdown
          data={months}
          defaultValueByIndex={new Date().getMonth()}
          onSelect={(selectedItem, index) => setSelectedMonth((index + 1).toString())}
          buttonTextAfterSelection={(selectedItem) => selectedItem}
          rowTextForSelection={(item) => item}
          buttonStyle={styles.dropdown}
          buttonTextStyle={styles.dropdownText}
        />
        <SelectDropdown
          data={years}
          defaultValue={Year}
          onSelect={(selectedItem) => setSelectedYear(selectedItem)}
          buttonTextAfterSelection={(selectedItem) => selectedItem}
          rowTextForSelection={(item) => item}
          buttonStyle={styles.dropdown}
          buttonTextStyle={styles.dropdownText}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {months[Month - 1]} Spend: <Icon name="rupee" size={16} /> {totalAmount}
        </Text>
        <Text style={styles.summaryText}>
          Total Earned Income: <Icon name="rupee" size={16} /> {grandTotal}
        </Text>
        <Text style={styles.summaryText}>
          Available Balance: <Icon name="rupee" size={16} /> {grandTotal - totalAmount}
        </Text>
      </View>

      <FlatList data={groupedArray} keyExtractor={(item) => item.category} renderItem={({ item, index }) => (
        <TouchableOpacity  style={styles.card}  onPress={() => handleCategoryClick(item.category)} >
          <ImageBackground source={{ uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1721734044/black-white_iidqap.webp' }}
            style={styles.backgroundImage} imageStyle={{ borderRadius: 10 }}>
            <View style={styles.cardContent}>
              <View>
                <Text style={styles.cardTitle}>{item.category}</Text>
                <Text style={styles.cardText}>
                  <Icon name="rupee" size={16} /> {item.TotalCost}
                </Text>
              </View>
              <Icon name="arrow-right" size={20} color="#333" style={styles.arrowIcon} />
            </View>
          </ImageBackground>
        </TouchableOpacity>
      )}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  dropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor:"red"
    
  },
  dropdown: {
    width: "20%",
    borderRadius: 5,
    backgroundColor: "red",
  },
  dropdownText: {
    textAlign: "center",
    fontWeight: "bold",
  },
  summary: {
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 10,
  },
  card: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color:"white"
  },
  cardText: {
    fontSize: 16,
    marginTop: 5,
    color:"white"
  }, 
   card: {
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    height: 120, // Adjust height as needed
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent', // Semi-transparent background
    borderRadius: 10,
  },

  arrowIcon: {
    alignSelf: 'center',
  },
});

export default Dashboard;
