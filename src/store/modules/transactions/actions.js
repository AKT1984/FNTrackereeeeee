import * as types from './action-types';

export const fetchTransactionsRequest = () => ({
  type: types.FETCH_TRANSACTIONS_REQUEST,
});

export const fetchTransactionsSuccess = (transactions) => ({
  type: types.FETCH_TRANSACTIONS_SUCCESS,
  payload: transactions,
});

export const fetchTransactionsError = (error) => ({
  type: types.FETCH_TRANSACTIONS_ERROR,
  payload: error,
});

export const addTransactionRequest = () => ({
  type: types.ADD_TRANSACTION_REQUEST,
});

export const addTransactionSuccess = (transaction) => ({
  type: types.ADD_TRANSACTION_SUCCESS,
  payload: transaction,
});

export const addTransactionError = (error) => ({
  type: types.ADD_TRANSACTION_ERROR,
  payload: error,
});

export const updateTransactionRequest = () => ({
  type: types.UPDATE_TRANSACTION_REQUEST,
});

export const updateTransactionSuccess = (transaction) => ({
  type: types.UPDATE_TRANSACTION_SUCCESS,
  payload: transaction,
});

export const updateTransactionError = (error) => ({
  type: types.UPDATE_TRANSACTION_ERROR,
  payload: error,
});

export const deleteTransactionRequest = () => ({
  type: types.DELETE_TRANSACTION_REQUEST,
});

export const deleteTransactionSuccess = (id) => ({
  type: types.DELETE_TRANSACTION_SUCCESS,
  payload: id,
});

export const deleteTransactionError = (error) => ({
  type: types.DELETE_TRANSACTION_ERROR,
  payload: error,
});
