import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, StyleSheet 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction, updateTransaction, deleteTransaction } from '../store/modules/transactions/thunks';
import CategoryModal from '../components/CategoryModal';
import AccountModal from '../components/AccountModal';
import { fetchExchangeRate } from '../services/exchangeRateService';
import { useAppTheme } from '../hooks/useAppTheme';

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  MDL: 'L',
  RUB: '₽',
  UAH: '₴',
};

const AVAILABLE_CURRENCIES = Object.keys(CURRENCY_SYMBOLS);

export default function TransactionFormScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const isDarkMode = useAppTheme();
  const isLoading = useSelector(state => state.transactions.isLoading);
  const user = useSelector(state => state.auth.user);
  const accounts = useSelector(state => state.accounts.accounts || []);
  
  const transaction = route.params?.transaction;
  const isEditing = !!transaction;

  const defaultAccount = accounts.length > 0 ? accounts[0] : null;
  const initialAccount = transaction && transaction.accountId 
    ? accounts.find(a => a.id === transaction.accountId) || { id: transaction.accountId, name: 'Selected Account' }
    : defaultAccount;
    
  const [account, setAccount] = useState(initialAccount);

  const baseCurrency = account?.currency || user?.currency || 'USD';

  const [amount, setAmount] = useState(transaction?.originalAmount ? String(transaction.originalAmount) : (transaction ? String(transaction.amount) : ''));
  const [currency, setCurrency] = useState(transaction?.originalCurrency || baseCurrency);
  const [description, setDescription] = useState(transaction ? transaction.description : '');
  const [type, setType] = useState(transaction ? transaction.type : 'EXPENSE');
  const [category, setCategory] = useState(transaction ? { id: transaction.categoryId, name: 'Selected Category' } : null);
  
  // Update currency when account changes if not editing
  useEffect(() => {
    if (!isEditing && account) {
      setCurrency(account.currency || user?.currency || 'USD');
    }
  }, [account, isEditing, user?.currency]);
  
  // Exchange rate state
  const [exchangeRate, setExchangeRate] = useState(transaction?.exchangeRate || 1);
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [rateError, setRateError] = useState(null);
  
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);

  const descInputRef = useRef(null);

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const isAmountValid = amount.trim() !== '' && !isNaN(Number(amount)) && Number(amount) > 0;
    const isCategoryValid = category !== null;
    setIsValid(isAmountValid && isCategoryValid && !isFetchingRate);
  }, [amount, category, isFetchingRate]);

  useEffect(() => {
    const getRate = async () => {
      if (currency === baseCurrency) {
        setExchangeRate(1);
        setRateError(null);
        return;
      }
      
      setIsFetchingRate(true);
      setRateError(null);
      try {
        const rate = await fetchExchangeRate(currency, baseCurrency);
        setExchangeRate(rate);
      } catch (error) {
        setRateError('Failed to fetch exchange rate. Using 1:1.');
        setExchangeRate(1);
      } finally {
        setIsFetchingRate(false);
      }
    };

    getRate();
  }, [currency, baseCurrency]);

  const handleSubmit = () => {
    if (!isValid) return;

    const numericAmount = Number(amount);
    const convertedAmount = currency === baseCurrency ? numericAmount : numericAmount * exchangeRate;

    const transactionData = {
      amount: convertedAmount,
      description: description.trim(),
      type,
      categoryId: category.id,
      accountId: account ? account.id : null,
      originalAmount: numericAmount,
      originalCurrency: currency,
      exchangeRate: exchangeRate,
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

  const cycleCurrency = () => {
    const currentIndex = AVAILABLE_CURRENCIES.indexOf(currency);
    const nextIndex = (currentIndex + 1) % AVAILABLE_CURRENCIES.length;
    setCurrency(AVAILABLE_CURRENCIES[nextIndex]);
  };

  const convertedDisplay = currency !== baseCurrency && amount && !isNaN(Number(amount))
    ? `≈ ${CURRENCY_SYMBOLS[baseCurrency] || baseCurrency}${(Number(amount) * exchangeRate).toFixed(2)}`
    : null;

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
          <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Amount *</Text>
          <View style={styles.amountContainer}>
            <TouchableOpacity 
              style={[styles.currencySelector, isDarkMode ? styles.bgDarkCard : styles.bgGray200]}
              onPress={cycleCurrency}
            >
              <Text style={[styles.currencyText, isDarkMode ? styles.textWhite : styles.textGray900]}>
                {currency} {CURRENCY_SYMBOLS[currency] || ''}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.amountInput, isDarkMode ? styles.inputDark : styles.inputLight]}
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
          {isFetchingRate && (
            <Text style={[styles.helperText, styles.textBlue]}>Fetching live exchange rate...</Text>
          )}
          {rateError && (
            <Text style={[styles.helperText, styles.textRed]}>{rateError}</Text>
          )}
          {convertedDisplay && !isFetchingRate && !rateError && (
            <Text style={[styles.helperText, isDarkMode ? styles.textGray400 : styles.textGray500]}>
              {convertedDisplay} (Rate: {exchangeRate.toFixed(4)})
            </Text>
          )}
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
          style={[styles.submitButton, (!isValid || isLoading || isFetchingRate) ? (isDarkMode ? styles.bgBlue800 : styles.bgBlue300) : styles.bgBlue500]}
          onPress={handleSubmit}
          disabled={!isValid || isLoading || isFetchingRate}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>{isEditing ? 'Save Changes' : `Add Transaction`}</Text>
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySelector: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeftWidth: 0,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  textBlue: { color: '#3b82f6' },
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
