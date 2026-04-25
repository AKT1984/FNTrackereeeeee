import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  color: string;
  icon?: string;
}

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  isLoading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    fetchCategoriesRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchCategoriesSuccess(state, action: PayloadAction<Category[]>) {
      state.isLoading = false;
      state.categories = action.payload;
    },
    fetchCategoriesError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    addCategoryRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    addCategorySuccess(state, action: PayloadAction<Category>) {
      state.isLoading = false;
      state.categories.push(action.payload);
    },
    addCategoryError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateCategoryRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    updateCategorySuccess(state, action: PayloadAction<Category>) {
      state.isLoading = false;
      const index = state.categories.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    updateCategoryError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    deleteCategoryRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    deleteCategorySuccess(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.categories = state.categories.filter(c => c.id !== action.payload);
    },
    deleteCategoryError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesError,
  addCategoryRequest,
  addCategorySuccess,
  addCategoryError,
  updateCategoryRequest,
  updateCategorySuccess,
  updateCategoryError,
  deleteCategoryRequest,
  deleteCategorySuccess,
  deleteCategoryError,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
