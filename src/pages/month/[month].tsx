import { doc } from 'firebase/firestore';
import { db } from '../../utils/firebase/clientApp';
import { IMonths } from '../../model/IMonth';
import AppContainer from '../../components/Container/AppContainer';
import Mobile from '../../components/Pages/Month/Mobile';
import Desktop from '../../components/Pages/Month/Desktop';
import { theme } from '../../styles/theme/muiTheme';
import { useMediaQuery } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useMemo } from 'react';
import {
  IAddExpenseForm,
  IModalForm,
  IEditMonthForm,
} from '@/model/IModalForm';
import {
  IAddExpenseModalFormYupSchema,
  IEditExpenseModalFormYupSchema,
} from '@/model/IYupSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { categoryList } from '@/model/ICategory';
import { purposeList } from '@/model/IPurpose';
import { statusList } from '@/model/IStatus';
import {
  createOrUpdateExpense,
  updateExistingExpense,
} from '@/utils/functions/createOrUpdateExpense';
import { useDocument } from 'react-firebase-hooks/firestore';
import { IExpenses, IExpense } from '@/model/IExpenses';
import { convertToTimestamp } from '@/utils/functions/convertToTimestamp';
import { SEO } from '../../components/SEO';

const Month = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const slug = router.query.month?.toString();
  const userId = session?.userId;
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Fetch months data
  const [monthsSnapshot] = useDocument(doc(db, 'months', `${session?.userId}`));
  const months: IMonths = monthsSnapshot?.data()?.months;
  const currentMonth = months?.find((month) => month.slug === slug);

  // Fetch expense data
  const [expensesSnapshot] = useDocument(
    doc(db, 'expenses', `${session?.userId}`)
  );
  const expenses: IExpenses = expensesSnapshot?.data()?.expenses || [];

  const currentMonthExpenses = expenses
    .filter(
      ({ monthDetails }) =>
        monthDetails.year === currentMonth?.year &&
        monthDetails.monthName === currentMonth?.monthName
    )
    .sort(
      (a, b) =>
        // Sort expenses by createdAt in descending order
        convertToTimestamp(b.createdAt) - convertToTimestamp(a.createdAt)
    );

  // Filter expenses based on active filter
  const filteredExpenses = useMemo(() => {
    if (activeFilter === 'all') {
      return currentMonthExpenses;
    }
    // Status
    if (statusList.includes(activeFilter)) {
      return currentMonthExpenses.filter(
        (expense) => expense.status === activeFilter
      );
    }
    // Category
    if (categoryList.includes(activeFilter)) {
      return currentMonthExpenses.filter(
        (expense) => expense.category === activeFilter
      );
    }
    return currentMonthExpenses;
  }, [currentMonthExpenses, activeFilter]);

  // Generate status filters
  const statusFilters = useMemo(() => {
    return statusList.map((status) => ({
      id: status,
      label: status,
      activated: activeFilter === status,
    }));
  }, [activeFilter]);

  const expensesTotal = currentMonthExpenses.reduce(
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

  const handleChipClick = (chipId: string) => {
    setActiveFilter(chipId);
  };

  const submitFormContentHandler: SubmitHandler<IAddExpenseForm> = (
    data: IAddExpenseForm
  ) => {
    try {
      if (data && userId && currentMonth) {
        createOrUpdateExpense(data, userId, currentMonth);
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
      if (data && userId && currentMonth) {
        updateExistingExpense(data, userId);
        handleEditClose();
      } else {
        return;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating Expense data:', error);
    }
  };

  // Render nothing if month is undefined
  if (!currentMonth) {
    return null;
  }

  return (
    <>
      <SEO
        title={`${currentMonth?.monthName} ${currentMonth?.year} - Preallo`}
        description="Manage your personal finances with Preallo's intuitive dashboard. Track expenses, set budgets, and achieve your financial goals with real-time insights."
        noIndex={true}
        canonical={`/month/${currentMonth?.slug}`}
      />

      <AppContainer disableTopPadding={!isDesktop}>
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
            currentMonthExpenses={filteredExpenses}
            expensesTotal={expensesTotal}
            daysUntilPayday={25}
            handleSubmit={handleSubmit}
            editHandleSubmit={editHandleSubmit}
            submitFormContentHandler={submitFormContentHandler}
            submitEditFormContentHandler={submitEditFormContentHandler}
            errors={errors}
            editErrors={editErrors}
            month={currentMonth}
            onChipClick={handleChipClick}
            activeFilter={activeFilter}
            statusFilters={statusFilters}
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
            currentMonthExpenses={filteredExpenses}
            expensesTotal={expensesTotal}
            daysUntilPayday={25}
            handleSubmit={handleSubmit}
            editHandleSubmit={editHandleSubmit}
            submitFormContentHandler={submitFormContentHandler}
            submitEditFormContentHandler={submitEditFormContentHandler}
            errors={errors}
            editErrors={editErrors}
            month={currentMonth}
            onChipClick={handleChipClick}
            activeFilter={activeFilter}
            statusFilters={statusFilters}
          />
        )}
      </AppContainer>
    </>
  );
};

export default Month;
