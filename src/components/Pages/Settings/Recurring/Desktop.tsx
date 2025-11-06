import React from 'react';
import AppContainer from '../../../Container/AppContainer';
import DesktopNavigation from '../../../Navigation/DesktopNavigation/DesktopNavigation';
import ContentContainer from '../../../Container/ContentContainer';
import { useRouter } from 'next/router';
import {
  Dialog,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import RightGridContentContainer from '../../../Container/RightGridContentContainer';
import { TabBar } from '@/components/TabBar/TabBar';
import { settingsTabBarList } from '@/utils/functions/settingsTabBarList';
import { IRecurring } from '@/model/IRecurring';
import { TotalDisplay } from '@/components/TotalDisplay/TotalDisplay';
import { AddRow } from '@/components/AddRow/AddRow';
import FormContent from '../../Month/FormContent';
import EditExpense from '../../Month/EditExpense';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { NoContentContainer } from '@/pages';

const RightContent = styled('div')(({ theme }) => ({
  gridColumn: '1/-1',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const TabBarWrapper = styled('div')(() => ({
  display: 'flex',
  height: '100%',
  maxHeight: '56px',
  alignItems: 'center',
}));

const StyledTotalDisplay = styled(TotalDisplay)(({ theme }) => ({
  padding: theme.spacing(4.5, 0),
}));

const TableWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100%',

  '.amount': {
    fontFamily: theme.typography.h6.fontFamily,
  },
}));

const Desktop = ({
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
  recurringExpenses,
  expensesTotal,
}: IRecurring) => {
  const router = useRouter();
  const currentPageSlugList = router.pathname.split('/').filter(Boolean);

  function createData(
    name: string,
    calories: number,
    fat: number,
    carbs: number,
    protein: number
  ) {
    return { name, calories, fat, carbs, protein };
  }

  const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
  ];

  return (
    <AppContainer>
      <>
        <DesktopNavigation highlightedValue={currentPageSlugList[0]} />
        <ContentContainer>
          <div className='titleContainer'>
            <Typography className='pageTitle'>Settings</Typography>
          </div>

          <RightGridContentContainer
            sx={{
              gridTemplateRows: 'unset !important',
            }}
          >
            <RightContent>
              <TabBarWrapper>
                <TabBar tabList={settingsTabBarList} />
              </TabBarWrapper>

              <StyledTotalDisplay total={expensesTotal} />

              <div>
                <AddRow
                  title=''
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

              <TableWrapper>
                {recurringExpenses?.length > 0 ? (
                  <TableContainer component={'div'}>
                    <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Expens</TableCell>
                          <TableCell align='right'>Status</TableCell>
                          <TableCell align='right'>Category</TableCell>
                          <TableCell align='right'>Date</TableCell>
                          <TableCell align='right'>Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recurringExpenses.map((expense) => (
                          <TableRow
                            key={expense.uuid}
                            onClick={() => handleEditOpen(expense)}
                            sx={{
                              '&:last-child td, &:last-child th': {
                                border: 0,
                              },
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                            }}
                          >
                            <TableCell component='th' scope='row'>
                              {expense.expense}
                            </TableCell>
                            <TableCell align='right'>
                              {expense.status && (
                                <StatusBadge status={expense.status} />
                              )}
                            </TableCell>
                            <TableCell align='right'>
                              {expense.category}
                            </TableCell>
                            <TableCell align='right'>
                              {expense.createdAt}
                            </TableCell>
                            <TableCell align='right' className='amount'>
                              {expense.amountAsString}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <NoContentContainer>
                    <Typography>Press the add button to get started</Typography>
                  </NoContentContainer>
                )}
              </TableWrapper>
            </RightContent>
          </RightGridContentContainer>
        </ContentContainer>
      </>
    </AppContainer>
  );
};

export default Desktop;
