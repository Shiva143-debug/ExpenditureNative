
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';

const ExpensesList = () => {
  const route = useRoute();
  const { id, Month,Year } = route.params;
  const [totalCostData, setExpenseCost] = useState([]);
  const navigation = useNavigation();
  
  useEffect(() => {
    if (id) {
      fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${id}`)
        .then((res) => res.json())
        .then((data) => setExpenseCost(data))
        .catch((err) => console.log(err));
    }
  }, [id]);


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


  const handleCategoryClick = (category) => {
    navigation.navigate("ItemReport", { category, Month, Year } );
  };

  return (
    <View>
    <FlatList
      data={groupedArray}
      keyExtractor={(item) => item.category}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card}>
          <ImageBackground
            source={{
              uri: 'https://res.cloudinary.com/dxgbxchqm/image/upload/v1721734044/black-white_iidqap.webp',
            }}
            style={styles.backgroundImage}
            imageStyle={{ borderRadius: 10 }}
          >
            <View style={styles.cardContent}>
              <View style={styles.leftContent}>
                <Text style={styles.cardTitle}>{item.category}</Text>
                <Text style={styles.cardText}>
                  <Icon name="currency-rupee" size={16} /> {item.TotalCost}
                </Text>
              </View>
              <Icon name="east" size={30} color="white" onPress={() => handleCategoryClick(item.category)} />
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
      padding: 10,
    },

    flatList: {
      flex: 1,
    },

    card: {
      marginBottom: 15,
      borderRadius: 10, 
      overflow: 'hidden', 
      height:120
    },
    backgroundImage: {
      width: '100%',
      height: 120,
      justifyContent: 'flex-end',
    },
  
 
    cardContent: {
      flexDirection: 'row', 
      alignItems: 'center',
      padding: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
  

    leftContent: {
      flex: 1,
    },
  
    cardTitle: {
      fontSize: 18,
      color: 'white',
      fontWeight: 'bold',
    },
  
    cardText: {
      fontSize: 16,
      color: 'white',
      marginTop: 5,
    },
  
    icon: {
      marginLeft: 10
    },
  });
  

export default ExpensesList;
