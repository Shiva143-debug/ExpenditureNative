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
import Expence from "./Expence";
import Source from "./Source";
import Product from "./Product";
import Dashboard from './Dashboard';
import ItemReport from './ItemReport';
import ExpensesList from './ExpensesList';
import IncomeList from './IncomeList';
import BalanceList from './BalanceList';
import Add from './Add';
import ProductDetail from './ProductDetail';
import Header from './Header';
import TaxAmountList from './TaxAmountList';
import ExpenseByCategoryList from './ExpenseByCategoryList';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ReportsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ReportsHome" component={Reports} />
      <Stack.Screen name="SourceReports" component={SourceReport} />
      <Stack.Screen name="ExpenceReports" component={ExpenceReport} />
      <Stack.Screen name="CategoryReports" component={CategoryReport} />
      <Stack.Screen name="ProductReports" component={ProductReport} />
      <Stack.Screen name="ProductDetail" component={ProductDetail} />
    </Stack.Navigator>
  );
};

const DashboardStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="dashboardHome" component={Dashboard} />
      <Stack.Screen name="ItemReport" component={ItemReport} />
      <Stack.Screen name="ExpensesList" component={ExpensesList} />
      <Stack.Screen name="IncomeList" component={IncomeList} />
      <Stack.Screen name="BalanceList" component={BalanceList} />
      <Stack.Screen name="TaxAmountList" component={TaxAmountList} />
      <Stack.Screen name="ExpenseByCategoryList" component={ExpenseByCategoryList} />
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

        return <Icon name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="dashboard" component={DashboardStack} />
    <Tab.Screen name="Add" component={Add} />
    {/* <Tab.Screen name="Expence" component={Expence} />
    <Tab.Screen name="Source" component={Source} /> */}
    {/* <Tab.Screen name="Category" component={Product} /> */}
    <Tab.Screen name="Reports" component={ReportsStack} />
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
  <PaperProvider>
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  </PaperProvider>
);

export default App;
