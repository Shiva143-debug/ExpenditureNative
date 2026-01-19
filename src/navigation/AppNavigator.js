import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

import Header from '../components/Header';
import Footer from '../components/Footer';

import Register from '../screens/auth/Register';
import Login from '../screens/auth/Login';
import Dashboard from '../screens/dashboard/Dashboard';
import Add from '../screens/forms/Add';
import TransactionReports from '../screens/reports/TransactionReports';

import ItemReport from '../screens/dashboard/Expenses/ItemReport';
import ExpensesList from '../screens/dashboard/Expenses/ExpensesList';
import IncomeList from '../screens/dashboard/IncomeList';
import BalanceList from '../screens/dashboard/BalanceList';
import SavingsList from '../screens/dashboard/SavingsList';
import TaxAmountList from '../screens/dashboard/TaxAmountList';
import ExpenseByCategoryList from "../screens/dashboard/Expenses/ExpenseByCategoryList";

import CategoriesScreen from '../screens/dashboard/CategoriesScreen';
import ProductsScreen from '../screens/dashboard/ProductsScreen';
import SourcesScreen from '../screens/dashboard/SourcesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DashboardStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="dashboardHome" component={Dashboard} options={{ headerShown: false }}/>
      <Stack.Screen name="ItemReport" component={ItemReport} options={{ headerShown: false }}/>
      <Stack.Screen name="ExpensesList" component={ExpensesList} options={{ headerShown: false }}/>
      <Stack.Screen name="IncomeList" component={IncomeList} options={{ headerShown: false }}/>
      <Stack.Screen name="BalanceList" component={BalanceList} options={{ headerShown: false }}/>
      <Stack.Screen name="SavingsList" component={SavingsList} options={{ headerShown: false }}/>
      <Stack.Screen name="TaxAmountList" component={TaxAmountList} options={{ headerShown: false }}/>
      <Stack.Screen name="ExpenseByCategoryList" component={ExpenseByCategoryList} options={{ headerShown: false }}/>
      <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="ProductsScreen" component={ProductsScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="SourcesScreen" component={SourcesScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};

const MainTabs = () => (
  <Tab.Navigator tabBar={props => <Footer {...props} />}
    screenOptions={{ headerShown: false,}}>
    <Tab.Screen name="dashboard" component={DashboardStack} options={{ title: "Dashboard" }} />
    <Tab.Screen name="Add" component={Add} options={{ title: "Add" }} />
    <Tab.Screen name="transactionReports" component={TransactionReports} options={{ title: "Reports" }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        </>
      ) : (
        <Stack.Screen  name="MainTabs"  component={MainTabs}
          options={{
            header: ({ navigation }) => <Header navigation={navigation} />,
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
