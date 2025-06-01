import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from '../AuthContext';
import LoaderSpinner from "../LoaderSpinner";
import LinearGradient from 'react-native-linear-gradient';
import ThemedView from "../components/ThemedView";
import ThemedText from "../components/ThemedText";
import { getExpenseCosts, getIncomeSources } from "../services/apiService"

const Dashboard = () => {
  const { id } = useAuth();
  const [openMonth, setOpenMonth] = useState(false);
  const [Month, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [loading, setLoading] = useState(false);
  const [months, setMonths] = useState([
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ]);

  const [openYear, setOpenYear] = useState(false);
  const [Year, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [years, setYears] = useState([
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' },
    { label: '2026', value: '2026' },
  ]);

  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [taxAmount, setTaxAmount] = useState(0);
  const navigation = useNavigation();

  // Function to fetch expense data
  const getExpenses = async () => {
    try {
      const data = await getExpenseCosts(id);
      return data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  };

  // Function to fetch income data
  const getIncome = async () => {
    try {
      const data = await getIncomeSources(id, Month, Year);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching income:', error);
      return [];
    }
  };

  // Function to calculate tax amount
  const calculateTaxAmount = (expenses) => {
    return expenses.reduce((acc, curr) => {
      const taxAmount = parseFloat(curr.tax_amount) || 0;
      return acc + taxAmount;
    }, 0);
  };

  // Replace the existing useEffect with useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      const loadDashboardData = async () => {
        setLoading(true);
        try {
          // Fetch all data in parallel
          const [expenseResult, incomeResult] = await Promise.all([
            getExpenses(),
            getIncome()
          ]);

          // Store all expense data
          setExpenseData(expenseResult);

          // Filter expenses for current month and year
          const filteredExpenses = expenseResult.filter(
            (expense) => expense.month.toString() === Month &&
              expense.year.toString() === Year
          );

          // Update states
          setIncomeData(incomeResult);
          setTaxAmount(calculateTaxAmount(filteredExpenses));

        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadDashboardData();
    }, [id, Month, Year])
  );

  // Calculate totals from the filtered data
  const totalExpenses = expenseData
    .filter(expense => expense.month.toString() === Month && expense.year.toString() === Year)
    .reduce((acc, curr) => acc + parseFloat(curr.cost), 0);
  const totalIncome = incomeData.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);



  const handleMonthSelect = (value) => {
    setSelectedMonth(value);
    if (Year) {
      setShowDropdowns(false);
    }
  };

  const handleYearSelect = (value) => {
    setSelectedYear(value);
    if (Month) {
      setShowDropdowns(false);
    }
  };

  const handlePressExpence = () => {
    navigation.navigate('ExpensesList', { id, Month, Year });
  };

  const handlePressIncome = () => {
    navigation.navigate('IncomeList', { id, Month, Year });
  };

  const handlePressBalance = () => {
    navigation.navigate('BalanceList');
  };

  const handlePressSavings = () => {
    navigation.navigate('SavingsList');
  };

  const handlePressTax = () => {
    const expensesWithTax = expenseData.filter((item) => parseFloat(item.tax_amount) > 0);
    if (expensesWithTax.length > 0) {
      navigation.navigate('TaxAmountList', { expensesWithTax });
    }
  };

  const handlePressExpenceByCat = () => {
    navigation.navigate('ExpenseByCategoryList');
  };

  return (
    <ThemedView style={styles.mainContainer}>
      <ScrollView style={styles.scrollView}>
        <LoaderSpinner shouldLoad={loading} />

        {/* Header Section */}
        <ThemedView style={styles.headerSection}>
          <Text style={styles.greeting}>Financial Dashboard</Text>

          {!showDropdowns ? (
            <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDropdowns(true)}>
              <Icon name="event" size={24} color="#FFF" />
              <Text style={styles.dateText}>
                {months.find((m) => m.value === Month)?.label} {Year}
              </Text>
            </TouchableOpacity>
          ) : (
            <ThemedView style={styles.dropdownsContainer}>
              <View style={styles.dropdownBox}>
                <DropDownPicker open={openMonth} value={Month} items={months} setValue={handleMonthSelect} setItems={setMonths}
                  placeholder="Month" style={styles.picker} dropDownContainerStyle={styles.dropdownList}
                  listMode="SCROLLVIEW" setOpen={(isOpen) => {
                    setOpenMonth(isOpen);
                    if (isOpen) setOpenYear(false);
                  }}
                />
              </View>

              <View style={styles.dropdownBox}>
                <DropDownPicker open={openYear} value={Year} items={years} setValue={handleYearSelect} setItems={setYears} placeholder="Year" style={styles.picker} dropDownContainerStyle={styles.dropdownList}
                  listMode="SCROLLVIEW" setOpen={(isOpen) => {
                    setOpenYear(isOpen);
                    if (isOpen) setOpenMonth(false);
                  }}
                />
              </View>
            </ThemedView>
          )}
        </ThemedView>

        {/* Main Stats Section */}
        <ThemedView style={styles.statsContainer}>
          <TouchableOpacity style={styles.mainCard} onPress={handlePressIncome}>
            <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.gradientCard}>
              <View style={styles.cardContent}>
                <View>
                  <Text style={styles.cardLabel}>Total Income</Text>
                  <Text style={styles.cardValue}>₹{totalIncome.toLocaleString()}</Text>
                </View>
                <Icon name="trending-up" size={30} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mainCard} onPress={handlePressExpence}>
            <LinearGradient colors={['#FF5252', '#D32F2F']} style={styles.gradientCard}>
              <View style={styles.cardContent}>
                <View>
                  <Text style={styles.cardLabel}>Total Expenses</Text>
                  <Text style={styles.cardValue}>₹{totalExpenses.toLocaleString()} </Text>
                </View>
                <Icon name="trending-down" size={30} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ThemedView>

        {/* Secondary Stats */}
        <ThemedView style={styles.secondaryStats}>
          <ThemedView style={styles.secondaryCard}>
            <TouchableOpacity
              style={[
                styles.secondaryCardContent,
                { opacity: taxAmount > 0 ? 1 : 0.6 }
              ]}
              onPress={taxAmount > 0 ? handlePressTax : null}
            >
              <Icon name="receipt" size={24} color="#1976D2" />
              <View>
                <ThemedText style={styles.secondaryLabel}>Tax Amount</ThemedText>
                <ThemedText style={styles.secondaryValue}>₹{taxAmount.toLocaleString()}</ThemedText>

              </View>
              {taxAmount > 0 && (
                <Icon name="arrow-forward-ios" size={20} color="#1976D2" />
              )}
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.secondaryCard} >
            <TouchableOpacity style={styles.secondaryCardContent}>
              <Icon name="account-balance-wallet" size={24} color="#1976D2" />
              <View>
                <ThemedText style={styles.secondaryLabel}>Balance</ThemedText>
                <ThemedText style={[styles.secondaryValue,
                { color: (totalIncome - totalExpenses) < 0 ? '#D32F2F' : '#2E7D32' }]}>
                  ₹{Math.abs(totalIncome - totalExpenses).toLocaleString()}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={handlePressExpenceByCat}>
            <LinearGradient colors={['#7B1FA2', '#4A148C']} style={styles.gradientAction}>
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <Icon name="pie-chart" size={30} color="#FFF" />
                  <Text style={styles.actionText}>Expenses By Categories</Text>
                </View>
                <Icon name="arrow-forward-ios" size={20} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handlePressBalance}>
            <LinearGradient colors={['#1976D2', '#0D47A1']} style={styles.gradientAction}>
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <Icon name="assessment" size={30} color="#FFF" />
                  <Text style={styles.actionText}>View Balance Details</Text>
                </View>
                <Icon name="arrow-forward-ios" size={20} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handlePressSavings}>
            <LinearGradient colors={['lightgreen', 'green']} style={styles.gradientAction}>
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <Icon name="payments" size={30} color="#FFF" />
                  <Text style={styles.actionText}>Total Savings</Text>
                </View>
                <Icon name="arrow-forward-ios" size={20} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#1976D2',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
  },
  dateText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dropdownBox: {
    flex: 1,
    zIndex: 1000,
  },
  picker: {
    borderWidth: 0,
    borderRadius: 8,
  },
  dropdownList: {
    borderWidth: 0,
    borderRadius: 8,
    maxHeight: 800
  },
  statsContainer: {
    padding: 15,
  },
  mainCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientCard: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 5,
  },
  cardValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  secondaryStats: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  secondaryCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'whitesmoke',
    // backgroundColor: "red",
  },
  secondaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secondaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  secondaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActions: {
    padding: 15,
    gap: 15,
  },
  actionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  gradientAction: {
    padding: 20,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  actionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Dashboard;
