import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Account {
  id: string;
  userId: string;
  name: string;
  currency: string;
  createdAt: any;
  updatedAt?: any;
}

interface AccountsState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  isLoading: false,
  error: null,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    fetchAccountsRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchAccountsSuccess(state, action: PayloadAction<Account[]>) {
      state.isLoading = false;
      state.accounts = action.payload;
    },
    fetchAccountsError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    addAccountRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    addAccountSuccess(state, action: PayloadAction<Account>) {
      state.isLoading = false;
      state.accounts.push(action.payload);
    },
    addAccountError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateAccountRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    updateAccountSuccess(state, action: PayloadAction<Account>) {
      state.isLoading = false;
      const index = state.accounts.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.accounts[index] = action.payload;
      }
    },
    updateAccountError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    deleteAccountRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    deleteAccountSuccess(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.accounts = state.accounts.filter(a => a.id !== action.payload);
    },
    deleteAccountError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchAccountsRequest,
  fetchAccountsSuccess,
  fetchAccountsError,
  addAccountRequest,
  addAccountSuccess,
  addAccountError,
  updateAccountRequest,
  updateAccountSuccess,
  updateAccountError,
  deleteAccountRequest,
  deleteAccountSuccess,
  deleteAccountError,
} = accountsSlice.actions;

export default accountsSlice.reducer;
