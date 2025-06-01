import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoaderSpinner from '../LoaderSpinner';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import LinearGradient from 'react-native-linear-gradient';
import {getIncomeSources} from "../services/apiService"

const IncomeList = () => {
  const route = useRoute();
  const { id, Month, Year } = route.params;
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Function to fetch income data
  const getMonthlyIncome = async () => {
    try {
      setLoading(true);
      const data = await getIncomeSources(id,Month,Year);
      if (Array.isArray(data)) {
        setIncomeData(data);
      } else {
        setIncomeData([]);
      }
    } catch (error) {
      console.error('Error fetching income data:', error);
      setIncomeData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load income data when component mounts or when Month/Year changes
  useEffect(() => {
    if (id && Month && Year) {
      getMonthlyIncome();
    }
  }, [Month, Year, id]);

  const totalAmount = incomeData.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const renderHeader = () => (
    <ThemedView style={styles.headerContainer}>
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View>
            <ThemedText style={styles.headerTitle}>Income List</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{monthNames[parseInt(Month) - 1]} {Year}</ThemedText>
          </View>
          <View style={styles.headerAmount}>
            <ThemedText style={styles.totalLabel}>Total Income</ThemedText>
            <ThemedText style={styles.totalAmount}> ₹{totalAmount.toLocaleString()}</ThemedText>
          </View>
        </View>
      </LinearGradient>
    </ThemedView>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <ThemedView style={styles.cardInner}>
        <View style={styles.sourceInfo}>
          <View style={styles.iconContainer}>
            <Icon name="account-balance-wallet" size={24} color="#4CAF50" />
          </View>
          <View style={styles.textContainer}>
            <ThemedText style={styles.sourceText}>{item.source}</ThemedText>
            <ThemedText style={styles.dateText}><Icon name="event" size={14} /> {item.date} </ThemedText>
          </View>
        </View>
        <View style={styles.amountContainer}>
          <ThemedText style={styles.amountText}> ₹{parseFloat(item.amount).toLocaleString()} </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <LoaderSpinner shouldLoad={loading} />
      <View style={styles.headerSection}>
        {renderHeader()}
      </View>
      <FlatList data={incomeData}keyExtractor={(item, index) => item.source + index}
        renderItem={renderItem} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}/>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    // paddingTop: 5,
    zIndex: 1,
    height: 100,
    marginBottom: 5,
  },
  headerContainer: {
    width: '100%',
    height: '100%',
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
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  headerAmount: {
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  totalLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    padding: 15,
    paddingTop: 5,
  },
  card: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
  },
  
  cardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(221, 215, 215, 0.1)',
    marginBottom: 10,
    borderColor: 'whitesmoke',
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  sourceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.6,
  },
  amountContainer: {
    paddingLeft: 15,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default IncomeList;
