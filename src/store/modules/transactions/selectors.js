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

export const selectBalancesByAccount = createSelector(
  [selectTransactions],
  (transactions) => {
    return transactions.reduce((acc, t) => {
      const accountId = t.accountId || 'default';
      if (!acc[accountId]) {
        acc[accountId] = 0;
      }
      const amount = Number(t.amount) || 0;
      if (t.type === 'INCOME') {
        acc[accountId] += amount;
      } else if (t.type === 'EXPENSE') {
        acc[accountId] -= amount;
      }
      return acc;
    }, {});
  }
);
