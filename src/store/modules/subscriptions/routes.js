import { collection, doc } from 'firebase/firestore';
import { db } from '../../../firebase';

export const getSubscriptionsCollection = () => collection(db, 'subscriptions');
export const getSubscriptionDoc = (id) => doc(db, 'subscriptions', id);
