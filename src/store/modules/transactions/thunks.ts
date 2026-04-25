import { getDocs, addDoc, setDoc, deleteDoc, query, where, onSnapshot, doc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../../firebase';
import * as routes from './routes';
import {
  fetchTransactionsRequest,
  fetchTransactionsSuccess,
  fetchTransactionsError,
  addTransactionRequest,
  addTransactionError,
  updateTransactionRequest,
  updateTransactionError,
  deleteTransactionRequest,
  deleteTransactionError,
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

export const subscribeToTransactions = () => (dispatch: AppDispatch) => {
  dispatch(fetchTransactionsRequest());
  
  const userId = auth.currentUser?.uid;
  if (!userId) {
    dispatch(fetchTransactionsError('User not authenticated'));
    return () => {};
  }

  const q = query(routes.getTransactionsCollection(), where('userId', '==', userId));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const transactions: any[] = [];
    snapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) });
    });
    dispatch(fetchTransactionsSuccess(transactions));
  }, (error) => {
    const handledError = handleFirestoreError(error, 'list', 'transactions');
    dispatch(fetchTransactionsError(handledError.message));
  });

  return unsubscribe;
};

export const addTransaction = (transactionData: any) => async (dispatch: AppDispatch) => {
  dispatch(addTransactionRequest());
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(routes.getTransactionsCollection());
    
    const newTransaction = {
      ...transactionData,
      id: docRef.id,
      userId,
      date: transactionData.date || serverTimestamp(),
    };

    await setDoc(docRef, newTransaction);
  } catch (error) {
    const handledError = handleFirestoreError(error, 'create', 'transactions');
    dispatch(addTransactionError(handledError.message));
  }
};

export const updateTransaction = (id: string, transactionData: any) => async (dispatch: AppDispatch) => {
  dispatch(updateTransactionRequest());
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    await setDoc(routes.getTransactionDoc(id), { ...transactionData, userId }, { merge: true });
  } catch (error) {
    const handledError = handleFirestoreError(error, 'update', `transactions/${id}`);
    dispatch(updateTransactionError(handledError.message));
  }
};

export const deleteTransaction = (id: string) => async (dispatch: AppDispatch) => {
  dispatch(deleteTransactionRequest());
  try {
    await deleteDoc(routes.getTransactionDoc(id));
  } catch (error) {
    const handledError = handleFirestoreError(error, 'delete', `transactions/${id}`);
    dispatch(deleteTransactionError(handledError.message));
  }
};
