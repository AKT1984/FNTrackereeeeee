import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PieChart } from 'react-native-svg-charts';
import { subscribeToTransactions } from '../store/modules/transactions/action-creators';
import { subscribeToCategories } from '../store/modules/categories/action-creators';
import { selectTotalBudget, selectTotalExpenses, selectTotalBalance, selectTransactions } from '../store/modules/transactions/selectors';

export default function MainScreen({ navigation }) {
  const dispatch = useDispatch();
  const isDarkMode = useColorScheme() === 'dark';
  
  const transactions = useSelector(selectTransactions);
  const isLoading = useSelector(state => state.transactions.isLoading);
  const error = useSelector(state => state.transactions.error);
  const categories = useSelector(state => state.categories.categories || []);
  
  const totalBudget = useSelector(selectTotalBudget);
  const totalExpenses = useSelector(selectTotalExpenses);
  const totalBalance = useSelector(selectTotalBalance);

  useEffect(() => {
    const unsubscribeTransactions = dispatch(subscribeToTransactions());
    const unsubscribeCategories = dispatch(subscribeToCategories());
    
    return () => {
      if (typeof unsubscribeTransactions === 'function') unsubscribeTransactions();
      if (typeof unsubscribeCategories === 'function') unsubscribeCategories();
    };
  }, [dispatch]);

  const expenses = transactions.filter(t => t.type === 'EXPENSE');
  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.categoryId] = (acc[curr.categoryId] || 0) + (Number(curr.amount) || 0);
    return acc;
  }, {});

  const pieData = Object.keys(expensesByCategory)
    .filter(categoryId => expensesByCategory[categoryId] > 0)
    .map((categoryId) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        key: categoryId,
        value: expensesByCategory[categoryId],
        svg: { fill: category ? category.color : '#94a3b8' },
        arc: { outerRadius: '100%', padAngle: 0.05 },
      };
    });

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      className={`flex-row justify-between items-center p-4 rounded-xl mb-3 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      onPress={() => navigation.navigate('EditTransaction', { transaction: item })}
    >
      <View className="flex-1">
        <Text className={`text-base font-medium mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {item.description || 'No Description'}
        </Text>
        <Text className="text-xs text-gray-400">
          {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
        </Text>
      </View>
      <Text className={`text-base font-bold ${item.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
        {item.type === 'INCOME' ? '+' : '-'}${Number(item.amount).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <View className="p-5">
        <View className={`rounded-2xl p-5 mb-4 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Balance</Text>
          <Text className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${totalBalance.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <View className={`w-[48%] rounded-2xl p-5 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Budget (Income)</Text>
            <Text className="text-2xl font-bold text-green-500">
              ${totalBudget.toFixed(2)}
            </Text>
          </View>
          <View className={`w-[48%] rounded-2xl p-5 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expenses</Text>
            <Text className="text-2xl font-bold text-red-500">
              ${totalExpenses.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {pieData.length > 0 && (
        <View className="px-5 mb-4 h-40">
          <PieChart
            style={{ height: 160 }}
            data={pieData}
            innerRadius="50%"
            padAngle={0}
          />
        </View>
      )}

      <View className="flex-1 px-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Recent Transactions</Text>
          <TouchableOpacity 
            className="bg-blue-500 px-3 py-1.5 rounded-md"
            onPress={() => navigation.navigate('AddTransaction')}
          >
            <Text className="text-white font-semibold text-sm">+ Add</Text>
          </TouchableOpacity>
        </View>
        {isLoading && transactions.length === 0 ? (
          <ActivityIndicator size="large" color="#3b82f6" className="mt-10" />
        ) : error ? (
          <Text className="text-red-500 text-center mt-5">{error}</Text>
        ) : transactions.length === 0 ? (
          <Text className={`text-center mt-10 text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No transactions found.</Text>
        ) : (
          <FlatList
            data={[...transactions].sort((a, b) => {
              const dateA = a.date ? new Date(a.date).getTime() : 0;
              const dateB = b.date ? new Date(b.date).getTime() : 0;
              return dateB - dateA;
            })}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}
