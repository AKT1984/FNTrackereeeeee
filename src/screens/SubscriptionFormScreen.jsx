import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, StyleSheet 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addSubscription, updateSubscription, deleteSubscription } from '../store/modules/subscriptions/thunks';
import CategoryModal from '../components/CategoryModal';
import AccountModal from '../components/AccountModal';
import { useAppTheme } from '../hooks/useAppTheme';

const FREQUENCIES = ['MONTHLY', 'WEEKLY', 'YEARLY'];

export default function SubscriptionFormScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const isDarkMode = useAppTheme();
  const isLoading = useSelector(state => state.subscriptions.isLoading);
  const user = useSelector(state => state.auth.user);
  const accounts = useSelector(state => state.accounts.accounts || []);
  
  const subscription = route.params?.subscription;
  const isEditing = !!subscription;

  const defaultAccount = accounts.length > 0 ? accounts[0] : null;
  const initialAccount = subscription && subscription.accountId 
    ? accounts.find(a => a.id === subscription.accountId) || { id: subscription.accountId, name: 'Selected Account' }
    : defaultAccount;
    
  const [account, setAccount] = useState(initialAccount);
  const baseCurrency = account?.currency || user?.currency || 'USD';

  const [name, setName] = useState(subscription ? subscription.name : '');
  const [amount, setAmount] = useState(subscription ? String(subscription.amount) : '');
  const [frequency, setFrequency] = useState(subscription ? subscription.frequency : 'MONTHLY');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(subscription ? String(subscription.notifyDaysBefore) : '3');
  const [category, setCategory] = useState(subscription ? { id: subscription.categoryId, name: 'Selected Category' } : null);
  
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const isNameValid = name.trim() !== '';
    const isAmountValid = amount.trim() !== '' && !isNaN(Number(amount)) && Number(amount) > 0;
    const isCategoryValid = category !== null;
    const isAccountValid = account !== null;
    setIsValid(isNameValid && isAmountValid && isCategoryValid && isAccountValid);
  }, [name, amount, category, account]);

  const handleSubmit = () => {
    if (!isValid) return;

    const numericAmount = Number(amount);
    const notifyDays = notifyDaysBefore.trim() === '' ? 0 : Number(notifyDaysBefore);
    
    // Calculate next billing date (simplified for now: just set it to today + 1 month if new)
    let nextBillingDate = new Date();
    if (!isEditing) {
      if (frequency === 'MONTHLY') nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      else if (frequency === 'WEEKLY') nextBillingDate.setDate(nextBillingDate.getDate() + 7);
      else if (frequency === 'YEARLY') nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      nextBillingDate = subscription.nextBillingDate.toDate ? subscription.nextBillingDate.toDate() : new Date(subscription.nextBillingDate);
    }

    const subscriptionData = {
      name: name.trim(),
      amount: numericAmount,
      currency: baseCurrency,
      categoryId: category.id,
      accountId: account.id,
      frequency,
      notifyDaysBefore: notifyDays,
      startDate: isEditing ? subscription.startDate : new Date(),
      nextBillingDate: nextBillingDate,
    };

    if (isEditing) {
      dispatch(updateSubscription(subscription.id, subscriptionData));
    } else {
      dispatch(addSubscription(subscriptionData));
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    if (isEditing) {
      dispatch(deleteSubscription(subscription.id));
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Subscription Name *</Text>
          <TextInput
            style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
            placeholder="e.g., Netflix, Gym"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            value={name}
            onChangeText={setName}
            autoFocus={true}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Amount ({baseCurrency}) *</Text>
          <TextInput
            style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
            placeholder="0.00"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Frequency</Text>
          <View style={styles.frequencySelector}>
            {FREQUENCIES.map(freq => (
              <TouchableOpacity 
                key={freq}
                style={[
                  styles.freqButton, 
                  frequency === freq ? styles.bgBlue500 : (isDarkMode ? styles.bgDarkCard : styles.bgGray200)
                ]}
                onPress={() => setFrequency(freq)}
              >
                <Text style={[
                  styles.freqText, 
                  frequency === freq ? styles.textWhite : (isDarkMode ? styles.textGray400 : styles.textGray700)
                ]}>
                  {freq.charAt(0) + freq.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Notify Days Before (0 to disable)</Text>
          <TextInput
            style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
            placeholder="3"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            keyboardType="numeric"
            value={notifyDaysBefore}
            onChangeText={setNotifyDaysBefore}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Account *</Text>
          <TouchableOpacity 
            style={[styles.selector, isDarkMode ? styles.inputDark : styles.inputLight]}
            onPress={() => setAccountModalVisible(true)}
          >
            <Text style={[styles.selectorText, account ? (isDarkMode ? styles.textWhite : styles.textGray900) : (isDarkMode ? styles.textGray400 : styles.textGray500)]}>
              {account ? account.name : 'Select Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Category *</Text>
          <TouchableOpacity 
            style={[styles.selector, isDarkMode ? styles.inputDark : styles.inputLight]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={[styles.selectorText, category ? (isDarkMode ? styles.textWhite : styles.textGray900) : (isDarkMode ? styles.textGray400 : styles.textGray500)]}>
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
            <Text style={styles.submitButtonText}>{isEditing ? 'Save Changes' : `Add Subscription`}</Text>
          )}
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isLoading}
          >
            <Text style={styles.deleteButtonText}>Delete Subscription</Text>
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
  bgBlue500: { backgroundColor: '#3b82f6' },
  bgBlue300: { backgroundColor: '#93c5fd' },
  bgBlue800: { backgroundColor: '#1e40af' },
  textWhite: { color: '#ffffff' },
  textGray300: { color: '#d1d5db' },
  textGray400: { color: '#9ca3af' },
  textGray500: { color: '#6b7280' },
  textGray700: { color: '#374151' },
  textGray900: { color: '#111827' },
  scrollContent: { padding: 20 },
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
  frequencySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  freqButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  freqText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorText: { fontSize: 16 },
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
