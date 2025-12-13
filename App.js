import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './AuthContext';
import Register from './Register';
import Login from './Login';
import CategoryReport from './CategoryReport';
import ExpenceReport from './ExpenceReport';
import ProductReport from './ProductReport';
import SourceReport from './SourceReport';
import Reports from './Reports';

import Dashboard from './DashboardScreens/Dashboard';
import ItemReport from './DashboardScreens/Expences/ItemReport';
import ExpensesList from './DashboardScreens/Expences/ExpensesList';

import IncomeList from './DashboardScreens/IncomeList';
import BalanceList from './DashboardScreens/BalanceList';
import Add from './Forms/Add';
import ProductDetail from './ProductDetail';
import Header from './Header';
import Footer from './Footer';
import TaxAmountList from './DashboardScreens/TaxAmountList';
import ExpenseByCategoryList from "./DashboardScreens/Expences/ExpenseByCategoryList";
import { ThemeProvider } from './context/ThemeContext';
import TransactionReports from './Reports/transactionReports';
import SavingsList from './DashboardScreens/SavingsList';
import CategoriesScreen from './DashboardScreens/CategoriesScreen';
import ProductsScreen from './DashboardScreens/ProductsScreen';
import SourcesScreen from './DashboardScreens/SourcesScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ReportsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ReportsHome" component={Reports} options={{ headerShown: false }} />
      <Stack.Screen name="SourceReports" component={SourceReport} options={{ headerShown: false }} />
      <Stack.Screen name="ExpenceReports" component={ExpenceReport} options={{ headerShown: false }} />
      <Stack.Screen name="CategoryReports" component={CategoryReport} options={{ headerShown: false }} />
      <Stack.Screen name="ProductReports" component={ProductReport} options={{ headerShown: false }}  />
      <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ headerShown: false }}  />
    </Stack.Navigator>
  );
};

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
    <NavigationContainer>
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
    </NavigationContainer>
  );
};

const App = () => (
  <ThemeProvider>
    <PaperProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  </ThemeProvider>
);

export default App;
