import * as types from './action-types';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Initially true while checking auth state
  error: null,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case types.LOGIN_REQUEST:
    case types.LOGOUT_REQUEST:
      return { ...state, isLoading: true, error: null };
      
    case types.AUTH_STATE_CHANGED:
    case types.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: !!action.payload,
        user: action.payload,
        error: null,
      };
      
    case types.LOGOUT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };
      
    case types.LOGIN_ERROR:
    case types.LOGOUT_ERROR:
      return { ...state, isLoading: false, error: action.payload };
      
    case types.UPDATE_CURRENCY_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          currency: action.payload,
        },
      };

    default:
      return state;
  }
}
