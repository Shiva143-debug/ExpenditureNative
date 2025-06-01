import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from './AuthContext';
import LoaderSpinner from './LoaderSpinner';
import { getCategoryReport } from './services/apiService';

const CategoryReport = () => {
  const { id } = useAuth();
  const [categoriesData, setCategoriesData] = React.useState([])
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategoryReport(id);
        setCategoriesData(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchCategories();
    }
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

