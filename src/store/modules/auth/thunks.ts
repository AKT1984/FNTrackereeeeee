import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../../firebase';
import {
  loginRequest,
  loginSuccess,
  loginError,
  logoutRequest,
  logoutSuccess,
  logoutError,
  authStateChanged,
  updateCurrencySuccess,
} from './slice';
import * as routes from './routes';
import { AppDispatch, RootState } from '../../index';

const provider = new GoogleAuthProvider();

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

export const initAuthListener = () => (dispatch: AppDispatch) => {
  getRedirectResult(auth).catch((error) => {
    console.error("Redirect login error:", error);
    if (error.code === 'auth/unauthorized-domain') {
      const domain = window.location.hostname;
      const msg = `Domain '${domain}' is not authorized. Please go to Firebase Console -> Authentication -> Settings -> Authorized domains and add '${domain}'. Alternatively, access the app via 'localhost' instead of '127.0.0.1'.`;
      dispatch(loginError(msg));
    } else if (error.message?.includes('missing initial state')) {
      dispatch(loginError("Login failed due to browser privacy settings blocking third-party cookies. Please use 'localhost' instead of '127.0.0.1' or enable third-party cookies."));
    } else {
      dispatch(loginError(error.message));
    }
  });

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      let currency = 'USD';
      try {
        const userDocRef = routes.getUserDoc(user.uid);
        let userDoc;
        try {
          userDoc = await getDoc(userDocRef);
        } catch (e) {
          handleFirestoreError(e, 'get', `users/${user.uid}`);
          throw e;
        }
        
        if (!userDoc.exists()) {
          try {
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              currency: 'USD',
              createdAt: serverTimestamp(),
            });
          } catch (e) {
            handleFirestoreError(e, 'create', `users/${user.uid}`);
            throw e;
          }
        } else {
          currency = userDoc.data()?.currency || 'USD';
        }
      } catch (error) {
        // Error is already handled and logged
      }
      
      dispatch(authStateChanged({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        currency,
      }));
    } else {
      dispatch(authStateChanged(null));
    }
  });
};

export const loginWithGoogle = () => async (dispatch: AppDispatch) => {
  dispatch(loginRequest());
  try {
    const result = await signInWithPopup(auth, provider);
    
    let currency = 'USD';
    try {
      const userDocRef = routes.getUserDoc(result.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        currency = userDoc.data()?.currency || 'USD';
      }
    } catch (e) {
      console.error("Error fetching user doc on login", e);
    }

    dispatch(loginSuccess({
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      currency,
    }));
  } catch (error: any) {
    console.error("Login error:", error);
    
    if (error.code === 'auth/unauthorized-domain') {
      const domain = window.location.hostname;
      const msg = `Domain '${domain}' is not authorized. Please go to Firebase Console -> Authentication -> Settings -> Authorized domains and add '${domain}'. Alternatively, access the app via 'localhost' instead of '127.0.0.1'.`;
      dispatch(loginError(msg));
      return;
    }

    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' || 
      error.code === 'auth/cross-origin-opener-policy-failed' ||
      error.message?.includes('Cross-Origin-Opener-Policy')
    ) {
      console.log("Popup failed, falling back to redirect...");
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError: any) {
        if (redirectError.code === 'auth/unauthorized-domain') {
          const domain = window.location.hostname;
          const msg = `Domain '${domain}' is not authorized. Please go to Firebase Console -> Authentication -> Settings -> Authorized domains and add '${domain}'.`;
          dispatch(loginError(msg));
        } else {
          dispatch(loginError(redirectError.message));
        }
      }
    } else {
      dispatch(loginError(error.message));
    }
  }
};

export const logoutUser = () => async (dispatch: AppDispatch) => {
  dispatch(logoutRequest());
  try {
    await signOut(auth);
    dispatch(logoutSuccess());
  } catch (error: any) {
    dispatch(logoutError(error.message));
  }
};

export const updateCurrency = (currency: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const { user } = getState().auth;
  if (!user) return;

  try {
    const userDocRef = routes.getUserDoc(user.uid);
    await updateDoc(userDocRef, { currency });
    dispatch(updateCurrencySuccess(currency));
  } catch (error) {
    handleFirestoreError(error, 'update', `users/${user.uid}`);
  }
};
