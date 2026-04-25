import { getDocs, addDoc, setDoc, deleteDoc, query, where, onSnapshot, doc } from 'firebase/firestore';
import { auth } from '../../../firebase';
import * as routes from './routes';
import {
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesError,
  addCategoryRequest,
  addCategoryError,
  updateCategoryRequest,
  updateCategoryError,
  deleteCategoryRequest,
  deleteCategoryError,
} from './slice';
import { AppDispatch } from '../../index';

const handleFirestoreError = (error: any, operationType: string, path: string) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
};

export const subscribeToCategories = () => (dispatch: AppDispatch) => {
  dispatch(fetchCategoriesRequest());
  
  const userId = auth.currentUser?.uid;
  if (!userId) {
    dispatch(fetchCategoriesError('User not authenticated'));
    return () => {};
  }

  const q = query(routes.getCategoriesCollection(), where('userId', '==', userId));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const categories: any[] = [];
    snapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) });
    });
    dispatch(fetchCategoriesSuccess(categories));
  }, (error) => {
    const handledError = handleFirestoreError(error, 'list', 'categories');
    dispatch(fetchCategoriesError(handledError.message));
  });

  return unsubscribe;
};

export const addCategory = (categoryData: any) => async (dispatch: AppDispatch) => {
  dispatch(addCategoryRequest());
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(routes.getCategoriesCollection());

    const newCategory = {
      ...categoryData,
      id: docRef.id,
      userId,
    };

    await setDoc(docRef, newCategory);
  } catch (error) {
    const handledError = handleFirestoreError(error, 'create', 'categories');
    dispatch(addCategoryError(handledError.message));
  }
};

export const updateCategory = (id: string, categoryData: any) => async (dispatch: AppDispatch) => {
  dispatch(updateCategoryRequest());
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    await setDoc(routes.getCategoryDoc(id), { ...categoryData, userId }, { merge: true });
  } catch (error) {
    const handledError = handleFirestoreError(error, 'update', `categories/${id}`);
    dispatch(updateCategoryError(handledError.message));
  }
};

export const deleteCategory = (id: string) => async (dispatch: AppDispatch) => {
  dispatch(deleteCategoryRequest());
  try {
    await deleteDoc(routes.getCategoryDoc(id));
  } catch (error) {
    const handledError = handleFirestoreError(error, 'delete', `categories/${id}`);
    dispatch(deleteCategoryError(handledError.message));
  }
};
