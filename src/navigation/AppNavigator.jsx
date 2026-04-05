import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useColorScheme } from 'react-native';

import MainScreen from '../screens/MainScreen';
import TransactionFormScreen from '../screens/TransactionFormScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AccountsScreen from '../screens/AccountsScreen';
import AboutScreen from '../screens/AboutScreen';
import ExportScreen from '../screens/ExportScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  const scheme = useColorScheme();
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: scheme === 'dark' ? '#1f2937' : '#ffffff',
        },
        headerTintColor: scheme === 'dark' ? '#f9fafb' : '#111827',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: scheme === 'dark' ? '#1f2937' : '#ffffff',
        },
        drawerActiveTintColor: '#3b82f6',
        drawerInactiveTintColor: scheme === 'dark' ? '#d1d5db' : '#4b5563',
      }}
    >
      <Drawer.Screen name="Dashboard" component={MainScreen} options={{ title: 'FinTrack RN' }} />
      <Drawer.Screen name="Accounts" component={AccountsScreen} options={{ title: 'Manage Accounts' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Drawer.Screen name="Export" component={ExportScreen} options={{ title: 'Export Data' }} />
      <Drawer.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const scheme = useColorScheme();

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator 
        initialRouteName="Drawer"
        screenOptions={{
          headerStyle: {
            backgroundColor: scheme === 'dark' ? '#1f2937' : '#ffffff',
          },
          headerTintColor: scheme === 'dark' ? '#f9fafb' : '#111827',
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
          name="Reports" 
          component={ReportsScreen} 
          options={{ title: 'Analytics & Reports' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
