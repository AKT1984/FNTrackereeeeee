import { collection, doc } from 'firebase/firestore';
import { db } from '../../../firebase';

export const getTransactionsCollection = () => collection(db, 'transactions');
export const getTransactionDoc = (id) => doc(db, 'transactions', id);
