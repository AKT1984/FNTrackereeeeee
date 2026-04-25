import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateCurrency, logoutUser } from '../store/modules/auth/thunks';
import { setTheme } from '../store/modules/settings/slice';
import { LogOut, User, Download, Info, ChevronRight, Moon, Sun, Monitor } from 'lucide-react';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'MDL', symbol: 'L', name: 'Moldovan Leu' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
];

export default function SettingsScreen() {
  const isDarkMode = useAppTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const themePreference = useSelector(state => state.settings?.theme || 'system');
  const currentCurrency = user?.currency || 'USD';

  const handleCurrencySelect = (code) => {
    if (code !== currentCurrency) {
      dispatch(updateCurrency(code));
    }
  };

  const handleThemeSelect = (theme) => {
    dispatch(setTheme(theme));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <ScrollView style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <View style={styles.content}>
        
        {/* Account Section */}
        <Text style={[styles.sectionTitle, isDarkMode ? styles.textLight : styles.textDark]}>
          Account
        </Text>
        <View style={[styles.card, isDarkMode ? styles.bgDarkCard : styles.bgLightCard, styles.marginBottom]}>
          <View style={[styles.accountRow, styles.borderBottom, isDarkMode ? styles.borderDark : styles.borderLight]}>
            <View style={styles.iconContainer}>
              <User color={isDarkMode ? '#9ca3af' : '#6b7280'} size={20} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={[styles.accountLabel, isDarkMode ? styles.textGray400 : styles.textGray500]}>Email</Text>
              <Text style={[styles.accountValue, isDarkMode ? styles.textLight : styles.textDark]}>
                {user?.email || 'Not logged in'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut color="#ef4444" size={20} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Theme Section (Web Only) */}
        {Platform.OS === 'web' && (
          <>
            <Text style={[styles.sectionTitle, isDarkMode ? styles.textLight : styles.textDark]}>
              Theme
            </Text>
            <Text style={[styles.description, isDarkMode ? styles.textGray400 : styles.textGray500]}>
              Choose your preferred appearance.
            </Text>

            <View style={[styles.card, isDarkMode ? styles.bgDarkCard : styles.bgLightCard, styles.marginBottom]}>
              {[
                { id: 'system', label: 'System Default', icon: Monitor },
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
              ].map((themeOption, index) => {
                const isSelected = themeOption.id === themePreference;
                const Icon = themeOption.icon;
                return (
                  <TouchableOpacity
                    key={themeOption.id}
                    style={[
                      styles.currencyRow,
                      index !== 2 && [styles.borderBottom, isDarkMode ? styles.borderDark : styles.borderLight]
                    ]}
                    onPress={() => handleThemeSelect(themeOption.id)}
                  >
                    <View style={styles.currencyInfo}>
                      <Icon color={isDarkMode ? '#f9fafb' : '#111827'} size={20} style={{ marginRight: 12 }} />
                      <Text style={[styles.currencyName, isDarkMode ? styles.textLight : styles.textDark]}>
                        {themeOption.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <View style={styles.checkInner} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Currency Section */}
        <Text style={[styles.sectionTitle, isDarkMode ? styles.textLight : styles.textDark]}>
          Currency
        </Text>
        <Text style={[styles.description, isDarkMode ? styles.textGray400 : styles.textGray500]}>
          Select your preferred currency for displaying transactions and reports.
        </Text>

        <View style={[styles.card, isDarkMode ? styles.bgDarkCard : styles.bgLightCard, styles.marginBottom]}>
          {CURRENCIES.map((currency, index) => {
            const isSelected = currency.code === currentCurrency;
            return (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyRow,
                  index !== CURRENCIES.length - 1 && [styles.borderBottom, isDarkMode ? styles.borderDark : styles.borderLight]
                ]}
                onPress={() => handleCurrencySelect(currency.code)}
              >
                <View style={styles.currencyInfo}>
                  <Text style={[styles.currencySymbol, isDarkMode ? styles.textLight : styles.textDark]}>
                    {currency.symbol}
                  </Text>
                  <Text style={[styles.currencyName, isDarkMode ? styles.textLight : styles.textDark]}>
                    {currency.name} ({currency.code})
                  </Text>
                </View>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <View style={styles.checkInner} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* More Options Section */}
        <Text style={[styles.sectionTitle, isDarkMode ? styles.textLight : styles.textDark]}>
          More Options
        </Text>
        <View style={[styles.card, isDarkMode ? styles.bgDarkCard : styles.bgLightCard, styles.marginBottom]}>
          <TouchableOpacity 
            style={[styles.linkRow, styles.borderBottom, isDarkMode ? styles.borderDark : styles.borderLight]}
            onPress={() => navigation.navigate('Export')}
          >
            <View style={styles.linkInfo}>
              <Download color={isDarkMode ? '#9ca3af' : '#6b7280'} size={20} style={styles.linkIcon} />
              <Text style={[styles.linkText, isDarkMode ? styles.textLight : styles.textDark]}>Export Data</Text>
            </View>
            <ChevronRight color={isDarkMode ? '#9ca3af' : '#6b7280'} size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkRow}
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.linkInfo}>
              <Info color={isDarkMode ? '#9ca3af' : '#6b7280'} size={20} style={styles.linkIcon} />
              <Text style={[styles.linkText, isDarkMode ? styles.textLight : styles.textDark]}>About FinTrack RN</Text>
            </View>
            <ChevronRight color={isDarkMode ? '#9ca3af' : '#6b7280'} size={20} />
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, maxWidth: 800, width: '100%', alignSelf: 'center' },
  bgLight: { backgroundColor: '#f3f4f6' },
  bgDark: { backgroundColor: '#111827' },
  bgLightCard: { backgroundColor: '#ffffff' },
  bgDarkCard: { backgroundColor: '#1f2937' },
  textLight: { color: '#f9fafb' },
  textDark: { color: '#111827' },
  textGray400: { color: '#9ca3af' },
  textGray500: { color: '#6b7280' },
  borderLight: { borderBottomColor: '#f3f4f6' },
  borderDark: { borderBottomColor: '#374151' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, marginBottom: 20 },
  marginBottom: { marginBottom: 24 },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  accountValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 30,
  },
  currencyName: {
    fontSize: 16,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  linkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    marginRight: 12,
  },
  linkText: {
    fontSize: 16,
  },
});
