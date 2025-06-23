import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of our context state
interface GlobalContextState {
  // Example states
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  
  userPreferences: {
    notifications: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
  };
  setUserPreferences: (prefs: Partial<GlobalContextState['userPreferences']>) => void;
  
  activePortfolio: string | null;
  setActivePortfolio: (id: string | null) => void;
  
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

// Create the context with default values
const GlobalContext = createContext<GlobalContextState | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  // Example state management
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    // Try to get from localStorage or default to system preference
    localStorage.getItem('darkMode') === 'true' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  const [userPreferences, setUserPreferencesState] = useState({
    notifications: true,
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
  });
  
  const [activePortfolio, setActivePortfolio] = useState<string | null>(
    localStorage.getItem('activePortfolio')
  );
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem('token')
  );
  
  // Update user preferences with partial data
  const setUserPreferences = (prefs: Partial<GlobalContextState['userPreferences']>) => {
    setUserPreferencesState(prev => ({ ...prev, ...prefs }));
  };
  
  // Side effects for persistence
  React.useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    // Apply dark mode to the document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  React.useEffect(() => {
    if (activePortfolio) {
      localStorage.setItem('activePortfolio', activePortfolio);
    } else {
      localStorage.removeItem('activePortfolio');
    }
  }, [activePortfolio]);
  
  const value = {
    isDarkMode,
    setIsDarkMode,
    userPreferences,
    setUserPreferences,
    activePortfolio,
    setActivePortfolio,
    isLoggedIn,
    setIsLoggedIn,
  };
  
  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use the global context
export const useGlobalContext = (): GlobalContextState => {
  const context = useContext(GlobalContext);
  
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  
  return context;
};
