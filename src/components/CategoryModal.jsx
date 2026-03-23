import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, TextInput, useColorScheme, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addCategory } from '../store/modules/categories/action-creators';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
const ICONS = ['💰', '🛒', '🍔', '🚗', '🏠', '🎮', '🏥', '✈️'];

export default function CategoryModal({ visible, onClose, onSelect }) {
  const dispatch = useDispatch();
  const categories = useSelector(state => state.categories.categories || []);
  const isLoading = useSelector(state => state.categories.isLoading);
  const isDarkMode = useColorScheme() === 'dark';

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
      className={`flex-row items-center py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <View 
        className="w-8 h-8 rounded-full items-center justify-center mr-3" 
        style={{ backgroundColor: item.color || '#ccc' }}
      >
        <Text className="text-white text-sm">{item.icon || '📁'}</Text>
      </View>
      <Text className={`text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className={`rounded-t-3xl p-5 max-h-[80%] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-5">
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {isCreating ? 'New Category' : 'Select Category'}
            </Text>
            <TouchableOpacity onPress={() => {
              if (isCreating) setIsCreating(false);
              else onClose();
            }}>
              <Text className="text-blue-500 font-semibold text-base">
                {isCreating ? 'Cancel' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {isCreating ? (
            <View>
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category Name</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 mb-4 text-base ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="e.g. Groceries"
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                value={name}
                onChangeText={setName}
                autoFocus
              />

              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Color</Text>
              <View className="flex-row flex-wrap mb-4">
                {COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full m-1 items-center justify-center ${selectedColor === color ? 'border-2 border-gray-900 dark:border-white' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>

              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Icon</Text>
              <View className="flex-row flex-wrap mb-6">
                {ICONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    className={`w-10 h-10 rounded-full m-1 items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} ${selectedIcon === icon ? 'border-2 border-blue-500' : ''}`}
                  >
                    <Text className="text-lg">{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                className={`py-4 rounded-lg items-center ${!name.trim() || isLoading ? 'bg-blue-300' : 'bg-blue-500'}`}
                onPress={handleCreateCategory}
                disabled={!name.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Create Category</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity 
                className="bg-blue-50 py-3 rounded-lg items-center mb-4 border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800"
                onPress={() => setIsCreating(true)}
              >
                <Text className="text-blue-600 dark:text-blue-400 font-semibold">+ Create New Category</Text>
              </TouchableOpacity>

              {categories.length === 0 ? (
                <Text className={`text-center mt-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No categories available.</Text>
              ) : (
                <FlatList
                  data={categories}
                  keyExtractor={item => item.id}
                  renderItem={renderItem}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
