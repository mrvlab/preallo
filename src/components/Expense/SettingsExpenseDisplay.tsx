import { Expense } from '@/components/Expense/Expense';
import { IExpenses as ExpenseList } from '@/model/IExpenses';
import { NoContentContainer } from '@/pages';
import { Typography, styled } from '@mui/material';
import React from 'react';
import { IExpense } from '@/model/IExpenses';

export type IExpenses = {
  expenses: ExpenseList;
  // eslint-disable-next-line no-unused-vars
  onExpenseClick?: (expense: IExpense) => void;
};

const StyledSettingsExpenseDisplay = styled('div')(({ theme }) => ({
  height: '100%',
  overflow: 'scroll',
  position: 'relative',
  padding: 'unset',
  marginTop: `${theme.spacing(3)}  `,
  marginBottom: `${theme.spacing(0)} !important `,

  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    height: theme.spacing(2),
    zIndex: 1,
    pointerEvents: 'none',
  },

  '&::before': {
    top: 0,
    mask: 'linear-gradient(to bottom, #F7F6F8, transparent)',
    backdropFilter: 'blur(2px)',
  },
  '&::after': {
    bottom: 0,
    mask: 'linear-gradient(to top, #F7F6F8, transparent)',
    backdropFilter: 'blur(8px)',
  },

  [theme.breakpoints.up('sm')]: {},
}));

const Scroll = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'scroll',
  padding: theme.spacing(2, 3),
  paddingTop: 'unset',

  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2, 6),
  },

  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
}));

const SettingsExpenseDisplay = ({ expenses, onExpenseClick }: IExpenses) => {
  return (
    <StyledSettingsExpenseDisplay>
      <Scroll>
        {expenses?.length > 0 ? (
          expenses.map((expense) => (
            <Expense
              key={expense.uuid}
              amount={expense.amount}
              date={expense.createdAt}
              title={expense.expense}
              category={expense.category}
              amountAsString={expense.amountAsString}
              purpose={expense.purpose}
              status={expense.status}
              fullWidth
              stripped
              bgColor='transparent'
              onClick={() => onExpenseClick?.(expense)}
            />
          ))
        ) : (
          <NoContentContainer>
            <Typography>Press the add button to get started</Typography>
          </NoContentContainer>
        )}
      </Scroll>
    </StyledSettingsExpenseDisplay>
  );
};

export default SettingsExpenseDisplay;
