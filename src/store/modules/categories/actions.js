import * as types from './action-types';

export const fetchCategoriesRequest = () => ({
  type: types.FETCH_CATEGORIES_REQUEST,
});

export const fetchCategoriesSuccess = (categories) => ({
  type: types.FETCH_CATEGORIES_SUCCESS,
  payload: categories,
});

export const fetchCategoriesError = (error) => ({
  type: types.FETCH_CATEGORIES_ERROR,
  payload: error,
});

export const addCategoryRequest = () => ({
  type: types.ADD_CATEGORY_REQUEST,
});

export const addCategorySuccess = (category) => ({
  type: types.ADD_CATEGORY_SUCCESS,
  payload: category,
});

export const addCategoryError = (error) => ({
  type: types.ADD_CATEGORY_ERROR,
  payload: error,
});

export const updateCategoryRequest = () => ({
  type: types.UPDATE_CATEGORY_REQUEST,
});

export const updateCategorySuccess = (category) => ({
  type: types.UPDATE_CATEGORY_SUCCESS,
  payload: category,
});

export const updateCategoryError = (error) => ({
  type: types.UPDATE_CATEGORY_ERROR,
  payload: error,
});

export const deleteCategoryRequest = () => ({
  type: types.DELETE_CATEGORY_REQUEST,
});

export const deleteCategorySuccess = (id) => ({
  type: types.DELETE_CATEGORY_SUCCESS,
  payload: id,
});

export const deleteCategoryError = (error) => ({
  type: types.DELETE_CATEGORY_ERROR,
  payload: error,
});
