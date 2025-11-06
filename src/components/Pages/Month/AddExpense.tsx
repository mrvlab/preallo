import { AddRow } from '@/components/AddRow/AddRow';
import { IAddExpense } from '@/model/IAddExpense';

import { Dialog, styled } from '@mui/material';
import React from 'react';
import FormContent from './FormContent';

const StyledAddExpense = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(),

  [theme.breakpoints.up('sm')]: {},
}));

const AddExpense = ({
  open,
  handleOpen,
  handleClose,
  handleSubmit,
  register,
  errors,
  submitFormContentHandler,
  categoryList,
  purposeList,
  statusList,
  onChipClick,
  activeFilter,
  statusFilters,
}: IAddExpense) => {
  // Create chips list with status filters
  const chipsList = [
    {
      activated: activeFilter === 'all',
      id: 'all',
      label: 'All',
    },
    ...(statusFilters || []).map((filter) => ({
      activated: activeFilter === filter.id,
      id: filter.id,
      label: filter.label,
    })),
    ...(categoryList || []).map((category) => ({
      activated: activeFilter === category,
      id: category,
      label: category,
    })),
  ];

  return (
    <div>
      <StyledAddExpense>
        <AddRow
          title='Expense'
          version='secondary'
          chipsList={chipsList}
          addIsVisible
          filterIsVisible
          onClick={() => handleOpen()}
          onChipClick={onChipClick}
        />
      </StyledAddExpense>

      <Dialog
        onClose={() => handleClose()}
        open={open}
        maxWidth={'xs'}
        fullWidth
      >
        <form onSubmit={handleSubmit(submitFormContentHandler)}>
          <FormContent
            categoryList={categoryList}
            purposeList={purposeList}
            statusList={statusList}
            handleClose={handleClose}
            register={register}
            errors={errors}
          />
        </form>
      </Dialog>
    </div>
  );
};

export default AddExpense;
