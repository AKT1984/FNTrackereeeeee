import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { subscribeToTransactions } from '../store/modules/transactions/thunks';
import { subscribeToCategories } from '../store/modules/categories/thunks';
import { subscribeToAccounts } from '../store/modules/accounts/thunks';
import { selectTotalBudget, selectTotalExpenses, selectTotalBalance, selectTransactions, selectBalancesByAccount } from '../store/modules/transactions/selectors';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatCurrency, getDateFromTimestamp } from '../utils/format';

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  MDL: 'L',
  RUB: '₽',
  UAH: '₴',
};

export default function MainScreen({ navigation }) {
  const dispatch = useDispatch();
  const isDarkMode = useAppTheme();
  
  const user = useSelector(state => state.auth.user);
  const currencySymbol = CURRENCY_SYMBOLS[user?.currency || 'USD'] || '$';

  const transactions = useSelector(selectTransactions);
  const isLoading = useSelector(state => state.transactions.isLoading);
  const error = useSelector(state => state.transactions.error);
  const categories = useSelector(state => state.categories.categories || []);
  const accounts = useSelector(state => state.accounts.accounts || []);
  
  const totalBudget = useSelector(selectTotalBudget);
  const totalExpenses = useSelector(selectTotalExpenses);
  const totalBalance = useSelector(selectTotalBalance);
  const balancesByAccount = useSelector(selectBalancesByAccount);

  // Calculate default balance including any transactions from deleted accounts
  const defaultBalance = Object.keys(balancesByAccount).reduce((sum, accId) => {
    if (accId === 'default' || !accounts.find(a => a.id === accId)) {
      return sum + balancesByAccount[accId];
    }
    return sum;
  }, 0);

  useEffect(() => {
    const unsubscribeTransactions = dispatch(subscribeToTransactions());
    const unsubscribeCategories = dispatch(subscribeToCategories());
    const unsubscribeAccounts = dispatch(subscribeToAccounts());
    
    return () => {
      if (typeof unsubscribeTransactions === 'function') unsubscribeTransactions();
      if (typeof unsubscribeCategories === 'function') unsubscribeCategories();
      if (typeof unsubscribeAccounts === 'function') unsubscribeAccounts();
    };
  }, [dispatch]);

  const renderItem = ({ item }) => {
    const account = accounts.find(a => a.id === item.accountId);
    const accountName = account ? account.name : 'Default Account';
    const itemCurrency = account?.currency || user?.currency || 'USD';
    const itemCurrencySymbol = CURRENCY_SYMBOLS[itemCurrency] || itemCurrency || '$';
    
    return (
      <TouchableOpacity 
        style={[styles.transactionCard, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}
        onPress={() => navigation.navigate('EditTransaction', { transaction: item })}
      >
        <View style={styles.flex1}>
          <Text style={[styles.transactionDesc, isDarkMode ? styles.textLight : styles.textDark]}>
            {item.description || 'No Description'}
          </Text>
          <Text style={styles.transactionDate}>
            {getDateFromTimestamp(item.date).toLocaleDateString()} • {accountName}
          </Text>
          {item.originalCurrency && item.originalCurrency !== itemCurrency && (
            <Text style={styles.originalAmountText}>
              ({formatCurrency(item.originalAmount, CURRENCY_SYMBOLS[item.originalCurrency] || item.originalCurrency)})
            </Text>
          )}
        </View>
        <Text style={[styles.transactionAmount, item.type === 'INCOME' ? styles.textGreen : styles.textRed]}>
          {item.type === 'INCOME' ? '+' : ''}{formatCurrency(item.type === 'EXPENSE' ? -Number(item.amount) : Number(item.amount), itemCurrencySymbol)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerPadding}>
      <View style={[styles.balanceCard, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardLabel, isDarkMode ? styles.textGray400 : styles.textGray500]}>Total Balance</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
            <Text style={styles.reportsLink}>View Reports &gt;</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.balanceAmount, totalBalance >= 0 ? styles.textGreen : styles.textRed]}>
          {formatCurrency(totalBalance, currencySymbol)}
        </Text>
      </View>

      {(accounts.length > 0 || defaultBalance !== 0) && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.accountsScroll}
          contentContainerStyle={styles.accountsScrollContent}
        >
          {[{ id: 'default', name: 'Default Account', currency: user?.currency || 'USD' }, ...accounts].map(account => {
            const balance = account.id === 'default' ? defaultBalance : (balancesByAccount[account.id] || 0);
            // Only show default account if there are no other accounts, or if it has a non-zero balance
            if (account.id === 'default' && accounts.length > 0 && balance === 0) return null;
            
            const accCurrencySymbol = CURRENCY_SYMBOLS[account.currency || user?.currency || 'USD'] || account.currency || '$';
            
            return (
              <View key={account.id} style={[styles.accountPill, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
                <Text style={[styles.accountName, isDarkMode ? styles.textGray400 : styles.textGray500]}>{account.name}</Text>
                <Text style={[styles.accountBalance, balance >= 0 ? styles.textGreen : styles.textRed]}>
                  {formatCurrency(balance, accCurrencySymbol)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.rowBetween}>
        <View style={[styles.halfCard, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
          <Text style={[styles.cardLabel, isDarkMode ? styles.textGray400 : styles.textGray500]}>Budget (Income)</Text>
          <Text style={[styles.halfCardAmount, styles.textGreen]}>
            {formatCurrency(totalBudget, currencySymbol)}
          </Text>
        </View>
        <View style={[styles.halfCard, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
          <Text style={[styles.cardLabel, isDarkMode ? styles.textGray400 : styles.textGray500]}>Expenses</Text>
          <Text style={[styles.halfCardAmount, styles.textRed]}>
            {formatCurrency(totalExpenses, currencySymbol)}
          </Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, isDarkMode ? styles.textLight : styles.textDark]}>Recent Transactions</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <View style={styles.innerContainer}>
        <View style={styles.listContainer}>
          {isLoading && transactions.length === 0 ? (
            <View>
              {renderHeader()}
              <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
            </View>
          ) : error ? (
            <View>
              {renderHeader()}
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : transactions.length === 0 ? (
            <FlatList
              data={[]}
              ListHeaderComponent={renderHeader}
              ListEmptyComponent={<Text style={[styles.emptyText, isDarkMode ? styles.textGray400 : styles.textGray500]}>No transactions found.</Text>}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <FlatList
              data={[...transactions].sort((a, b) => {
                return getDateFromTimestamp(b.date).getTime() - getDateFromTimestamp(a.date).getTime();
              })}
              ListHeaderComponent={renderHeader}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, maxWidth: 800, width: '100%', alignSelf: 'center' },
  bgLight: { backgroundColor: '#f3f4f6' },
  bgDark: { backgroundColor: '#111827' },
  bgLightCard: { backgroundColor: '#ffffff' },
  bgDarkCard: { backgroundColor: '#1f2937' },
  textLight: { color: '#f3f4f6' },
  textDark: { color: '#111827' },
  textGray400: { color: '#9ca3af' },
  textGray500: { color: '#6b7280' },
  textGreen: { color: '#22c55e' },
  textRed: { color: '#ef4444' },
  flex1: { flex: 1 },
  headerPadding: { padding: 20 },
  balanceCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  balanceAmount: { fontSize: 30, fontWeight: 'bold' },
  reportsLink: { fontSize: 14, color: '#3b82f6', fontWeight: '600' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  accountsScroll: {
    marginBottom: 16,
  },
  accountsScrollContent: {
    paddingRight: 20,
  },
  accountPill: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 120,
  },
  accountName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  halfCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  halfCardAmount: { fontSize: 24, fontWeight: 'bold' },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 18, fontWeight: '600' },
  addButton: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  loader: { marginTop: 40 },
  errorText: { color: '#ef4444', textAlign: 'center', marginTop: 20 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  listContent: { paddingBottom: 40 },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionDesc: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  transactionDate: { fontSize: 12, color: '#9ca3af' },
  originalAmountText: { fontSize: 12, color: '#6b7280', marginTop: 2, fontStyle: 'italic' },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
});
