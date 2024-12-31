// import { Provider as PaperProvider } from 'react-native-paper';
// import { createStackNavigator } from '@react-navigation/stack';
// import { NavigationContainer } from '@react-navigation/native';
// import CategoryReport from './CategoryReport';
// import ExpenceReport from "./ExpenceReport"
// import ProductReport from './ProductReport';
// import SourceReport from "./SourceReport"
// import Reports from "./Reports"
// import 'react-native-gesture-handler';

// const Stack = createStackNavigator();


// const App = () => {
//     return (
//         <PaperProvider>
//             <NavigationContainer>
//                 <Stack.Navigator initialRouteName="Reports">
//                 <Stack.Screen name="Reports" component={Reports} />
//                     <Stack.Screen name="SourceReports" component={SourceReport} />
//                     <Stack.Screen name="ExpenceReports" component={ExpenceReport} />
//                     <Stack.Screen name="CategoryReports" component={CategoryReport} />
//                     <Stack.Screen name="ProductReports" component={ProductReport} />
//                 </Stack.Navigator>
//             </NavigationContainer>
//         </PaperProvider>
//     )
// }

// export default App


import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons'; 

import CategoryReport from './CategoryReport';
import ExpenceReport from './ExpenceReport';
import ProductReport from './ProductReport';
import SourceReport from './SourceReport';
import Reports from './Reports';
import Expence from "./Expence"
import Source from "./Source"
import Product from "./Product"
import Dashboard from './Dashboard';
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
    </Stack.Navigator>
  );
};


const App = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Reports') {
                iconName = focused ? 'ios-home' : 'ios-home-outline';
              } else if (route.name === 'Expence') {
                iconName = focused ? 'ios-cash' : 'ios-cash-outline';
              } else if (route.name === 'Source') {
                iconName = focused ? 'ios-wallet' : 'ios-wallet-outline';
              } else if (route.name === 'Category') {
                iconName = focused ? 'ios-folder' : 'ios-folder-outline';
              } else if (route.name === 'Product') {
                iconName = focused ? 'ios-pricetag' : 'ios-pricetag-outline';
              }else if (route.name === 'dashboard') {
                iconName = focused ? 'ios-pricetag' : 'ios-pricetag-outline';
              }
              return <Icon name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="dashboard" component={Dashboard} />
          <Tab.Screen name="Expence" component={Expence} />
          <Tab.Screen name="Source" component={Source} />
          <Tab.Screen name="Category" component={Product} />
          <Tab.Screen name="Reports" component={ReportsStack} />

        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
