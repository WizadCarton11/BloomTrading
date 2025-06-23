import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the types for our trading context
interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface WatchlistItem {
  id: string;
  name: string;
  stocks: Stock[];
}

interface TradeHistory {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: Date;
}

interface TradingContextState {
  watchlists: WatchlistItem[];
  addWatchlist: (name: string) => void;
  removeWatchlist: (id: string) => void;
  addStockToWatchlist: (watchlistId: string, stock: Stock) => void;
  removeStockFromWatchlist: (watchlistId: string, symbol: string) => void;
  
  tradeHistory: TradeHistory[];
  addTradeRecord: (trade: Omit<TradeHistory, 'id' | 'date'>) => void;
  
  selectedStock: Stock | null;
  setSelectedStock: (stock: Stock | null) => void;
}

// Create the context
const TradingContext = createContext<TradingContextState | undefined>(undefined);

interface TradingProviderProps {
  children: ReactNode;
}

export const TradingProvider: React.FC<TradingProviderProps> = ({ children }) => {
  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([
    {
      id: '1',
      name: 'My Watchlist',
      stocks: [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.23, changePercent: 0.67 },
        { symbol: 'MSFT', name: 'Microsoft Corporation', price: 420.55, change: 2.15, changePercent: 0.51 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 176.38, change: -0.42, changePercent: -0.24 },
      ]
    }
  ]);
  
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([
    {
      id: '1',
      symbol: 'AAPL',
      type: 'buy',
      quantity: 10,
      price: 180.00,
      date: new Date('2025-06-10T10:30:00')
    },
    {
      id: '2',
      symbol: 'MSFT',
      type: 'buy',
      quantity: 5,
      price: 415.25,
      date: new Date('2025-06-15T14:20:00')
    }
  ]);
  
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  
  // Functions to modify state
  const addWatchlist = (name: string) => {
    const newWatchlist: WatchlistItem = {
      id: Date.now().toString(),
      name,
      stocks: []
    };
    setWatchlists(prev => [...prev, newWatchlist]);
  };
  
  const removeWatchlist = (id: string) => {
    setWatchlists(prev => prev.filter(watchlist => watchlist.id !== id));
  };
  
  const addStockToWatchlist = (watchlistId: string, stock: Stock) => {
    setWatchlists(prev => prev.map(watchlist => {
      if (watchlist.id === watchlistId) {
        // Check if stock already exists
        const stockExists = watchlist.stocks.some(s => s.symbol === stock.symbol);
        if (!stockExists) {
          return {
            ...watchlist,
            stocks: [...watchlist.stocks, stock]
          };
        }
      }
      return watchlist;
    }));
  };
  
  const removeStockFromWatchlist = (watchlistId: string, symbol: string) => {
    setWatchlists(prev => prev.map(watchlist => {
      if (watchlist.id === watchlistId) {
        return {
          ...watchlist,
          stocks: watchlist.stocks.filter(stock => stock.symbol !== symbol)
        };
      }
      return watchlist;
    }));
  };
  
  const addTradeRecord = (trade: Omit<TradeHistory, 'id' | 'date'>) => {
    const newTrade: TradeHistory = {
      id: Date.now().toString(),
      date: new Date(),
      ...trade
    };
    setTradeHistory(prev => [...prev, newTrade]);
  };
  
  const value = {
    watchlists,
    addWatchlist,
    removeWatchlist,
    addStockToWatchlist,
    removeStockFromWatchlist,
    tradeHistory,
    addTradeRecord,
    selectedStock,
    setSelectedStock
  };
  
  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
};

// Custom hook to use the trading context
export const useTradingContext = (): TradingContextState => {
  const context = useContext(TradingContext);
  
  if (context === undefined) {
    throw new Error('useTradingContext must be used within a TradingProvider');
  }
  
  return context;
};
