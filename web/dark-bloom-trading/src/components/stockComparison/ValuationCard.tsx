import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stock {
  symbol: string;
  peratio: string;
  "52weekhigh": string;
  "52weeklow": string;
  analysttargetprice: string;
}

interface ValuationCardProps {
  stock: Stock;
}

const ValuationCard: React.FC<ValuationCardProps> = ({ stock }) => {
  return (
    <Card className="bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-105 group">
      <CardHeader>
        <CardTitle className="text-center group-hover:text-primary transition-colors duration-300">
          {stock.symbol} Valuation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
            <span className="text-sm font-medium">Current P/E</span>
            <span className="text-lg font-bold text-blue-400">{stock.peratio}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg hover:bg-gradient-to-r hover:from-green-500/20 hover:to-green-400/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
            <span className="text-sm font-medium">52W High</span>
            <span className="text-lg font-bold text-green-400">${stock["52weekhigh"]}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-400/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20">
            <span className="text-sm font-medium">52W Low</span>
            <span className="text-lg font-bold text-red-400">${stock["52weeklow"]}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-purple-400/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
            <span className="text-sm font-medium">Target Price</span>
            <span className="text-lg font-bold text-purple-400">${stock.analysttargetprice}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValuationCard;
