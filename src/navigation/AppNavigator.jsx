import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';

import MainScreen from '../screens/MainScreen';
import TransactionFormScreen from '../screens/TransactionFormScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const scheme = useColorScheme();

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator 
        initialRouteName="Dashboard"
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
          name="Dashboard" 
          component={MainScreen} 
          options={{ title: 'FinTrack RN' }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
