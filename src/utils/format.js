export const formatCurrency = (amount, symbol) => {
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount).toFixed(2);
  return `${isNegative ? '-' : ''}${symbol}${absoluteAmount}`;
};

export const getDateFromTimestamp = (t) => {
  if (!t) return new Date();
  if (t.toDate) return t.toDate();
  if (t.seconds) return new Date(t.seconds * 1000);
  return new Date(t);
};
