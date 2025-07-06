import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Target } from 'lucide-react';

interface Stock {
  symbol: string;
  quarterlyearningsgrowthyoy: string;
  peratio: string;
  analystratingstrongbuy: string;
  analystratingbuy: string;
}

interface InvestmentSummaryProps {
  selectedStocks: Stock[];
}

const InvestmentSummary: React.FC<InvestmentSummaryProps> = ({ selectedStocks }) => {
  const highestGrowthStock = selectedStocks.reduce((prev, current) => 
    parseFloat(prev.quarterlyearningsgrowthyoy) > parseFloat(current.quarterlyearningsgrowthyoy) ? prev : current
  );

  const bestValueStock = selectedStocks.reduce((prev, current) => 
    parseFloat(prev.peratio) < parseFloat(current.peratio) ? prev : current
  );

  const analystFavoriteStock = selectedStocks.reduce((prev, current) => 
    (parseInt(prev.analystratingstrongbuy) + parseInt(prev.analystratingbuy)) > 
    (parseInt(current.analystratingstrongbuy) + parseInt(current.analystratingbuy)) ? prev : current
  );

  return (
    <Card className="bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group">
      <CardHeader>
        <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
          Investment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 p-4 rounded-lg hover:bg-gradient-to-br hover:from-green-500/10 hover:to-green-400/5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
            <h3 className="font-semibold text-green-400 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 animate-pulse" />
              <span>Highest Growth</span>
            </h3>
            <p className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              Based on quarterly earnings growth, {highestGrowthStock.symbol} shows the strongest growth momentum.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-blue-400/5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
            <h3 className="font-semibold text-blue-400 flex items-center space-x-2">
              <DollarSign className="h-4 w-4 animate-bounce" />
              <span>Best Value</span>
            </h3>
            <p className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              {bestValueStock.symbol} offers the most attractive valuation with the lowest P/E ratio.
            </p>
          </div>
          <div className="space-y-2 p-4 rounded-lg hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-purple-400/5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
            <h3 className="font-semibold text-purple-400 flex items-center space-x-2">
              <Target className="h-4 w-4 animate-pulse" />
              <span>Analyst Favorite</span>
            </h3>
            <p className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              {analystFavoriteStock.symbol} has the highest combined buy ratings from analysts.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentSummary;
