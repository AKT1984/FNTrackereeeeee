import * as types from './action-types';

const initialState = {
  accounts: [],
  isLoading: false,
  error: null,
};

export default function accountsReducer(state = initialState, action) {
  switch (action.type) {
    case types.FETCH_ACCOUNTS_REQUEST:
    case types.ADD_ACCOUNT_REQUEST:
    case types.UPDATE_ACCOUNT_REQUEST:
    case types.DELETE_ACCOUNT_REQUEST:
      return { ...state, isLoading: true, error: null };
    
    case types.FETCH_ACCOUNTS_SUCCESS:
      return { ...state, isLoading: false, accounts: action.payload };
    
    case types.ADD_ACCOUNT_SUCCESS:
      return { ...state, isLoading: false, accounts: [...state.accounts, action.payload] };
    
    case types.UPDATE_ACCOUNT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        accounts: state.accounts.map(acc => acc.id === action.payload.id ? action.payload : acc)
      };
    
    case types.DELETE_ACCOUNT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        accounts: state.accounts.filter(acc => acc.id !== action.payload)
      };
    
    case types.FETCH_ACCOUNTS_ERROR:
    case types.ADD_ACCOUNT_ERROR:
    case types.UPDATE_ACCOUNT_ERROR:
    case types.DELETE_ACCOUNT_ERROR:
      return { ...state, isLoading: false, error: action.payload };
      
    default:
      return state;
  }
}
