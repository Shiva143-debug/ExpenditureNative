// import React from 'react';
// import { Provider as PaperProvider } from 'react-native-paper';
// import { NavigationContainer } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
// import { createStackNavigator } from '@react-navigation/stack';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// import CategoryReport from './CategoryReport';
// import ExpenceReport from './ExpenceReport';
// import ProductReport from './ProductReport';
// import SourceReport from './SourceReport';
// import Reports from './Reports';
// import Expence from "./Expence";
// import Source from "./Source";
// import Product from "./Product";
// import Dashboard from './Dashboard';
// import ItemReport from './ItemReport';

// const Tab = createBottomTabNavigator();
// const Stack = createStackNavigator();


// const ReportsStack = () => {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen name="ReportsHome" component={Reports} />
//       <Stack.Screen name="SourceReports" component={SourceReport} />
//       <Stack.Screen name="ExpenceReports" component={ExpenceReport} />
//       <Stack.Screen name="CategoryReports" component={CategoryReport} />
//       <Stack.Screen name="ProductReports" component={ProductReport} />
//       {/* <Stack.Screen name="ItemReport" component={ItemReport} /> */}
//     </Stack.Navigator>
//   );
// };

// const DashboardStack=()=>{
//   return (
//     <Stack.Navigator>
//       <Stack.Screen name="dashboardHome" component={Dashboard} />
//       <Stack.Screen name="ItemReport" component={ItemReport} />
//     </Stack.Navigator>
//   );
// }

// // Main App component
// const App = () => {
//   return (
//     <PaperProvider>
//       <NavigationContainer>
//         <Tab.Navigator
//           screenOptions={({ route }) => ({
//             tabBarIcon: ({ focused, color, size }) => {
//               let iconName;
//               if (route.name === 'Reports') {
//                 iconName = focused ? 'assignment' : 'assignment';
//               } else if (route.name === 'Expence') {
//                 iconName = focused ? 'attach-money' : 'attach-money'; 
//               } else if (route.name === 'Source') {
//                 iconName = focused ? 'account-balance-wallet' : 'account-balance-wallet'; 
//               } else if (route.name === 'Category') {
//                 iconName = focused ? 'category' : 'category';
//               }  else if (route.name === 'dashboard') {
//                 iconName = focused ? 'dashboard' : 'dashboard';
//               }
//               return <Icon name={iconName} size={size} color={color} />;
//             },
//           })}
//         >
//           <Tab.Screen name="dashboard" component={DashboardStack} />
//           <Tab.Screen name="Expence" component={Expence} />
//           <Tab.Screen name="Source" component={Source} />
//           <Tab.Screen name="Category" component={Product} />
//           <Tab.Screen name="Reports" component={ReportsStack} />
//         </Tab.Navigator>
//       </NavigationContainer>
//     </PaperProvider>
//   );
// };

// export default App;



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
    </Stack.Navigator>
  );
};

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
    <Tab.Screen name="Category" component={Product} />
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
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Login" component={Login} />
          </>
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
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
