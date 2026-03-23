import { createSelector } from 'reselect';

export const selectTransactionsState = (state) => state.transactions;

export const selectTransactions = createSelector(
  [selectTransactionsState],
  (transactionsState) => transactionsState.transactions || []
);

export const selectTotalBudget = createSelector(
  [selectTransactions],
  (transactions) => transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
);

export const selectTotalExpenses = createSelector(
  [selectTransactions],
  (transactions) => transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
);

export const selectTotalBalance = createSelector(
  [selectTotalBudget, selectTotalExpenses],
  (budget, expenses) => budget - expenses
);
