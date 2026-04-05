import { collection, doc } from 'firebase/firestore';
import { db } from '../../../firebase';

export const getAccountsCollection = () => collection(db, 'accounts');
export const getAccountDoc = (id) => doc(db, 'accounts', id);
