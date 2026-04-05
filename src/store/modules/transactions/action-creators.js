import { getDocs, addDoc, setDoc, deleteDoc, query, where, onSnapshot, doc, serverTimestamp } from 'firebase/firestore';
import * as actions from './actions';
import * as routes from './routes';
import { auth } from '../../../firebase';

// Helper for error handling
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

export const subscribeToTransactions = () => (dispatch) => {
  dispatch(actions.fetchTransactionsRequest());
  
  const userId = auth.currentUser?.uid;
  if (!userId) {
    dispatch(actions.fetchTransactionsError('User not authenticated'));
    return () => {};
  }

  const q = query(routes.getTransactionsCollection(), where('userId', '==', userId));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const transactions = [];
    snapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    dispatch(actions.fetchTransactionsSuccess(transactions));
  }, (error) => {
    const handledError = handleFirestoreError(error, 'list', 'transactions');
    dispatch(actions.fetchTransactionsError(handledError.message));
  });

  return unsubscribe;
};

export const addTransaction = (transactionData) => async (dispatch) => {
  dispatch(actions.addTransactionRequest());
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
    
    // Success is handled by onSnapshot subscription
  } catch (error) {
    const handledError = handleFirestoreError(error, 'create', 'transactions');
    dispatch(actions.addTransactionError(handledError.message));
  }
};

export const updateTransaction = (id, transactionData) => async (dispatch) => {
  dispatch(actions.updateTransactionRequest());
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    await setDoc(routes.getTransactionDoc(id), { ...transactionData, userId }, { merge: true });
    // Success is handled by onSnapshot subscription
  } catch (error) {
    const handledError = handleFirestoreError(error, 'update', `transactions/${id}`);
    dispatch(actions.updateTransactionError(handledError.message));
  }
};

export const deleteTransaction = (id) => async (dispatch) => {
  dispatch(actions.deleteTransactionRequest());
  try {
    await deleteDoc(routes.getTransactionDoc(id));
    // Success is handled by onSnapshot subscription
  } catch (error) {
    const handledError = handleFirestoreError(error, 'delete', `transactions/${id}`);
    dispatch(actions.deleteTransactionError(handledError.message));
  }
};
