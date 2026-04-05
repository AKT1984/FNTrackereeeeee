import { onSnapshot, query, where, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../../firebase';
import * as actions from './actions';
import * as routes from './routes';

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

let unsubscribeAccounts = null;

export const subscribeToAccounts = () => (dispatch, getState) => {
  const { user } = getState().auth;
  if (!user) return;

  dispatch(actions.fetchAccountsRequest());

  const q = query(
    routes.getAccountsCollection(),
    where('userId', '==', user.uid)
  );

  unsubscribeAccounts = onSnapshot(q, (snapshot) => {
    const accounts = [];
    snapshot.forEach((doc) => {
      accounts.push({ id: doc.id, ...doc.data() });
    });
    dispatch(actions.fetchAccountsSuccess(accounts));
  }, (error) => {
    const handledError = handleFirestoreError(error, 'list', 'accounts');
    dispatch(actions.fetchAccountsError(handledError.message));
  });
};

export const unsubscribeFromAccounts = () => () => {
  if (unsubscribeAccounts) {
    unsubscribeAccounts();
    unsubscribeAccounts = null;
  }
};

export const addAccount = (accountData) => async (dispatch, getState) => {
  const { user } = getState().auth;
  if (!user) return;

  dispatch(actions.addAccountRequest());
  try {
    const docRef = await addDoc(routes.getAccountsCollection(), {
      ...accountData,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    // The onSnapshot listener will handle the success dispatch
  } catch (error) {
    const handledError = handleFirestoreError(error, 'create', 'accounts');
    dispatch(actions.addAccountError(handledError.message));
  }
};

export const updateAccount = (id, accountData) => async (dispatch) => {
  dispatch(actions.updateAccountRequest());
  try {
    const docRef = routes.getAccountDoc(id);
    await updateDoc(docRef, {
      ...accountData,
      updatedAt: serverTimestamp(),
    });
    // The onSnapshot listener will handle the success dispatch
  } catch (error) {
    const handledError = handleFirestoreError(error, 'update', `accounts/${id}`);
    dispatch(actions.updateAccountError(handledError.message));
  }
};

export const deleteAccount = (id) => async (dispatch) => {
  dispatch(actions.deleteAccountRequest());
  try {
    const docRef = routes.getAccountDoc(id);
    await deleteDoc(docRef);
    // The onSnapshot listener will handle the success dispatch
  } catch (error) {
    const handledError = handleFirestoreError(error, 'delete', `accounts/${id}`);
    dispatch(actions.deleteAccountError(handledError.message));
  }
};
