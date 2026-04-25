import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  currency: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<User>) {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    logoutSuccess(state) {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    logoutError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    authStateChanged(state, action: PayloadAction<User | null>) {
      state.isLoading = false;
      state.isAuthenticated = !!action.payload;
      state.user = action.payload;
      state.error = null;
    },
    updateCurrencySuccess(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.currency = action.payload;
      }
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginError,
  logoutRequest,
  logoutSuccess,
  logoutError,
  authStateChanged,
  updateCurrencySuccess,
} = authSlice.actions;

export default authSlice.reducer;
