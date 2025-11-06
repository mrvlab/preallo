import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { IAddExpenseForm, IEditMonthForm } from '../../model/IModalForm';
import { db } from '../firebase/clientApp';
import { IMonth } from '@/model/IMonth';
import { v4 as uuidv4 } from 'uuid';
import { formatDate } from './formatDate';
import { formatNumberWithDecimal } from './formatNumberWithDecimal';

export const createOrUpdateSubscriptions = async (
  data: IAddExpenseForm,
  userId: string,
  month?: IMonth
) => {
  const subscriptionsRef = doc(db, 'subscriptions', userId);
  const subscriptionsSnap = await getDoc(subscriptionsRef);

  const expenseProperties = {
    uuid: uuidv4(),
    createdAt: formatDate(),
    amount: data.amount,
    amountAsString: formatNumberWithDecimal(data.amount),
    expense: data.expense,
    category: data.selected,
    purpose: data.selectedTwo,
    status: data.selectedThree,
    monthDetails: {
      monthName: month?.monthName || '',
      year: month?.year || '',
      slug: month?.slug || '',
    },
  };

  try {
    if (subscriptionsSnap.exists()) {
      return updateDoc(subscriptionsRef, {
        subscriptions: arrayUnion({
          ...expenseProperties,
        }),
      });
    } else {
      return setDoc(subscriptionsRef, {
        subscriptions: [{ ...expenseProperties }],
      });
    }
  } catch (error) {
    alert(error);
  }
};

export const updateExistingSubscription = async (
  data: IEditMonthForm,
  userId: string
) => {
  const subscriptionsRef = doc(db, 'subscriptions', userId);
  const subscriptionsSnap = await getDoc(subscriptionsRef);

  if (!subscriptionsSnap.exists()) {
    throw new Error('No subscriptions found');
  }

  const subscriptions = subscriptionsSnap.data()?.subscriptions || [];
  const subscriptionIndex = subscriptions.findIndex(
    (subscription: any) => subscription.uuid === data.uuid
  );

  if (subscriptionIndex === -1) {
    throw new Error('Subscription not found');
  }

  const updatedSubscription = {
    ...subscriptions[subscriptionIndex],
    amount: data.amount,
    amountAsString: formatNumberWithDecimal(data.amount),
    expense: data.expense,
    category: data.selected,
    purpose: data.selectedTwo,
    status: data.selectedThree,
  };

  const updatedSubscriptions = [...subscriptions];
  updatedSubscriptions[subscriptionIndex] = updatedSubscription;

  try {
    return updateDoc(subscriptionsRef, {
      subscriptions: updatedSubscriptions,
    });
  } catch (error) {
    alert(error);
  }
};
