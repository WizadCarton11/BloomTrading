// useStockSubscription.ts
import { useContext, useEffect } from 'react';
import { StockContext } from '../context/StockSocketProvider';

export const useStockSubscription = (symbols: string[]) => {
  const context = useContext(StockContext);
  if (!context) throw new Error('Must use inside StockSocketProvider');

  const { getStockData, subscribeSymbols, unsubscribeSymbols } = context;

  useEffect(() => {
    subscribeSymbols(symbols);
    return () => {
      unsubscribeSymbols(symbols);
    };
  }, [symbols.join(',')]);

  return symbols.map(symbol => ({
    symbol,
    data: getStockData(symbol),
  }));
};
