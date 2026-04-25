import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { deleteSubscription } from '../store/modules/subscriptions/thunks';
import { Plus, Edit2, Trash2, Calendar, Bell } from 'lucide-react';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatCurrency, getDateFromTimestamp } from '../utils/format';

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', MDL: 'L', RUB: '₽', UAH: '₴',
};

export default function SubscriptionsScreen({ navigation }) {
  const isDarkMode = useAppTheme();
  const dispatch = useDispatch();
  
  const subscriptions = useSelector(state => state.subscriptions.subscriptions || []);
  const isLoading = useSelector(state => state.subscriptions.isLoading);
  const categories = useSelector(state => state.categories.categories || []);
  const accounts = useSelector(state => state.accounts.accounts || []);

  const handleDelete = (id) => {
    dispatch(deleteSubscription(id));
  };

  const renderItem = ({ item }) => {
    const category = categories.find(c => c.id === item.categoryId);
    const account = accounts.find(a => a.id === item.accountId);
    const currencySymbol = CURRENCY_SYMBOLS[item.currency] || item.currency || '$';
    
    const nextBillingDate = item.nextBillingDate ? getDateFromTimestamp(item.nextBillingDate) : null;

    return (
      <View style={[styles.card, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.name, isDarkMode ? styles.textLight : styles.textDark]}>{item.name}</Text>
            {category && (
              <View style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}>
                <Text style={{ color: category.color, fontSize: 12, fontWeight: '600' }}>{category.name}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.amount, styles.textRed]}>
            {formatCurrency(-Number(item.amount), currencySymbol)}
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Calendar size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <Text style={[styles.detailText, isDarkMode ? styles.textGray400 : styles.textGray500]}>
              Next: {nextBillingDate ? nextBillingDate.toLocaleDateString() : 'N/A'} ({item.frequency.toLowerCase()})
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailText, isDarkMode ? styles.textGray400 : styles.textGray500]}>
              Account: {account ? account.name : 'Unknown'}
            </Text>
          </View>

          {item.notifyDaysBefore > 0 && (
            <View style={styles.detailRow}>
              <Bell size={14} color="#3b82f6" />
              <Text style={[styles.detailText, styles.textBlue]}>
                Notify {item.notifyDaysBefore} days before
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('SubscriptionForm', { subscription: item })} 
            style={styles.iconButton}
          >
            <Edit2 color="#3b82f6" size={18} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDelete(item.id)} 
            style={styles.iconButton}
          >
            <Trash2 color="#ef4444" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode ? styles.textLight : styles.textDark]}>Subscriptions</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('SubscriptionForm')}
        >
          <Plus color="#ffffff" size={20} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading && subscriptions.length === 0 ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : subscriptions.length === 0 ? (
        <Text style={[styles.emptyText, isDarkMode ? styles.textGray400 : styles.textGray500]}>
          No recurring transactions found. Add one to automate your subscriptions.
        </Text>
      ) : (
        <FlatList
          data={subscriptions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgLight: { backgroundColor: '#f3f4f6' },
  bgDark: { backgroundColor: '#111827' },
  bgLightCard: { backgroundColor: '#ffffff' },
  bgDarkCard: { backgroundColor: '#1f2937' },
  textLight: { color: '#f9fafb' },
  textDark: { color: '#111827' },
  textGray400: { color: '#9ca3af' },
  textGray500: { color: '#6b7280' },
  textRed: { color: '#ef4444' },
  textBlue: { color: '#3b82f6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 4,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 40,
  },
});
