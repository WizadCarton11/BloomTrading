import React from 'react';

const PageHeader: React.FC = () => {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
        Professional Stock Analysis Dashboard
      </h1>
      <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full shadow-lg shadow-blue-500/50"></div>
      <p className="text-muted-foreground text-lg hover:text-foreground transition-colors duration-300">
        Comprehensive comparison and analysis of leading stocks
      </p>
    </div>
  );
};

export default PageHeader;
