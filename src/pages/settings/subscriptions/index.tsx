import React, { useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { theme } from '../../../styles/theme/muiTheme';
import Mobile from '../../../components/Pages/Settings/Subscriptions/Mobile';
import Desktop from '../../../components/Pages/Settings/Subscriptions/Desktop';
import { useSession } from 'next-auth/react';
import {
  IModalForm,
  IAddExpenseForm,
  IEditMonthForm,
} from '@/model/IModalForm';
import {
  IAddExpenseModalFormYupSchema,
  IEditExpenseModalFormYupSchema,
} from '@/model/IYupSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, SubmitHandler } from 'react-hook-form';
import { purposeList } from '@/model/IPurpose';
import { categoryList } from '@/model/ICategory';
import { statusList } from '@/model/IStatus';
import {
  createOrUpdateSubscriptions,
  updateExistingSubscription,
} from '@/utils/functions/createOrUpdateSubscriptions';
import { IExpenses, IExpense } from '@/model/IExpenses';
import { db } from '@/utils/firebase/clientApp';
import { convertToTimestamp } from '@/utils/functions/convertToTimestamp';
import { doc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import { SEO } from '../../../components/SEO';

const Subscriptions = () => {
  const { data: session } = useSession();
  const userId = session?.userId;

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);

  // Fetch expense data
  const [expensesSnapshot] = useDocument(
    doc(db, 'subscriptions', `${session?.userId}`)
  );
  const subscriptions: IExpenses = expensesSnapshot?.data()?.subscriptions
    ? [...(expensesSnapshot.data()?.subscriptions || [])].sort(
        (a, b) =>
          convertToTimestamp(b.createdAt) - convertToTimestamp(a.createdAt)
      )
    : [];

  const expensesTotal = subscriptions.reduce(
    (total, { amount }) => total + amount,
    0
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IModalForm>({
    resolver: yupResolver(IAddExpenseModalFormYupSchema),
    defaultValues: {
      selectedThree: 'Pending',
    },
  });

  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    formState: { errors: editErrors },
    reset,
    control: editControl,
  } = useForm<IEditMonthForm>({
    resolver: yupResolver(IEditExpenseModalFormYupSchema),
  });

  const isDesktop = useMediaQuery(
    `${theme.breakpoints.up('md').replace('@media ', '')}`
  );

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleEditOpen = (expense: IExpense) => {
    console.log('expense', expense);
    setSelectedExpense(expense);
    // Pre-fill the form with existing expense data
    reset({
      amount: expense.amount,
      expense: expense.expense,
      selected: expense.category,
      selectedTwo: expense.purpose,
      selectedThree: expense.status,
      uuid: expense.uuid,
    });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedExpense(null);
  };

  const submitFormContentHandler: SubmitHandler<IAddExpenseForm> = (
    data: IAddExpenseForm
  ) => {
    try {
      if (data && userId) {
        createOrUpdateSubscriptions(data, userId);
        handleClose();
      } else {
        return;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting Expense data:', error);
    }
  };

  const submitEditFormContentHandler: SubmitHandler<IEditMonthForm> = (
    data: IEditMonthForm
  ) => {
    try {
      if (data && userId) {
        updateExistingSubscription(data, userId);
        handleEditClose();
      } else {
        return;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating Expense data:', error);
    }
  };

  console.log('subscriptions', subscriptions);
  console.log('expensesTotal', expensesTotal);
  return (
    <>
      <SEO
        title='Subscriptions - Preallo'
        description='Track and manage your monthly subscriptions with Preallo. Monitor recurring payments, categorize expenses, and optimize your subscription spending.'
        canonical='/settings/subscriptions'
        noIndex={true}
      />

      {!isDesktop && (
        <Mobile
          session={session}
          open={open}
          editOpen={editOpen}
          selectedExpense={selectedExpense}
          handleOpen={handleOpen}
          handleClose={handleClose}
          handleEditOpen={handleEditOpen}
          handleEditClose={handleEditClose}
          register={register}
          editRegister={editRegister}
          editControl={editControl}
          categoryList={categoryList}
          purposeList={purposeList}
          statusList={statusList}
          subscriptions={subscriptions}
          expensesTotal={expensesTotal}
          handleSubmit={handleSubmit}
          editHandleSubmit={editHandleSubmit}
          submitFormContentHandler={submitFormContentHandler}
          submitEditFormContentHandler={submitEditFormContentHandler}
          errors={errors}
          editErrors={editErrors}
        />
      )}

      {isDesktop && (
        <Desktop
          session={session}
          open={open}
          editOpen={editOpen}
          selectedExpense={selectedExpense}
          handleOpen={handleOpen}
          handleClose={handleClose}
          handleEditOpen={handleEditOpen}
          handleEditClose={handleEditClose}
          register={register}
          editRegister={editRegister}
          editControl={editControl}
          categoryList={categoryList}
          purposeList={purposeList}
          statusList={statusList}
          subscriptions={subscriptions}
          expensesTotal={expensesTotal}
          handleSubmit={handleSubmit}
          editHandleSubmit={editHandleSubmit}
          submitFormContentHandler={submitFormContentHandler}
          submitEditFormContentHandler={submitEditFormContentHandler}
          errors={errors}
          editErrors={editErrors}
        />
      )}
    </>
  );
};

export default Subscriptions;
