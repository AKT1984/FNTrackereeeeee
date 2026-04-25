import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

export const useExchangeRates = () => {
  const user = useSelector(state => state.auth.user);
  const baseCurrency = user?.currency || 'USD';
  const [rates, setRates] = useState({ [baseCurrency]: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchRates = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
        const data = await response.json();
        if (isMounted && data && data.rates) {
          setRates(data.rates);
        }
      } catch (error) {
        console.error('Error fetching rates in hook:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRates();

    return () => {
      isMounted = false;
    };
  }, [baseCurrency]);

  const convertAmountToUserCurrency = useCallback((amount, currency) => {
    if (!amount || isNaN(amount)) return 0;
    if (currency === baseCurrency) return Number(amount);
    if (!rates[currency]) {
      return Number(amount);
    }
    return Number(amount) / rates[currency];
  }, [baseCurrency, rates]);

  return { rates, loading, baseCurrency, convertAmountToUserCurrency };
};
