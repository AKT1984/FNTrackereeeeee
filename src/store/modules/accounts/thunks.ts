import { onSnapshot, query, where, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../../firebase';
import * as routes from './routes';
import {
  fetchAccountsRequest,
  fetchAccountsSuccess,
  fetchAccountsError,
  addAccountRequest,
  addAccountError,
  updateAccountRequest,
  updateAccountError,
  deleteAccountRequest,
  deleteAccountError,
} from './slice';
import { AppDispatch, RootState } from '../../index';

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

let unsubscribeAccounts: (() => void) | null = null;

export const subscribeToAccounts = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const { user } = getState().auth;
  if (!user) return;

  dispatch(fetchAccountsRequest());

  const q = query(
    routes.getAccountsCollection(),
    where('userId', '==', user.uid)
  );

  unsubscribeAccounts = onSnapshot(q, (snapshot) => {
    const accounts: any[] = [];
    snapshot.forEach((doc) => {
      accounts.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) });
    });
    dispatch(fetchAccountsSuccess(accounts));
  }, (error) => {
    const handledError = handleFirestoreError(error, 'list', 'accounts');
    dispatch(fetchAccountsError(handledError.message));
  });
};

export const unsubscribeFromAccounts = () => () => {
  if (unsubscribeAccounts) {
    unsubscribeAccounts();
    unsubscribeAccounts = null;
  }
};

export const addAccount = (accountData: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const { user } = getState().auth;
  if (!user) return;

  dispatch(addAccountRequest());
  try {
    await addDoc(routes.getAccountsCollection(), {
      ...accountData,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    const handledError = handleFirestoreError(error, 'create', 'accounts');
    dispatch(addAccountError(handledError.message));
  }
};

export const updateAccount = (id: string, accountData: any) => async (dispatch: AppDispatch) => {
  dispatch(updateAccountRequest());
  try {
    const docRef = routes.getAccountDoc(id);
    await updateDoc(docRef, {
      ...accountData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    const handledError = handleFirestoreError(error, 'update', `accounts/${id}`);
    dispatch(updateAccountError(handledError.message));
  }
};

export const deleteAccount = (id: string) => async (dispatch: AppDispatch) => {
  dispatch(deleteAccountRequest());
  try {
    const docRef = routes.getAccountDoc(id);
    await deleteDoc(docRef);
  } catch (error) {
    const handledError = handleFirestoreError(error, 'delete', `accounts/${id}`);
    dispatch(deleteAccountError(handledError.message));
  }
};
