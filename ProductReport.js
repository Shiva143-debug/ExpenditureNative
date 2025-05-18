import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';
import LoaderSpinner from './LoaderSpinner';

const ProductReport = () => {
  const { id } = useAuth();
  const [productsData, setProductsData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = id;
    setLoading(true)
    fetch(`https://exciting-spice-armadillo.glitch.me/getCategoriesAndProducts/${userId}`)
      .then(res => res.json())
      .then(data => {
        // Group products by category
        const groupedData = data.reduce((acc, product) => {
          if (!acc[product.category]) {
            acc[product.category] = [];
          }
          acc[product.category].push(product);
          return acc;
        }, {});
        setProductsData(Object.entries(groupedData));
      })
      .catch(err => console.log(err))
      .finally(() => {
        setLoading(false); 
      });
  }, [id]);

  const renderCategoryCard = ({ item }) => {
    const [category, products] = item;

    return (
      <View style={styles.card}>
        <Text style={styles.categoryTitle}>Category: {category}</Text>
        {products.map((product) => (
          <Text key={product.id} style={styles.product}>
            {product.product}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LoaderSpinner shouldLoad={loading} />
      <FlatList
        data={productsData}
        renderItem={renderCategoryCard}
        keyExtractor={(item) => item[0]}
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
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  product: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
});

export default ProductReport;

