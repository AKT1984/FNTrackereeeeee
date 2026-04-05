import { createStore, applyMiddleware, combineReducers } from 'redux';
import { thunk } from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';

// Custom storage wrapper to avoid Vite CJS issues with redux-persist/lib/storage
const storage = {
  getItem: (key) => {
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key, value) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

import transactionsReducer from './modules/transactions/reducers';
import authReducer from './modules/auth/reducers';
import categoriesReducer from './modules/categories/reducers';
import accountsReducer from './modules/accounts/reducers';

const rootReducer = combineReducers({
  transactions: transactionsReducer,
  auth: authReducer,
  categories: categoriesReducer,
  accounts: accountsReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['transactions', 'categories', 'accounts'], // cache these
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);

export default store;
