import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  accountId: string;
  date: any; // Firestore timestamp or Date
  description?: string;
  originalAmount?: number;
  originalCurrency?: string;
  exchangeRate?: number;
}

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  isLoading: false,
  error: null,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    fetchTransactionsRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchTransactionsSuccess(state, action: PayloadAction<Transaction[]>) {
      state.isLoading = false;
      state.transactions = action.payload;
    },
    fetchTransactionsError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    addTransactionRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    addTransactionSuccess(state, action: PayloadAction<Transaction>) {
      state.isLoading = false;
      state.transactions.push(action.payload);
    },
    addTransactionError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateTransactionRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    updateTransactionSuccess(state, action: PayloadAction<Transaction>) {
      state.isLoading = false;
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    updateTransactionError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    deleteTransactionRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    deleteTransactionSuccess(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
    },
    deleteTransactionError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchTransactionsRequest,
  fetchTransactionsSuccess,
  fetchTransactionsError,
  addTransactionRequest,
  addTransactionSuccess,
  addTransactionError,
  updateTransactionRequest,
  updateTransactionSuccess,
  updateTransactionError,
  deleteTransactionRequest,
  deleteTransactionSuccess,
  deleteTransactionError,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
