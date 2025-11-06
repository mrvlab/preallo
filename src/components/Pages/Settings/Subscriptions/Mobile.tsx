import React from 'react';
import { AddRow } from '@/components/AddRow/AddRow';
import AppContainer from '@/components/Container/AppContainer';
import { MobileNavigation } from '@/components/Navigation/MobileNavigation/MobileNavigation';
import { TabBar } from '@/components/TabBar/TabBar';
import { TotalDisplay } from '@/components/TotalDisplay/TotalDisplay';
import { ISubscriptions } from '@/model/ISubscriptions';
import { settingsTabBarList } from '@/utils/functions/settingsTabBarList';
import Dialog from '@mui/material/Dialog';
import FormContent from '../../Month/FormContent';
import EditExpense from '../../Month/EditExpense';
import SettingsExpenseDisplay from '@/components/Expense/SettingsExpenseDisplay';
import { styled } from '@mui/material/styles';

const StyledTotalDisplay = styled(TotalDisplay)(({ theme }) => ({
  padding: theme.spacing(4, 0),
}));

const Mobile = ({
  open,
  editOpen,
  selectedExpense,
  handleOpen,
  handleClose,
  handleEditOpen,
  handleEditClose,
  handleSubmit,
  editHandleSubmit,
  register,
  editRegister,
  editControl,
  errors,
  editErrors,
  submitFormContentHandler,
  submitEditFormContentHandler,
  categoryList,
  purposeList,
  statusList,
  subscriptions,
  expensesTotal,
}: ISubscriptions) => {
  return (
    <AppContainer>
      <MobileNavigation hideProfile showSignOutButton title='Settings' />

      <TabBar tabList={settingsTabBarList} />

      <StyledTotalDisplay total={expensesTotal} sx={{ marginTop: 'unset' }} />

      <div>
        <AddRow
          title='Expense'
          version='secondary'
          addIsVisible
          onClick={() => handleOpen()}
        />

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

        <EditExpense
          open={editOpen}
          handleClose={handleEditClose}
          handleSubmit={editHandleSubmit}
          register={editRegister}
          errors={editErrors}
          submitFormContentHandler={submitEditFormContentHandler}
          categoryList={categoryList}
          purposeList={purposeList}
          statusList={statusList}
          expenseUuid={selectedExpense?.uuid || ''}
          defaultAmount={selectedExpense?.amount}
          defaultExpense={selectedExpense?.expense}
          defaultCategory={selectedExpense?.category}
          defaultPurpose={selectedExpense?.purpose}
          defaultStatus={selectedExpense?.status}
          control={editControl}
        />
      </div>

      <SettingsExpenseDisplay
        expenses={subscriptions}
        onExpenseClick={handleEditOpen}
      />
    </AppContainer>
  );
};

export default Mobile;
