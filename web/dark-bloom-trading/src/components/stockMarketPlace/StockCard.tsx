
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Check } from "lucide-react";

interface Stock {
  id?: string;
  symbol?: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: string;
  sector?: string;
  pe?: number;
}

interface StockCardProps {
  stock: Stock;
  isCompareMode?: boolean;
  isSelected?: boolean;
  onSelect?: (stockId: string) => void;
}

export function StockCard({ stock, isCompareMode = false, isSelected = false, onSelect }: StockCardProps) {
  const isPositive = stock.change >= 0;
  
  const handleClick = () => {
    if (isCompareMode && onSelect) {
      onSelect(stock.id);
    }
  };
  
  return (
    <Card 
      className={`group relative overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 bg-card border hover:border-blue-500/50 hover:scale-105 ${
        isCompareMode ? 'cursor-pointer' : ''
      } ${
        isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-border'
      }`}
      onClick={handleClick}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-20 bg-blue-500 text-white rounded-full p-1">
          <Check className="h-3 w-3" />
        </div>
      )}
      
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300 -z-10" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-foreground group-hover:text-blue-400 transition-colors duration-200">{stock.symbol || "N/A"}</h3>
            <p className="text-sm text-muted-foreground truncate group-hover:text-gray-300 transition-colors duration-200">{stock.name || "N/A"}</p>
          </div>
          <Badge variant="secondary" className="text-xs group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-all duration-200">
            {stock.sector}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground group-hover:text-white transition-colors duration-200">${stock.price.toFixed(2) || "N/A"}</span>
          <div className={`flex items-center space-x-1 transition-all duration-200 ${isPositive ? 'text-green-500 group-hover:text-green-400' : 'text-red-500 group-hover:text-red-400'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" /> : <TrendingDown className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />}
            <span className="font-medium">
              {isPositive ? '+' : ''}{stock.change.toFixed(2) || "N/A"} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2) || "N/A"}%)
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="group-hover:transform group-hover:translate-x-1 transition-transform duration-200">
            <p className="text-muted-foreground group-hover:text-gray-300 transition-colors duration-200">Volume</p>
            <p className="font-medium text-foreground group-hover:text-white transition-colors duration-200">{(stock.volume / 1000000).toFixed(1) || "N/A"}M</p>
          </div>
          <div className="group-hover:transform group-hover:translate-x-1 transition-transform duration-200">
            <p className="text-muted-foreground group-hover:text-gray-300 transition-colors duration-200">Market Cap</p>
            <p className="font-medium text-foreground group-hover:text-white transition-colors duration-200">{stock.marketCap || "N/A"}</p>
          </div>
          <div className="group-hover:transform group-hover:translate-x-1 transition-transform duration-200">
            <p className="text-muted-foreground group-hover:text-gray-300 transition-colors duration-200">P/E Ratio</p>
            <p className="font-medium text-foreground group-hover:text-white transition-colors duration-200">{stock.pe.toFixed(1) || "N/A"}</p>
          </div>
          <div className="group-hover:transform group-hover:translate-x-1 transition-transform duration-200">
            <p className="text-muted-foreground group-hover:text-gray-300 transition-colors duration-200">Sector</p>
            <p className="font-medium text-foreground group-hover:text-white transition-colors duration-200 text-xs">{stock.sector || "N/A"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
