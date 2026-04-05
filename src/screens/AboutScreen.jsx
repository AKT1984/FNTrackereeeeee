import React from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView } from 'react-native';

export default function AboutScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <ScrollView style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode ? styles.textLight : styles.textDark]}>FinTrack RN</Text>
        <Text style={[styles.version, isDarkMode ? styles.textGray400 : styles.textGray500]}>Version 1.0.0</Text>
        
        <View style={[styles.card, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
          <Text style={[styles.description, isDarkMode ? styles.textLight : styles.textDark]}>
            FinTrack RN is a comprehensive personal finance tracker built with React Native and Redux.
            It helps you monitor your income and expenses, categorize your transactions, and visualize your financial health.
          </Text>
        </View>

        <Text style={[styles.subtitle, isDarkMode ? styles.textLight : styles.textDark]}>Features</Text>
        <View style={[styles.card, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
          <Text style={[styles.listItem, isDarkMode ? styles.textGray400 : styles.textGray500]}>• Track Income & Expenses</Text>
          <Text style={[styles.listItem, isDarkMode ? styles.textGray400 : styles.textGray500]}>• Categorize Transactions</Text>
          <Text style={[styles.listItem, isDarkMode ? styles.textGray400 : styles.textGray500]}>• Visual Reports & Analytics</Text>
          <Text style={[styles.listItem, isDarkMode ? styles.textGray400 : styles.textGray500]}>• Data Export (CSV, JSON, Excel)</Text>
          <Text style={[styles.listItem, isDarkMode ? styles.textGray400 : styles.textGray500]}>• Dark Mode Support</Text>
        </View>

        <Text style={[styles.subtitle, isDarkMode ? styles.textLight : styles.textDark]}>Developer</Text>
        <View style={[styles.card, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
          <Text style={[styles.description, isDarkMode ? styles.textLight : styles.textDark]}>
            Built by an Expert Software Engineer for the FinTrack RN cross-platform application.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  bgLight: { backgroundColor: '#f3f4f6' },
  bgDark: { backgroundColor: '#111827' },
  bgLightCard: { backgroundColor: '#ffffff' },
  bgDarkCard: { backgroundColor: '#1f2937' },
  textLight: { color: '#f3f4f6' },
  textDark: { color: '#111827' },
  textGray400: { color: '#9ca3af' },
  textGray500: { color: '#6b7280' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  version: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  subtitle: { fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 12 },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  description: { fontSize: 16, lineHeight: 24 },
  listItem: { fontSize: 16, lineHeight: 28, marginBottom: 4 },
});
