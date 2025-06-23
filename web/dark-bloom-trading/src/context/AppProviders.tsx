import React, { ReactNode } from 'react';
import { GlobalProvider } from './GlobalContext';
import { TradingProvider } from './TradingContext';

interface AppProvidersProps {
  children: ReactNode;
}

// A component that combines all context providers
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <GlobalProvider>
      <TradingProvider>
        {children}
      </TradingProvider>
    </GlobalProvider>
  );
};
