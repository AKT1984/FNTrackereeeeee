import * as types from './action-types';

export const fetchAccountsRequest = () => ({ type: types.FETCH_ACCOUNTS_REQUEST });
export const fetchAccountsSuccess = (accounts) => ({ type: types.FETCH_ACCOUNTS_SUCCESS, payload: accounts });
export const fetchAccountsError = (error) => ({ type: types.FETCH_ACCOUNTS_ERROR, payload: error });

export const addAccountRequest = () => ({ type: types.ADD_ACCOUNT_REQUEST });
export const addAccountSuccess = (account) => ({ type: types.ADD_ACCOUNT_SUCCESS, payload: account });
export const addAccountError = (error) => ({ type: types.ADD_ACCOUNT_ERROR, payload: error });

export const updateAccountRequest = () => ({ type: types.UPDATE_ACCOUNT_REQUEST });
export const updateAccountSuccess = (account) => ({ type: types.UPDATE_ACCOUNT_SUCCESS, payload: account });
export const updateAccountError = (error) => ({ type: types.UPDATE_ACCOUNT_ERROR, payload: error });

export const deleteAccountRequest = () => ({ type: types.DELETE_ACCOUNT_REQUEST });
export const deleteAccountSuccess = (id) => ({ type: types.DELETE_ACCOUNT_SUCCESS, payload: id });
export const deleteAccountError = (error) => ({ type: types.DELETE_ACCOUNT_ERROR, payload: error });
