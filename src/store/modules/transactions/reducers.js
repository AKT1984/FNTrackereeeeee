import * as types from './action-types';

const initialState = {
  transactions: [],
  isLoading: false,
  error: null,
};

export default function transactionsReducer(state = initialState, action) {
  switch (action.type) {
    case types.FETCH_TRANSACTIONS_REQUEST:
    case types.ADD_TRANSACTION_REQUEST:
    case types.UPDATE_TRANSACTION_REQUEST:
    case types.DELETE_TRANSACTION_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
      
    case types.FETCH_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        transactions: action.payload,
      };
      
    case types.ADD_TRANSACTION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        transactions: [...state.transactions, action.payload],
      };
      
    case types.UPDATE_TRANSACTION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        transactions: state.transactions.map(transaction => 
          transaction.id === action.payload.id ? action.payload : transaction
        ),
      };
      
    case types.DELETE_TRANSACTION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload),
      };
      
    case types.FETCH_TRANSACTIONS_ERROR:
    case types.ADD_TRANSACTION_ERROR:
    case types.UPDATE_TRANSACTION_ERROR:
    case types.DELETE_TRANSACTION_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
      
    default:
      return state;
  }
}
