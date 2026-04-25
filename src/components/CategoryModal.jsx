import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addCategory } from '../store/modules/categories/thunks';
import { useAppTheme } from '../hooks/useAppTheme';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
const ICONS = ['💰', '🛒', '🍔', '🚗', '🏠', '🎮', '🏥', '✈️'];

export default function CategoryModal({ visible, onClose, onSelect }) {
  const dispatch = useDispatch();
  const categories = useSelector(state => state.categories.categories || []);
  const isLoading = useSelector(state => state.categories.isLoading);
  const isDarkMode = useAppTheme();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);

  const handleCreateCategory = () => {
    if (!name.trim()) return;
    
    dispatch(addCategory({
      name: name.trim(),
      color: selectedColor,
      icon: selectedIcon
    }));
    
    setName('');
    setIsCreating(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.itemContainer, isDarkMode ? styles.borderDark : styles.borderLight]}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <View 
        style={[styles.iconContainer, { backgroundColor: item.color || '#ccc' }]}
      >
        <Text style={styles.iconText}>{item.icon || '📁'}</Text>
      </View>
      <Text style={[styles.itemText, isDarkMode ? styles.textLight : styles.textDark]}>{item.name}</Text>
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
        <View style={[styles.modalContent, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDarkMode ? styles.textLight : styles.textDark]}>
              {isCreating ? 'New Category' : 'Select Category'}
            </Text>
            <TouchableOpacity onPress={() => {
              if (isCreating) setIsCreating(false);
              else onClose();
            }}>
              <Text style={styles.closeText}>
                {isCreating ? 'Cancel' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {isCreating ? (
            <View>
              <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Category Name</Text>
              <TextInput
                style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
                placeholder="e.g. Groceries"
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                value={name}
                onChangeText={setName}
                autoFocus
              />

              <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Color</Text>
              <View style={styles.colorGrid}>
                {COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorCircle, 
                      { backgroundColor: color },
                      selectedColor === color && (isDarkMode ? styles.colorSelectedDark : styles.colorSelectedLight)
                    ]}
                  />
                ))}
              </View>

              <Text style={[styles.label, isDarkMode ? styles.textGray300 : styles.textGray700]}>Icon</Text>
              <View style={styles.iconGrid}>
                {ICONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    style={[
                      styles.iconCircle,
                      isDarkMode ? styles.bgGray700 : styles.bgGray200,
                      selectedIcon === icon && styles.iconSelected
                    ]}
                  >
                    <Text style={styles.iconEmoji}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, (!name.trim() || isLoading) ? styles.bgBlue300 : styles.bgBlue500]}
                onPress={handleCreateCategory}
                disabled={!name.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Create Category</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.createButton, isDarkMode ? styles.createButtonDark : styles.createButtonLight]}
                onPress={() => setIsCreating(true)}
              >
                <Text style={[styles.createButtonText, isDarkMode ? styles.textBlue400 : styles.textBlue600]}>+ Create New Category</Text>
              </TouchableOpacity>

              {categories.length === 0 ? (
                <Text style={[styles.emptyText, isDarkMode ? styles.textGray400 : styles.textGray500]}>No categories available.</Text>
              ) : (
                <FlatList
                  data={categories}
                  keyExtractor={item => item.id}
                  renderItem={renderItem}
                  contentContainerStyle={styles.listContent}
                />
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  bgLightCard: { backgroundColor: '#ffffff' },
  bgDarkCard: { backgroundColor: '#1f2937' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  textLight: { color: '#f3f4f6' },
  textDark: { color: '#111827' },
  closeText: { color: '#3b82f6', fontWeight: '600', fontSize: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  textGray300: { color: '#d1d5db' },
  textGray700: { color: '#374151' },
  textGray400: { color: '#9ca3af' },
  textGray500: { color: '#6b7280' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  inputLight: { backgroundColor: '#ffffff', borderColor: '#d1d5db', color: '#111827' },
  inputDark: { backgroundColor: '#111827', borderColor: '#374151', color: '#ffffff' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSelectedLight: { borderWidth: 2, borderColor: '#111827' },
  colorSelectedDark: { borderWidth: 2, borderColor: '#ffffff' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgGray200: { backgroundColor: '#e5e7eb' },
  bgGray700: { backgroundColor: '#374151' },
  iconSelected: { borderWidth: 2, borderColor: '#3b82f6' },
  iconEmoji: { fontSize: 18 },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bgBlue500: { backgroundColor: '#3b82f6' },
  bgBlue300: { backgroundColor: '#93c5fd' },
  submitButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  createButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  createButtonLight: { backgroundColor: '#eff6ff', borderColor: '#dbeafe' },
  createButtonDark: { backgroundColor: 'rgba(30, 58, 138, 0.3)', borderColor: '#1e40af' },
  textBlue600: { color: '#2563eb' },
  textBlue400: { color: '#60a5fa' },
  emptyText: { textAlign: 'center', marginTop: 20 },
  listContent: { paddingBottom: 20 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  borderLight: { borderBottomColor: '#e5e7eb' },
  borderDark: { borderBottomColor: '#374151' },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: { color: '#ffffff', fontSize: 14 },
  itemText: { fontSize: 16 },
});
