import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, useColorScheme, ActivityIndicator, StyleSheet 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction, updateTransaction, deleteTransaction } from '../store/modules/transactions/action-creators';
import CategoryModal from '../components/CategoryModal';
import AccountModal from '../components/AccountModal';

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  MDL: 'L',
  RUB: '₽',
  UAH: '₴',
};

export default function TransactionFormScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const isDarkMode = useColorScheme() === 'dark';
  const isLoading = useSelector(state => state.transactions.isLoading);
  const user = useSelector(state => state.auth.user);
  const accounts = useSelector(state => state.accounts.accounts || []);
  const currencySymbol = CURRENCY_SYMBOLS[user?.currency || 'USD'] || '$';
  
  const transaction = route.params?.transaction;
  const isEditing = !!transaction;

  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [description, setDescription] = useState(transaction ? transaction.description : '');
  const [type, setType] = useState(transaction ? transaction.type : 'EXPENSE');
  const [category, setCategory] = useState(transaction ? { id: transaction.categoryId, name: 'Selected Category' } : null);
  
  // Find the account object if editing, otherwise default to the first account if available
  const defaultAccount = accounts.length > 0 ? accounts[0] : null;
  const initialAccount = transaction && transaction.accountId 
    ? accounts.find(a => a.id === transaction.accountId) || { id: transaction.accountId, name: 'Selected Account' }
    : defaultAccount;
    
  const [account, setAccount] = useState(initialAccount);
  
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);

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
      accountId: account ? account.id : null,
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
      style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.typeSelector, isDarkMode ? styles.bgDarkCard : styles.bgGray200]}>
          <TouchableOpacity 
            style={[styles.typeButton, type === 'EXPENSE' ? styles.bgRed : styles.bgTransparent]}
            onPress={() => setType('EXPENSE')}
          >
            <Text style={[styles.typeText, type === 'EXPENSE' ? styles.textWhite : (isDarkMode ? styles.textGray400 : styles.textGray500)]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeButton, type === 'INCOME' ? styles.bgGreen : styles.bgTransparent]}
            onPress={() => setType('INCOME')}
          >
            <Text style={[styles.typeText, type === 'INCOME' ? styles.textWhite : (isDarkMode ? styles.textGray400 : styles.textGray500)]}>Income</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Amount ({currencySymbol}) *</Text>
          <TextInput
            style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
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

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Description (Optional)</Text>
          <TextInput
            ref={descInputRef}
            style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
            placeholder="What was this for?"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            value={description}
            onChangeText={setDescription}
            returnKeyType="done"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Account</Text>
          <TouchableOpacity 
            style={[styles.categorySelector, isDarkMode ? styles.inputDark : styles.inputLight]}
            onPress={() => setAccountModalVisible(true)}
          >
            <Text style={[styles.categoryText, account ? (isDarkMode ? styles.textWhite : styles.textGray900) : (isDarkMode ? styles.textGray400 : styles.textGray500)]}>
              {account ? account.name : 'Default Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Category *</Text>
          <TouchableOpacity 
            style={[styles.categorySelector, isDarkMode ? styles.inputDark : styles.inputLight]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={[styles.categoryText, category ? (isDarkMode ? styles.textWhite : styles.textGray900) : (isDarkMode ? styles.textGray400 : styles.textGray500)]}>
              {category ? category.name : 'Select a Category'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, (!isValid || isLoading) ? (isDarkMode ? styles.bgBlue800 : styles.bgBlue300) : styles.bgBlue500]}
          onPress={handleSubmit}
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>{isEditing ? 'Save Changes' : `Add Transaction (${currencySymbol})`}</Text>
          )}
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isLoading}
          >
            <Text style={styles.deleteButtonText}>Delete Transaction</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      <CategoryModal 
        visible={isCategoryModalVisible} 
        onClose={() => setCategoryModalVisible(false)} 
        onSelect={setCategory} 
      />
      
      <AccountModal 
        visible={isAccountModalVisible} 
        onClose={() => setAccountModalVisible(false)} 
        onSelect={setAccount} 
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgLight: { backgroundColor: '#f3f4f6' },
  bgDark: { backgroundColor: '#111827' },
  bgGray200: { backgroundColor: '#e5e7eb' },
  bgDarkCard: { backgroundColor: '#1f2937' },
  bgRed: { backgroundColor: '#ef4444' },
  bgGreen: { backgroundColor: '#22c55e' },
  bgBlue500: { backgroundColor: '#3b82f6' },
  bgBlue300: { backgroundColor: '#93c5fd' },
  bgBlue800: { backgroundColor: '#1e40af' },
  bgTransparent: { backgroundColor: 'transparent' },
  textWhite: { color: '#ffffff' },
  textGray300: { color: '#d1d5db' },
  textGray400: { color: '#9ca3af' },
  textGray500: { color: '#6b7280' },
  textGray700: { color: '#374151' },
  textGray900: { color: '#111827' },
  scrollContent: { padding: 20 },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeText: { fontSize: 16, fontWeight: '600' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputLight: { backgroundColor: '#ffffff', borderColor: '#d1d5db', color: '#111827' },
  inputDark: { backgroundColor: '#1f2937', borderColor: '#374151', color: '#ffffff' },
  categorySelector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  categoryText: { fontSize: 16 },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  deleteButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: 'transparent',
  },
  deleteButtonText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
});
