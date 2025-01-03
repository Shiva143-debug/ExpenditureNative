

import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';

const SourceReport = () => {
  const { id } = useAuth();
  const [sourceData, setSourceData] = React.useState([])

  useEffect(() => {
    const userId = id;
    fetch(`https://exciting-spice-armadillo.glitch.me/getSourceData/${userId}`)
      .then(res => res.json())
      .then(data => setSourceData(data))
      .catch(err => console.log(err));
  }, [id]);

  const renderSourceCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Source: {item.source}</Text>
      <View style={{ display: "flex", flexDirection:"row" }}>
        <Text style={{ flex: 1 }}>Amount: {item.amount}</Text>
        <Text style={{ flex: 1, textAlign: "right" }}>Date: {item.date}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={sourceData}
      renderItem={renderSourceCard}
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

export default SourceReport;

