import * as types from './action-types';

const initialState = {
  categories: [],
  isLoading: false,
  error: null,
};

export default function categoriesReducer(state = initialState, action) {
  switch (action.type) {
    case types.FETCH_CATEGORIES_REQUEST:
    case types.ADD_CATEGORY_REQUEST:
    case types.UPDATE_CATEGORY_REQUEST:
    case types.DELETE_CATEGORY_REQUEST:
      return { ...state, isLoading: true, error: null };
      
    case types.FETCH_CATEGORIES_SUCCESS:
      return { ...state, isLoading: false, categories: action.payload };
      
    case types.ADD_CATEGORY_SUCCESS:
      return { ...state, isLoading: false, categories: [...state.categories, action.payload] };
      
    case types.UPDATE_CATEGORY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        categories: state.categories.map(cat => cat.id === action.payload.id ? action.payload : cat)
      };
      
    case types.DELETE_CATEGORY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        categories: state.categories.filter(cat => cat.id !== action.payload)
      };
      
    case types.FETCH_CATEGORIES_ERROR:
    case types.ADD_CATEGORY_ERROR:
    case types.UPDATE_CATEGORY_ERROR:
    case types.DELETE_CATEGORY_ERROR:
      return { ...state, isLoading: false, error: action.payload };
      
    default:
      return state;
  }
}
