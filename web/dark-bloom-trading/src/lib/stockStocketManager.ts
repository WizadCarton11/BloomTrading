
// StockSocketProvider.tsx
import { io, Socket } from 'socket.io-client';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';

interface StockData {
  symbol: string;
  data: any;
}

type Listener = () => void;

const StockSocketManager=()=> {
  const socketRef = useRef<Socket | null>(null);
    const stockDataRef = useRef<Map<string, any>>(new Map());
    const subscribersRef = useRef<Set<string>>(new Set());
  
    const [, forceUpdate] = useState(0); // Manual UI trigger
  
    useEffect(() => {
      const socket = io('http://localhost:3003');
      socketRef.current = socket;
  
      socket.on('stock-update', ({ symbol, data }: StockData) => {
          // console.log(`📈 Received stock update for ${symbol}:`, data);
          const formattedData = {
              price: parseFloat(data.price).toFixed(3) ,
              change: parseFloat(data.change ?? 0),            
              changePercent: parseFloat(data.changePercent ?? 0),
              volume: data.volume ?? '—',
              index: data.index,
          };
          // console.log(symbol, formattedData);
          if (subscribersRef.current.has(symbol.trim())) {
            // console.log(`📊 Updating stock data for ${symbol}: ${formattedData.price}`);
              stockDataRef.current.set(symbol.trim(), formattedData);
              forceUpdate(prev => prev + 1); // Minimal re-renders
          }
      });
  
      return () => {
        socket.disconnect();
      };
    }, []);
  
    const subscribeSymbols = (symbols: string[]) => {
      const socket = socketRef.current;
      if (!socket) return;
  
      symbols.forEach(symbol => {
        if (!subscribersRef.current.has(symbol)) {
          socket.emit('subscribe', symbol);
          subscribersRef.current.add(symbol);
        }
      });
    };
  
    const unsubscribeSymbols = (symbols: string[]) => {
      const socket = socketRef.current;
      if (!socket) return;
  
      symbols.forEach(symbol => {
        if (subscribersRef.current.has(symbol)) {
          socket.emit('unsubscribe', symbol);
          subscribersRef.current.delete(symbol);
          stockDataRef.current.delete(symbol);
        }
      });
      forceUpdate(prev => prev + 1);
    };
  
    const getStockData = (symbol: string) => {
      // console.log(stockDataRef.current.get(symbol));
      return stockDataRef.current.get(symbol);
    };

    return {
      subscribeSymbols,
      unsubscribeSymbols,
      getStockData,
      stockDataRef,
      subscribersRef,
      forceUpdate,
      
    };
}

// Singleton export
export default StockSocketManager;
