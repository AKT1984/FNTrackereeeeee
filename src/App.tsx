import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store';
import AppNavigator from './navigation/AppNavigator';
import { initAuthListener, loginWithGoogle } from './store/modules/auth/action-creators';

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state: any) => state.auth);

  useEffect(() => {
    dispatch(initAuthListener() as any);
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading FinTrack RN...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>FinTrack RN</Text>
        <Text style={styles.subtitle}>Your Personal Finance Tracker</Text>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => dispatch(loginWithGoogle() as any)}
        >
          <Text style={styles.loginButtonText}>Login with Google</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  }
});
