import React, { useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { theme } from '../../../styles/theme/muiTheme';
import Mobile from '../../../components/Pages/Settings/Recurring/Mobile';
import Desktop from '../../../components/Pages/Settings/Recurring/Desktop';
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
import { IExpenses, IExpense } from '@/model/IExpenses';
import { db } from '@/utils/firebase/clientApp';
import { convertToTimestamp } from '@/utils/functions/convertToTimestamp';
import { doc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import {
  createOrUpdateRecurring,
  updateExistingRecurring,
} from '@/utils/functions/createOrUpdateRecurring';
import { SEO } from '../../../components/SEO';

const Recurring = () => {
  const { data: session } = useSession();
  const userId = session?.userId;

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);

  // Fetch expense data
  const [recurringExpensesSnapshot] = useDocument(
    doc(db, 'recurring', `${session?.userId}`)
  );
  const recurring: IExpenses = recurringExpensesSnapshot?.data()?.subscriptions
    ? [...(recurringExpensesSnapshot.data()?.subscriptions || [])].sort(
        (a, b) =>
          convertToTimestamp(b.createdAt) - convertToTimestamp(a.createdAt)
      )
    : [];

  const recurringExpensesTotal = recurring.reduce(
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
        createOrUpdateRecurring(data, userId);
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
        updateExistingRecurring(data, userId);
        handleEditClose();
      } else {
        return;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating Expense data:', error);
    }
  };

  return (
    <>
      <SEO
        title='Recurring Expenses - Preallo'
        description='Manage your recurring expenses and monthly subscriptions with Preallo. Track regular payments and maintain control over your ongoing financial commitments.'
        canonical='/settings/recurring'
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
          recurringExpenses={recurring}
          expensesTotal={recurringExpensesTotal}
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
          recurringExpenses={recurring}
          expensesTotal={recurringExpensesTotal}
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

export default Recurring;
