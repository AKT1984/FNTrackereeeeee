import { collection, doc } from 'firebase/firestore';
import { db } from '../../../firebase';

export const getCategoriesCollection = () => collection(db, 'categories');
export const getCategoryDoc = (id) => doc(db, 'categories', id);
