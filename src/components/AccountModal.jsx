import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

export default function AccountModal({ visible, onClose, onSelect }) {
  const isDarkMode = useColorScheme() === 'dark';
  const accounts = useSelector(state => state.accounts.accounts || []);

  const handleSelect = (account) => {
    onSelect(account);
    onClose();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.accountItem, isDarkMode ? styles.borderDark : styles.borderLight]}
      onPress={() => handleSelect(item)}
    >
      <Text style={[styles.accountName, isDarkMode ? styles.textLight : styles.textDark]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isDarkMode ? styles.bgDark : styles.bgLight]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode ? styles.textLight : styles.textDark]}>Select Account</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color={isDarkMode ? '#9ca3af' : '#6b7280'} size={24} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={[{ id: null, name: 'Default Account' }, ...accounts]}
            keyExtractor={item => item.id || 'default'}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
  },
  bgLight: { backgroundColor: '#ffffff' },
  bgDark: { backgroundColor: '#1f2937' },
  textLight: { color: '#f9fafb' },
  textDark: { color: '#111827' },
  textGray400: { color: '#9ca3af' },
  textGray500: { color: '#6b7280' },
  borderLight: { borderBottomColor: '#f3f4f6', borderBottomWidth: 1 },
  borderDark: { borderBottomColor: '#374151', borderBottomWidth: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    padding: 20,
  },
  accountItem: {
    paddingVertical: 16,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    paddingHorizontal: 20,
  },
});
