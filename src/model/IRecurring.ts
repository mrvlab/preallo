import {
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
  FieldErrors,
  Control,
} from 'react-hook-form';
import { IAddExpenseForm, IEditMonthForm } from './IModalForm';
import { Session } from 'next-auth/core/types';
import { IRecurringFormContent } from './IRecurringFormContent';
import { IExpenses, IExpense } from './IExpenses';

export type IRecurring = IRecurringFormContent & {
  session: Session | null;
  open: boolean;
  editOpen: boolean;
  selectedExpense: IExpense | null;
  handleOpen: () => void;
  handleClose: () => void;
  // eslint-disable-next-line no-unused-vars
  handleEditOpen: (expense: IExpense) => void;
  handleEditClose: () => void;
  handleSubmit: UseFormHandleSubmit<IAddExpenseForm>;
  editHandleSubmit: UseFormHandleSubmit<IEditMonthForm>;
  submitFormContentHandler: SubmitHandler<IAddExpenseForm>;
  submitEditFormContentHandler: SubmitHandler<IEditMonthForm>;
  register: UseFormRegister<IAddExpenseForm>;
  editRegister: UseFormRegister<IEditMonthForm>;
  editControl: Control<IEditMonthForm>;
  errors: FieldErrors<IAddExpenseForm>;
  editErrors: FieldErrors<IEditMonthForm>;
  recurringExpenses: IExpenses;
  expensesTotal: number;
};
