import * as types from './action-types';

export const authStateChanged = (user) => ({
  type: types.AUTH_STATE_CHANGED,
  payload: user,
});

export const loginRequest = () => ({
  type: types.LOGIN_REQUEST,
});

export const loginSuccess = (user) => ({
  type: types.LOGIN_SUCCESS,
  payload: user,
});

export const loginError = (error) => ({
  type: types.LOGIN_ERROR,
  payload: error,
});

export const logoutRequest = () => ({
  type: types.LOGOUT_REQUEST,
});

export const logoutSuccess = () => ({
  type: types.LOGOUT_SUCCESS,
});

export const logoutError = (error) => ({
  type: types.LOGOUT_ERROR,
  payload: error,
});

export const updateCurrencySuccess = (currency) => ({
  type: types.UPDATE_CURRENCY_SUCCESS,
  payload: currency,
});
