import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ThemedText from '../../components/ThemedText';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedView from '../../components/ThemedView';

const TaxAmountList = ({ route }) => {
  const { expensesWithTax } = route.params;

  // Calculate total tax amount
  const totalTaxAmount = expensesWithTax.reduce((sum, item) => sum + parseFloat(item.tax_amount), 0);

  const renderHeader = () => (
    <ThemedView style={styles.headerContainer}>
      <LinearGradient colors={['#1976D2', '#0D47A1']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View>
            <ThemedText style={styles.headerTitle}>Tax Details</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Total Tax Amount</ThemedText>
          </View>
          <ThemedText style={styles.totalAmount}>₹{totalTaxAmount.toLocaleString()}</ThemedText>
        </View>
      </LinearGradient>
    </ThemedView>
  );

  const renderItem = ({ item }) => (
    <ThemedView style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.categoryContainer}>
          <Icon name="category" size={24} color="#1976D2" />
          <ThemedText style={styles.category}>{item.category}</ThemedText>
        </View>
        <ThemedText style={styles.date}>{item.p_date}</ThemedText>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <ThemedText style={styles.label}>Cost:</ThemedText>
          <ThemedText style={styles.value}>₹{parseFloat(item.cost).toLocaleString()}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText style={styles.label}>Tax Amount:</ThemedText>
          <ThemedText style={styles.taxAmount}>₹{parseFloat(item.tax_amount).toLocaleString()}</ThemedText>
        </View>
        {item.description && (
          <View style={styles.descriptionContainer}>
            <ThemedText style={styles.label}>Description:</ThemedText>
            <ThemedText style={styles.description}>{item.description}</ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerSection}>
        {renderHeader()}
      </View>
      <FlatList data={expensesWithTax} keyExtractor={(item) => item.id.toString()} renderItem={renderItem}
        contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}/>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    zIndex: 1,
    height: 100,
    marginBottom: 5,
    width: '100%',
  },
  headerContainer: {
    width: '101%',
    height: '100%',
    marginBottom: 10,
  },
  headerGradient: {
    borderRadius: 15,
    margin: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    height: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    paddingRight: 100,

    
  },
  listContainer: {
    padding: 15,
    paddingTop: 5,
  },
  itemCard: {
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(221, 215, 215, 0.1)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  taxAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1976D2',
  },
  descriptionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(221, 215, 215, 0.1)',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
});

export default TaxAmountList;
