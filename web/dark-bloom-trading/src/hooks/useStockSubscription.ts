// useStockSubscription.ts
import { useContext, useEffect } from 'react';
import { StockContext } from '../context/StockSocketProvider';

export const useStockSubscription = (symbols: string[]) => {
  const context = useContext(StockContext);
  if (!context) throw new Error('Must use inside StockSocketProvider');
  if (!symbols || symbols.length === 0) {
    return [];
  }
  const { getStockData, subscribeSymbols, unsubscribeSymbols } = context;
  
  useEffect(() => {
    console.log("useStockSubscription", symbols);
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

export const useStockSubscriptionWithMap = (symbols: string[]) => {
  const context = useContext(StockContext);
  if (!context) throw new Error('Must use inside StockSocketProvider');
  if (!symbols || symbols.length === 0) {
    return [];
  }
  const { getStockData, subscribeSymbols, unsubscribeSymbols } = context;
  
  useEffect(() => {
    console.log("useStockSubscription", symbols);
    subscribeSymbols(symbols);
    return () => {
      unsubscribeSymbols(symbols);
    };
  }, [symbols.join(',')]);
  const stockMap= new Map<string, any>();
  symbols.forEach(symbol => {
    stockMap.set(symbol, {
      symbol,
      data: getStockData(symbol),
    });
  });
  return stockMap;
};

export const useSingleStockSubscription = (symbol: string) => {
  const context = useContext(StockContext);
  if (!context) throw new Error('Must use inside StockSocketProvider');

  const { getStockData, subscribeSymbols, unsubscribeSymbols } = context;

  useEffect(() => {
    subscribeSymbols([symbol]);
    return () => {
      unsubscribeSymbols([symbol]);
    };
  }, [symbol]);

  return {
    symbol,
    data: getStockData(symbol),
  };
}
