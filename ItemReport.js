
import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Icon, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from './AuthContext';

const ItemReport = () => {
  const { id } = useAuth();
  const route = useRoute();
  const { category, Month, Year } = route.params;
  const [items, setExpenceData] = React.useState([]);

  useEffect(() => {
    const userId = id;
    fetch(`https://exciting-spice-armadillo.glitch.me/getExpenseCost/${userId}`)
      .then(res => res.json())
      .then(data => setExpenceData(data))
      .catch(err => console.log(err));
  }, []);


  const filteredItems = items.filter(item => {
    const itemMonth = new Date(item.p_date).getMonth() + 1;
    const itemYear = new Date(item.p_date).getFullYear();

    return (
      (category ? item.category === category : true) &&
      (Month ? itemMonth == Month : true) &&
      (Year ? itemYear == Year : true)
    );
  });


  const renderItemCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Expence: {item.product}</Text>
      <View style={{ display: "flex", flexDirection: "row" }}>
        <Text style={{ flex: 1 }}>Category: {item.category}</Text>
        <Text style={{ flex: 1, textAlign: "right" }}>Tax Applicable: {item.is_tax_app}</Text>
      </View>
      <View style={{ display: "flex", flexDirection: "row" }}>
        <Text style={{ flex: 1 }}>Cost: {item.cost}</Text>
        <Text style={{ flex: 1, textAlign: "right" }}>Date: {item.p_date}</Text>
      </View>

      {item.description && <Text>Description: {item.description}</Text>}
      {item.image && (<Image source={{ uri: item.image }} style={styles.image} />)}

    </View>
  );

  return (
    <FlatList
      data={filteredItems}
      renderItem={renderItemCard}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxHeight:800

  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  }, 
     image: {
    width: '100%',
    height: '90%',
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 8,
},

});

export default ItemReport;

