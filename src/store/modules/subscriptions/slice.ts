import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: string;
  categoryId: string;
  accountId: string;
  startDate: any;
  nextBillingDate: any;
  frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  notifyDaysBefore: number;
  lastProcessedDate?: any;
}

interface SubscriptionsState {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SubscriptionsState = {
  subscriptions: [],
  isLoading: false,
  error: null,
};

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    fetchSubscriptionsRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchSubscriptionsSuccess(state, action: PayloadAction<Subscription[]>) {
      state.isLoading = false;
      state.subscriptions = action.payload;
    },
    fetchSubscriptionsError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    addSubscriptionRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    addSubscriptionSuccess(state, action: PayloadAction<Subscription>) {
      state.isLoading = false;
      state.subscriptions.push(action.payload);
    },
    addSubscriptionError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateSubscriptionRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    updateSubscriptionSuccess(state, action: PayloadAction<Subscription>) {
      state.isLoading = false;
      const index = state.subscriptions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      }
    },
    updateSubscriptionError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    deleteSubscriptionRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    deleteSubscriptionSuccess(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.subscriptions = state.subscriptions.filter(s => s.id !== action.payload);
    },
    deleteSubscriptionError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchSubscriptionsRequest,
  fetchSubscriptionsSuccess,
  fetchSubscriptionsError,
  addSubscriptionRequest,
  addSubscriptionSuccess,
  addSubscriptionError,
  updateSubscriptionRequest,
  updateSubscriptionSuccess,
  updateSubscriptionError,
  deleteSubscriptionRequest,
  deleteSubscriptionSuccess,
  deleteSubscriptionError,
} = subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
