import { onSnapshot, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth } from '../../../firebase';
import * as routes from './routes';
import {
  fetchSubscriptionsRequest,
  fetchSubscriptionsSuccess,
  fetchSubscriptionsError,
  addSubscriptionRequest,
  addSubscriptionError,
  updateSubscriptionRequest,
  updateSubscriptionError,
  deleteSubscriptionRequest,
  deleteSubscriptionError,
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

let unsubscribeSubscriptions: (() => void) | null = null;

export const subscribeToSubscriptions = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const { user } = getState().auth;
  if (!user) return;

  dispatch(fetchSubscriptionsRequest());

  const q = query(
    routes.getSubscriptionsCollection(),
    where('userId', '==', user.uid)
  );

  unsubscribeSubscriptions = onSnapshot(q, (snapshot) => {
    const subscriptions: any[] = [];
    snapshot.forEach((doc) => {
      subscriptions.push({ id: doc.id, ...doc.data() });
    });
    dispatch(fetchSubscriptionsSuccess(subscriptions));
  }, (error) => {
    const handledError = handleFirestoreError(error, 'list', 'subscriptions');
    dispatch(fetchSubscriptionsError(handledError.message));
  });
};

export const unsubscribeFromSubscriptions = () => () => {
  if (unsubscribeSubscriptions) {
    unsubscribeSubscriptions();
    unsubscribeSubscriptions = null;
  }
};

export const addSubscription = (subscriptionData: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const { user } = getState().auth;
  if (!user) return;

  dispatch(addSubscriptionRequest());
  try {
    await addDoc(routes.getSubscriptionsCollection(), {
      ...subscriptionData,
      userId: user.uid,
    });
  } catch (error) {
    const handledError = handleFirestoreError(error, 'create', 'subscriptions');
    dispatch(addSubscriptionError(handledError.message));
  }
};

export const updateSubscription = (id: string, subscriptionData: any) => async (dispatch: AppDispatch) => {
  dispatch(updateSubscriptionRequest());
  try {
    const docRef = routes.getSubscriptionDoc(id);
    await updateDoc(docRef, subscriptionData);
  } catch (error) {
    const handledError = handleFirestoreError(error, 'update', `subscriptions/${id}`);
    dispatch(updateSubscriptionError(handledError.message));
  }
};

export const deleteSubscription = (id: string) => async (dispatch: AppDispatch) => {
  dispatch(deleteSubscriptionRequest());
  try {
    const docRef = routes.getSubscriptionDoc(id);
    await deleteDoc(docRef);
  } catch (error) {
    const handledError = handleFirestoreError(error, 'delete', `subscriptions/${id}`);
    dispatch(deleteSubscriptionError(handledError.message));
  }
};
