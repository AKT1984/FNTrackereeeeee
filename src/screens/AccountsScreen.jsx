import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addAccount, updateAccount, deleteAccount } from '../store/modules/accounts/action-creators';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export default function AccountsScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const dispatch = useDispatch();
  const accounts = useSelector(state => state.accounts.accounts || []);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [accountName, setAccountName] = useState('');

  const handleAdd = () => {
    if (!accountName.trim()) return;
    dispatch(addAccount({ name: accountName.trim() }));
    setAccountName('');
    setIsAdding(false);
  };

  const handleUpdate = (id) => {
    if (!accountName.trim()) return;
    dispatch(updateAccount(id, { name: accountName.trim() }));
    setAccountName('');
    setEditingId(null);
  };

  const handleDelete = (id) => {
    // In a real app we'd show a confirmation dialog, but Alert.alert doesn't work well in iframe
    dispatch(deleteAccount(id));
  };

  const startEdit = (account) => {
    setEditingId(account.id);
    setAccountName(account.name);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAccountName('');
    setIsAdding(false);
  };

  const renderItem = ({ item }) => {
    const isEditing = editingId === item.id;

    if (isEditing) {
      return (
        <View style={[styles.accountCard, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
          <TextInput
            style={[styles.input, isDarkMode ? styles.textLight : styles.textDark, isDarkMode ? styles.borderDark : styles.borderLight]}
            value={accountName}
            onChangeText={setAccountName}
            placeholder="Account Name"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            autoFocus
          />
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => handleUpdate(item.id)} style={styles.iconButton}>
              <Check color="#22c55e" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelEdit} style={styles.iconButton}>
              <X color="#ef4444" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.accountCard, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
        <Text style={[styles.accountName, isDarkMode ? styles.textLight : styles.textDark]}>
          {item.name}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => startEdit(item)} style={styles.iconButton}>
            <Edit2 color="#3b82f6" size={18} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
            <Trash2 color="#ef4444" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode ? styles.textLight : styles.textDark]}>Manage Accounts</Text>
        {!isAdding && !editingId && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => { setIsAdding(true); setAccountName(''); }}
          >
            <Plus color="#ffffff" size={20} />
            <Text style={styles.addButtonText}>Add Account</Text>
          </TouchableOpacity>
        )}
      </View>

      {isAdding && (
        <View style={[styles.accountCard, isDarkMode ? styles.bgDarkCard : styles.bgLightCard, styles.addingCard]}>
          <TextInput
            style={[styles.input, isDarkMode ? styles.textLight : styles.textDark, isDarkMode ? styles.borderDark : styles.borderLight]}
            value={accountName}
            onChangeText={setAccountName}
            placeholder="New Account Name"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            autoFocus
          />
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleAdd} style={styles.iconButton}>
              <Check color="#22c55e" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelEdit} style={styles.iconButton}>
              <X color="#ef4444" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {accounts.length === 0 && !isAdding ? (
        <Text style={[styles.emptyText, isDarkMode ? styles.textGray400 : styles.textGray500]}>
          No accounts found. Add one to start tracking multiple balances.
        </Text>
      ) : (
        <FlatList
          data={accounts}
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
  borderLight: { borderBottomColor: '#e5e7eb', borderBottomWidth: 1 },
  borderDark: { borderBottomColor: '#374151', borderBottomWidth: 1 },
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
  accountCard: {
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
    elevation: 2,
  },
  addingCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    paddingHorizontal: 20,
  },
});
