import { getDocs, addDoc, setDoc, deleteDoc, query, where, onSnapshot, doc } from 'firebase/firestore';
import * as actions from './actions';
import * as routes from './routes';
import { auth } from '../../../firebase';

const handleFirestoreError = (error, operationType, path) => {
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

export const subscribeToCategories = () => (dispatch) => {
  dispatch(actions.fetchCategoriesRequest());
  
  const userId = auth.currentUser?.uid;
  if (!userId) {
    dispatch(actions.fetchCategoriesError('User not authenticated'));
    return () => {};
  }

  // Query for user-specific categories OR system default categories (where userId == null)
  // Note: Firestore requires a composite index for complex OR queries, so we fetch user categories here.
  // In a real app, you might fetch system categories separately and merge them.
  const q = query(routes.getCategoriesCollection(), where('userId', '==', userId));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const categories = [];
    snapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    dispatch(actions.fetchCategoriesSuccess(categories));
  }, (error) => {
    const handledError = handleFirestoreError(error, 'list', 'categories');
    dispatch(actions.fetchCategoriesError(handledError.message));
  });

  return unsubscribe;
};

export const addCategory = (categoryData) => async (dispatch) => {
  dispatch(actions.addCategoryRequest());
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
    dispatch(actions.addCategoryError(handledError.message));
  }
};

export const updateCategory = (id, categoryData) => async (dispatch) => {
  dispatch(actions.updateCategoryRequest());
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    await setDoc(routes.getCategoryDoc(id), { ...categoryData, userId }, { merge: true });
  } catch (error) {
    const handledError = handleFirestoreError(error, 'update', `categories/${id}`);
    dispatch(actions.updateCategoryError(handledError.message));
  }
};

export const deleteCategory = (id) => async (dispatch) => {
  dispatch(actions.deleteCategoryRequest());
  try {
    await deleteDoc(routes.getCategoryDoc(id));
  } catch (error) {
    const handledError = handleFirestoreError(error, 'delete', `categories/${id}`);
    dispatch(actions.deleteCategoryError(handledError.message));
  }
};
