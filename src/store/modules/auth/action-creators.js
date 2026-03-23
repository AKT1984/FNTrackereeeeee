import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../../../firebase';
import * as actions from './actions';
import * as routes from './routes';

const provider = new GoogleAuthProvider();

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

export const initAuthListener = () => (dispatch) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Ensure user document exists in Firestore
        const userDocRef = routes.getUserDoc(user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            currency: 'USD', // Default currency
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, 'get', `users/${user.uid}`);
      }
      
      dispatch(actions.authStateChanged({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }));
    } else {
      dispatch(actions.authStateChanged(null));
    }
  });
};

export const loginWithGoogle = () => async (dispatch) => {
  dispatch(actions.loginRequest());
  try {
    const result = await signInWithPopup(auth, provider);
    dispatch(actions.loginSuccess({
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
    }));
  } catch (error) {
    dispatch(actions.loginError(error.message));
  }
};

export const logoutUser = () => async (dispatch) => {
  dispatch(actions.logoutRequest());
  try {
    await signOut(auth);
    dispatch(actions.logoutSuccess());
  } catch (error) {
    dispatch(actions.logoutError(error.message));
  }
};
