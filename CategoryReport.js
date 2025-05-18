import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';
import LoaderSpinner from './LoaderSpinner';

const CategoryReport = () => {
  const { id } = useAuth();
  const [categoriesData, setCategoriesData] = React.useState([])
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = id;
    setLoading(true);
    fetch(`https://exciting-spice-armadillo.glitch.me/getCategories/${userId}`)
      .then(res => res.json())
      .then(data => setCategoriesData(data))
      .catch(err => console.log(err))
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const renderCategoryCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Category: {item.category}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
    <LoaderSpinner shouldLoad={loading} />
    <FlatList
      data={categoriesData}
      renderItem={renderCategoryCard}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
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
});

export default CategoryReport;

