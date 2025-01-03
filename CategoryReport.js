import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';

const CategoryReport = () => {
  const { id } = useAuth();
  const [categoriesData, setCategoriesData] = React.useState([])

  useEffect(() => {
    const userId = id;
    fetch(`https://exciting-spice-armadillo.glitch.me/getCategories/${userId}`)
      .then(res => res.json())
      .then(data => setCategoriesData(data))
      .catch(err => console.log(err));
  }, [id]);

  const renderCategoryCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Category: {item.category}</Text>
    </View>
  );

  return (
    <FlatList
      data={categoriesData}
      renderItem={renderCategoryCard}
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
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  product: {
    fontSize: 14,
    color: '#333',
  },
});

export default CategoryReport;

