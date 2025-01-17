import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const TaxAmountList = ({ route }) => {
  const { expensesWithTax } = route.params;

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Expenses with Tax</Text> */}
      <FlatList
        data={expensesWithTax}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.category}>{item.category}</Text>
            <Text>Cost: ₹{item.cost}</Text>
            <Text>Tax Amount: ₹{item.tax_amount}</Text>
            {item.description && <Text>Description: {item.description}</Text>}
          </View>
        )}
      />
    </View>
  );
};

export default TaxAmountList;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  item: { marginBottom: 10, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8 },
  category: { fontSize: 18, fontWeight: 'bold' },
});
