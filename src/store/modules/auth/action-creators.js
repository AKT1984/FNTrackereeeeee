import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  // Check for redirect result first to catch any errors from signInWithRedirect
  getRedirectResult(auth).catch((error) => {
    console.error("Redirect login error:", error);
    dispatch(actions.loginError(error.message));
  });

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      let currency = 'USD';
      try {
        // Ensure user document exists in Firestore
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
              currency: 'USD', // Default currency
              createdAt: serverTimestamp(),
            });
          } catch (e) {
            handleFirestoreError(e, 'create', `users/${user.uid}`);
            throw e;
          }
        } else {
          currency = userDoc.data().currency || 'USD';
        }
      } catch (error) {
        // Error is already handled and logged
      }
      
      dispatch(actions.authStateChanged({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        currency,
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
    
    let currency = 'USD';
    try {
      const userDocRef = routes.getUserDoc(result.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        currency = userDoc.data().currency || 'USD';
      }
    } catch (e) {
      console.error("Error fetching user doc on login", e);
    }

    dispatch(actions.loginSuccess({
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      currency,
    }));
  } catch (error) {
    console.error("Login error:", error);
    // If popup is blocked or closed, fallback to redirect
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' || 
      error.code === 'auth/cross-origin-opener-policy-failed' ||
      error.message?.includes('Cross-Origin-Opener-Policy')
    ) {
      console.log("Popup failed, falling back to redirect...");
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError) {
        dispatch(actions.loginError(redirectError.message));
      }
    } else {
      dispatch(actions.loginError(error.message));
    }
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

export const updateCurrency = (currency) => async (dispatch, getState) => {
  const { user } = getState().auth;
  if (!user) return;

  try {
    const userDocRef = routes.getUserDoc(user.uid);
    await updateDoc(userDocRef, { currency });
    dispatch(actions.updateCurrencySuccess(currency));
  } catch (error) {
    handleFirestoreError(error, 'update', `users/${user.uid}`);
  }
};
