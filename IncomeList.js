
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';

const IncomeList = () => {
  const route = useRoute();
  const { id, Month,Year } = route.params;
  const [totalIncomeData, setTotalIncome] = useState([]);
  const navigation = useNavigation();
  
  useEffect(() => {
    const userId = id;
    if (Month && Year) {
      fetch(`https://exciting-spice-armadillo.glitch.me/getSource/${userId}/${Month}/${Year}`)
        .then(res => res.json())
        .then(data => setTotalIncome(Array.isArray(data) ? data : []))
        .catch(err => console.log(err));
    }
  }, [Month, Year]);


  return (
    <View>
    <FlatList
      data={totalIncomeData}
      keyExtractor={(item) => item.source}
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
                <Text style={styles.cardTitle}>{item.source}</Text>
                <Text style={styles.cardText}>
                  <Icon name="currency-rupee" size={16} /> {item.amount}
                </Text>
              </View>
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
  

export default IncomeList;
