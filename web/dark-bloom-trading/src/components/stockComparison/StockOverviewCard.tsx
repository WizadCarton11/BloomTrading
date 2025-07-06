import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  marketcapitalization: string;
  peratio: string;
  eps: string;
  revenuettm: string;
  profitmargin: string;
  beta: string;
  analysttargetprice: string;
}

interface StockOverviewCardProps {
  stock: Stock;
  formatNumber: (num: string | number) => string;
  formatPercentage: (num: string | number) => string;
}

const StockOverviewCard: React.FC<StockOverviewCardProps> = ({
  stock,
  formatNumber,
  formatPercentage
}) => {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] group cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-primary group-hover:text-blue-400 transition-colors duration-300 flex items-center space-x-2">
              <span>{stock.symbol}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 group-hover:text-foreground transition-colors duration-300">
              {stock.name}
            </p>
          </div>
          <Badge variant="secondary" className="group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300 hover:shadow-md hover:shadow-primary/30">
            {stock.sector}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between hover:bg-muted/50 p-2 rounded transition-colors duration-200">
              <span className="text-muted-foreground">Market Cap:</span>
              <span className="font-medium text-green-400">{formatNumber(stock.marketcapitalization)}</span>
            </div>
            <div className="flex justify-between hover:bg-muted/50 p-2 rounded transition-colors duration-200">
              <span className="text-muted-foreground">P/E Ratio:</span>
              <span className="font-medium">{stock.peratio}</span>
            </div>
            <div className="flex justify-between hover:bg-muted/50 p-2 rounded transition-colors duration-200">
              <span className="text-muted-foreground">EPS:</span>
              <span className="font-medium">${stock.eps}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between hover:bg-muted/50 p-2 rounded transition-colors duration-200">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-medium">{formatNumber(stock.revenuettm)}</span>
            </div>
            <div className="flex justify-between hover:bg-muted/50 p-2 rounded transition-colors duration-200">
              <span className="text-muted-foreground">Profit Margin:</span>
              <span className="font-medium text-green-400">{formatPercentage(stock.profitmargin)}</span>
            </div>
            <div className="flex justify-between hover:bg-muted/50 p-2 rounded transition-colors duration-200">
              <span className="text-muted-foreground">Beta:</span>
              <span className="font-medium">{stock.beta}</span>
            </div>
          </div>
        </div>
        <div className="pt-2 border-t border-border group-hover:border-primary/30 transition-colors duration-300">
          <div className="flex justify-between items-center hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 p-2 rounded transition-all duration-300">
            <span className="text-sm text-muted-foreground">Target Price:</span>
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4 text-blue-400 group-hover:animate-pulse" />
              <span className="font-medium">${stock.analysttargetprice}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockOverviewCard;
