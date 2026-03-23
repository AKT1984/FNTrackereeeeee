import { collection, doc } from 'firebase/firestore';
import { db } from '../../../firebase';

export const getUsersCollection = () => collection(db, 'users');
export const getUserDoc = (userId) => doc(db, 'users', userId);
