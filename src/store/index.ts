import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

// Custom storage wrapper to avoid Vite CJS issues with redux-persist/lib/storage
const storage = {
  getItem: (key: string) => {
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key: string, value: string) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

import authReducer from './modules/auth/slice';
import transactionsReducer from './modules/transactions/slice';
import categoriesReducer from './modules/categories/slice';
import accountsReducer from './modules/accounts/slice';
import subscriptionsReducer from './modules/subscriptions/slice';
import settingsReducer from './modules/settings/slice';

const rootReducer = combineReducers({
  auth: authReducer,
  transactions: transactionsReducer,
  categories: categoriesReducer,
  accounts: accountsReducer,
  subscriptions: subscriptionsReducer,
  settings: settingsReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['transactions', 'categories', 'accounts', 'subscriptions', 'settings'], // cache these
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
