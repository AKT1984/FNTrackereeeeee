import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store';
import AppNavigator from './navigation/AppNavigator';
import { initAuthListener, loginWithGoogle } from './store/modules/auth/thunks';
import { subscribeToSubscriptions, updateSubscription } from './store/modules/subscriptions/thunks';
import { addTransaction } from './store/modules/transactions/thunks';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error } = useSelector((state: any) => state.auth);
  const subscriptions = useSelector((state: any) => state.subscriptions?.subscriptions || []);

  useEffect(() => {
    dispatch(initAuthListener() as any);
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(subscribeToSubscriptions() as any);
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (!isAuthenticated || subscriptions.length === 0) return;

    const processSubscriptions = async () => {
      const now = new Date();
      
      for (const sub of subscriptions) {
        let nextBilling = sub.nextBillingDate?.toDate ? sub.nextBillingDate.toDate() : new Date(sub.nextBillingDate);
        
        // Process if billing date is in the past or today
        if (nextBilling <= now) {
          let currentBilling = new Date(nextBilling);
          
          // Create transaction
          dispatch(addTransaction({
            amount: sub.amount,
            description: `Subscription: ${sub.name}`,
            type: 'EXPENSE',
            categoryId: sub.categoryId,
            accountId: sub.accountId,
            originalAmount: sub.amount,
            originalCurrency: sub.currency,
            exchangeRate: 1, // Simplified for now, should ideally fetch rate if different from base
            date: currentBilling,
          }) as any);

          // Calculate next billing date
          if (sub.frequency === 'MONTHLY') {
            nextBilling.setMonth(nextBilling.getMonth() + 1);
          } else if (sub.frequency === 'WEEKLY') {
            nextBilling.setDate(nextBilling.getDate() + 7);
          } else if (sub.frequency === 'YEARLY') {
            nextBilling.setFullYear(nextBilling.getFullYear() + 1);
          }

          // Update subscription
          dispatch(updateSubscription(sub.id, {
            nextBillingDate: nextBilling,
            lastProcessedDate: new Date(),
          }) as any);
        }

        // Handle Notifications
        if (sub.notifyDaysBefore > 0) {
          const daysUntilBilling = Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 3600 * 24));
          if (daysUntilBilling <= sub.notifyDaysBefore && daysUntilBilling > 0) {
            const message = `Upcoming payment: ${sub.name} (${sub.currency} ${sub.amount}) in ${daysUntilBilling} day(s).`;
            
            if (Platform.OS === 'web') {
              // Check if browser supports notifications
              if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                  new Notification('FinTrack RN', { body: message });
                } else if (Notification.permission !== 'denied') {
                  Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                      new Notification('FinTrack RN', { body: message });
                    }
                  });
                }
              } else {
                // Fallback for browsers that don't support Notification API
                console.log('Notification:', message);
              }
            } else {
              // For mobile, we would typically use a push notification library here
              // For now, we'll just log it
              console.log('Mobile Notification:', message);
            }
          }
        }
      }
    };

    processSubscriptions();
  }, [subscriptions, isAuthenticated, dispatch]);

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
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
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
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    maxWidth: '80%',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  }
});
