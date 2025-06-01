import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
import TaxAmountList from './DashboardScreens/TaxAmountList';
import ExpenseByCategoryList from "./DashboardScreens/Expences/ExpenseByCategoryList";
import { ThemeProvider } from './context/ThemeContext';
import TransactionReports from './Reports/transactionReports';
import SavingsList from './DashboardScreens/SavingsList';


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
    </Stack.Navigator>
  );
};

// const DashboardStack = () => {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen name="dashboardHome" component={ProtectedRoute} initialParams={{ component: Dashboard }} />
//       <Stack.Screen name="ItemReport" component={ProtectedRoute} initialParams={{ component: ItemReport }} />
//       <Stack.Screen name="ExpensesList" component={ProtectedRoute} initialParams={{ component: ExpensesList }} />
//       <Stack.Screen name="IncomeList" component={ProtectedRoute} initialParams={{ component: IncomeList }} />
//       <Stack.Screen name="BalanceList" component={ProtectedRoute} initialParams={{ component: BalanceList }} />
//     </Stack.Navigator>
//   );
// };

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Reports') iconName = 'assignment';
        // else if (route.name === 'Expence') iconName = 'attach-money';
        // else if (route.name === 'Source') iconName = 'account-balance-wallet';
        else if (route.name === 'Category') iconName = 'category';
        else if (route.name === 'dashboard') iconName = 'dashboard';
        else if (route.name === 'Add') iconName = 'add-circle';
        else if (route.name === 'transactionReports') iconName = 'assignment';

        return <Icon name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="dashboard" component={DashboardStack}  options={{ headerShown: false,title:"Dashboard"  }} />
    <Tab.Screen name="Add" component={Add} options={{ headerShown: false,title:"ADD" }} />
    {/* <Tab.Screen name="Expence" component={Expence} />
    <Tab.Screen name="Source" component={Source} /> */}
    {/* <Tab.Screen name="Category" component={Product} /> */}
    {/* <Tab.Screen name="Reports" component={ReportsStack} options={{ headerShown: false }} /> */}
      {/* <Tab.Screen name="Reports" component={ReportsStack} options={{ headerShown: false }} /> */}
      <Tab.Screen name="transactionReports" component={TransactionReports} options={{ headerShown: false,title:"Reports" }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs}
          //  options={{ headerShown: false }} 
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
