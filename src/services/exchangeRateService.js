export const fetchExchangeRate = async (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1;
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
    const data = await response.json();
    if (data && data.rates && data.rates[toCurrency]) {
      return data.rates[toCurrency];
    }
    throw new Error('Rate not found');
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
};
