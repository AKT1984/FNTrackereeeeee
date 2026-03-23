import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, useColorScheme, ActivityIndicator 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction, updateTransaction, deleteTransaction } from '../store/modules/transactions/action-creators';
import CategoryModal from '../components/CategoryModal';

export default function TransactionFormScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const isDarkMode = useColorScheme() === 'dark';
  const isLoading = useSelector(state => state.transactions.isLoading);
  
  const transaction = route.params?.transaction;
  const isEditing = !!transaction;

  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [description, setDescription] = useState(transaction ? transaction.description : '');
  const [type, setType] = useState(transaction ? transaction.type : 'EXPENSE');
  const [category, setCategory] = useState(transaction ? { id: transaction.categoryId, name: 'Selected Category' } : null);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);

  const descInputRef = useRef(null);

  // Form Validation State
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const isAmountValid = amount.trim() !== '' && !isNaN(Number(amount)) && Number(amount) > 0;
    const isCategoryValid = category !== null;
    setIsValid(isAmountValid && isCategoryValid);
  }, [amount, category]);

  const handleSubmit = () => {
    if (!isValid) return;

    const transactionData = {
      amount: Number(amount),
      description: description.trim(),
      type,
      categoryId: category.id,
      date: transaction ? transaction.date : new Date().toISOString(),
    };

    if (isEditing) {
      dispatch(updateTransaction(transaction.id, transactionData));
    } else {
      dispatch(addTransaction(transactionData));
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    if (isEditing) {
      dispatch(deleteTransaction(transaction.id));
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="flex-row mb-5 bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
          <TouchableOpacity 
            className={`flex-1 py-2.5 items-center rounded-md ${type === 'EXPENSE' ? 'bg-red-500' : 'bg-transparent'}`}
            onPress={() => setType('EXPENSE')}
          >
            <Text className={`text-base font-semibold ${type === 'EXPENSE' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-2.5 items-center rounded-md ${type === 'INCOME' ? 'bg-green-500' : 'bg-transparent'}`}
            onPress={() => setType('INCOME')}
          >
            <Text className={`text-base font-semibold ${type === 'INCOME' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>Income</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-5">
          <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount *</Text>
          <TextInput
            className={`border rounded-lg px-4 py-3 text-base ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            placeholder="0.00"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            autoFocus={true}
            returnKeyType="next"
            onSubmitEditing={() => descInputRef.current?.focus()}
          />
        </View>

        <View className="mb-5">
          <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description (Optional)</Text>
          <TextInput
            ref={descInputRef}
            className={`border rounded-lg px-4 py-3 text-base ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            placeholder="What was this for?"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            value={description}
            onChangeText={setDescription}
            returnKeyType="done"
          />
        </View>

        <View className="mb-5">
          <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category *</Text>
          <TouchableOpacity 
            className={`border rounded-lg px-4 py-3.5 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text className={`text-base ${category ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
              {category ? category.name : 'Select a Category'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className={`py-4 rounded-lg items-center mt-2 ${!isValid || isLoading ? 'bg-blue-300 dark:bg-blue-800' : 'bg-blue-500'}`}
          onPress={handleSubmit}
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-base font-bold">{isEditing ? 'Save Changes' : 'Add Transaction'}</Text>
          )}
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity 
            className="py-4 rounded-lg items-center mt-3 border border-red-500 bg-transparent"
            onPress={handleDelete}
            disabled={isLoading}
          >
            <Text className="text-red-500 text-base font-bold">Delete Transaction</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      <CategoryModal 
        visible={isCategoryModalVisible} 
        onClose={() => setCategoryModalVisible(false)} 
        onSelect={setCategory} 
      />
    </KeyboardAvoidingView>
  );
}
