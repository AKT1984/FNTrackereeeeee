import React from 'react';
import { useWindowDimensions } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAppTheme } from '../hooks/useAppTheme';

import MainScreen from '../screens/MainScreen';
import TransactionFormScreen from '../screens/TransactionFormScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AccountsScreen from '../screens/AccountsScreen';
import AboutScreen from '../screens/AboutScreen';
import ExportScreen from '../screens/ExportScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import SubscriptionFormScreen from '../screens/SubscriptionFormScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  const isDarkMode = useAppTheme();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: isLargeScreen ? 'permanent' : 'front',
        headerLeft: isLargeScreen ? () => null : undefined,
        headerStyle: {
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        },
        headerTintColor: isDarkMode ? '#f9fafb' : '#111827',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          width: isLargeScreen ? 240 : undefined,
        },
        drawerActiveTintColor: '#3b82f6',
        drawerInactiveTintColor: isDarkMode ? '#d1d5db' : '#4b5563',
      }}
    >
      <Drawer.Screen name="Dashboard" component={MainScreen} options={{ title: 'FinTrack RN' }} />
      <Drawer.Screen name="Subscriptions" component={SubscriptionsScreen} options={{ title: 'Subscriptions' }} />
      <Drawer.Screen name="Accounts" component={AccountsScreen} options={{ title: 'Manage Accounts' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Drawer.Screen name="Export" component={ExportScreen} options={{ title: 'Export Data' }} />
      <Drawer.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const isDarkMode = useAppTheme();

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack.Navigator 
        initialRouteName="Drawer"
        screenOptions={{
          headerStyle: {
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          },
          headerTintColor: isDarkMode ? '#f9fafb' : '#111827',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Drawer" 
          component={DrawerNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddTransaction" 
          component={TransactionFormScreen} 
          options={{ title: 'Add Transaction' }}
        />
        <Stack.Screen 
          name="EditTransaction" 
          component={TransactionFormScreen} 
          options={{ title: 'Edit Transaction' }}
        />
        <Stack.Screen 
          name="SubscriptionForm" 
          component={SubscriptionFormScreen} 
          options={({ route }) => ({ title: route.params?.subscription ? 'Edit Subscription' : 'Add Subscription' })}
        />
        <Stack.Screen 
          name="Reports" 
          component={ReportsScreen} 
          options={{ title: 'Analytics & Reports' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
