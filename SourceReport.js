

import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';
import LoaderSpinner from './LoaderSpinner';

const SourceReport = () => {
  const { id } = useAuth();
  const [sourceData, setSourceData] = React.useState([])
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return; 
    setLoading(true);
    fetch(`https://exciting-spice-armadillo.glitch.me/getSourceData/${id}`)
      .then(res => res.json())
      .then(data => {
        setSourceData(data);
      })
      .catch(err => {
        console.log(err); 
        setLoading(false);
      })
      .finally(() => {
        setLoading(false); 
      });
  }, [id]); 


  const renderSourceCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Source: {item.source}</Text>
      <View style={{ display: "flex", flexDirection: "row" }}>
        <Text style={{ flex: 1 }}>Amount: {item.amount}</Text>
        <Text style={{ flex: 1, textAlign: "right" }}>Date: {item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
    <LoaderSpinner shouldLoad={loading} />
    <FlatList
      data={sourceData}
      renderItem={renderSourceCard}
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

export default SourceReport;

