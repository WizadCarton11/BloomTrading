
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Check } from "lucide-react";
import { useSingleStockSubscription } from "@/hooks/useStockSubscription";

interface Stock {
  id?: string;
  symbol?: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: bigint | number;
  sector?: string;
  pe?: number;
  data?: any; // Optional field for additional data
  visible?: boolean; 
}

interface StockCardProps {
  stock: Stock;
  isCompareMode?: boolean;
  isSelected?: boolean;
  onSelect?: (stockId: string) => void;
}

export function StockCard({ stock , isCompareMode = false, isSelected = false, onSelect }: StockCardProps) {
  const isPositive = stock.change >= 0;
  const {symbol, data }= useSingleStockSubscription(stock.symbol || "");
  const navigation = useNavigate();
  const handleClick = () => {
    if (isCompareMode && onSelect) {
      console.log(`Selected stock: ${stock}`);
      onSelect(stock.symbol);
    }
    if (!isCompareMode) {
      console.log(`Clicked on stock: ${stock.symbol}`);
      navigation(`/stock/${stock.symbol}`, { state: { stock: stock } });
      // Navigate to the stock details page or perform any other action
      // For example, you can use a router to navigate to a stock details page
    }
  };
  function formatMarketCap(value: number | bigint | undefined): string {
    if (value === undefined || value === null) return "Loading...";

    const cap = typeof value === 'bigint' ? value : BigInt(Math.round(value));

    if (cap >= BigInt(1e12)) return (Number(cap) / 1e12).toFixed(2) + " T";
    if (cap >= BigInt(1e9)) return (Number(cap) / 1e9).toFixed(2) + " B";
    if (cap >= BigInt(1e6)) return (Number(cap) / 1e6).toFixed(2) + " M";

    return cap.toString(); // Less than 1M: show full number
  }

  
  return (
    <Card 
  className={`group relative overflow-hidden transition-all duration-300 ease-in-out 
    bg-gradient-to-br from-[#0f172a] to-[#1e293b] 
    border border-border hover:border-blue-500 
    hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-500/30 hover:shadow-lg
    hover:shadow-blue-500/20 
    cursor-pointer
    rounded-xl
    ${stock.visible ? 'display-block' : 'hidden'}
    ${isCompareMode ? 'cursor-pointer' : ''}
    ${isSelected ? 'border-blue-500 bg-blue-500/10' : ''}
  `}
  onClick={handleClick}
>
  {/* Selection indicator */}
  {isSelected && (
    <div className="absolute top-2 right-2 z-20 bg-blue-600 text-white rounded-full p-1 shadow-md">
      <Check className="h-3 w-3" />
    </div>
  )}

  {/* Glow on hover */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />

  {/* Animated outer ring */}
  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-transparent opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500 -z-10" />

  <CardHeader className="pb-3 relative z-10">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-bold text-lg text-foreground group-hover:text-blue-400 transition-colors duration-300">
          {stock.symbol || "Loading..."}
        </h3>
        <p className="text-sm text-muted-foreground truncate group-hover:text-gray-300 transition-colors duration-300">
          {/* limit the stock name to 40 characters */}
          {stock?.name?.length > 10? stock.name?.slice(0, 10) +"..." : stock.name || "Loading..."}
        </p>
      </div>
      <Badge
        variant="secondary"
        className="text-xs px-3 py-1 rounded-full uppercase tracking-wide font-medium
        bg-blue-500/10 text-blue-300 border border-blue-400/30
        group-hover:bg-blue-500/20 group-hover:text-blue-200 
        whitespace-nowrap min-w-[110px] h-6 flex items-center justify-center text-center
        transition-all duration-300"
      >
        {stock.sector.length > 10? stock.sector?.slice(0, 10) +"..." : stock.sector || "Loading..."}
      </Badge>

    </div>
  </CardHeader>

  <CardContent className="space-y-4 relative z-10">
    <div className="flex items-center justify-between">
      {
        data?.price?
      <>
      <span className="text-2xl font-bold text-foreground group-hover:text-white transition-colors duration-300">
        ${data?.price || "Loading..."}
      </span>
      <div
        className={`flex items-center space-x-1 font-small transition-all duration-300 ${
          data?.changePercent >= 0
            ? 'text-green-500 group-hover:text-green-400'
            : 'text-red-500 group-hover:text-red-400'
        }`}
      >
        {data?.changePercent >= 0 ? (
          <TrendingUp className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <TrendingDown className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
        )}
        <span>
          {data?.changePercent >= 0 ? '+' : ''}
          {data?.change?.toFixed(2) || "Loading..."} (
          {data?.changePercent >= 0 ? '+' : ''}
          {data?.changePercent?.toFixed(2) || "Loading..."}%)
        </span>
      </div>
      </>
      :
      <span className="text-2xl font-bold text-foreground group-hover:text-white transition-colors duration-300">
        ${stock.price?.toFixed(2) || "Loading..."}
      </span>
      }
    </div>

    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
      <div className="group-hover:translate-x-1 transition-transform duration-300">
        <p className="text-xs group-hover:text-gray-300">Volume</p>
        <p className="font-medium text-foreground group-hover:text-white">
          {(data?.volume / 100000)?.toFixed(2) || "Loading..."}M
        </p>
      </div>
      <div className="group-hover:translate-x-1 transition-transform duration-300">
        <p className="text-xs group-hover:text-gray-300">Market Cap</p>
        <p className="font-medium text-foreground group-hover:text-white">
          {formatMarketCap(stock.marketCap) || "Loading..."}
        </p>
      </div>
      {/* <div className="group-hover:translate-x-1 transition-transform duration-300">
        <p className="text-xs group-hover:text-gray-300">P/E Ratio</p>
        <p className="font-medium text-foreground group-hover:text-white">
          {stock.pe?.toFixed(1) || "Loading..."}
        </p>
      </div> */}
      <div className="group-hover:translate-x-1 transition-transform duration-300">
        <p className="text-xs group-hover:text-gray-300">Sector</p>
        <p className="font-medium text-foreground group-hover:text-white text-xs">
          {stock.sector || "Loading..."}
        </p>
      </div>
    </div>
  </CardContent>
</Card>

  );
}

import { memo } from "react";
import { Router, useNavigate } from "react-router-dom";

const MemoizedStockCard = memo(StockCard, (prevProps, nextProps) => {
  return (
    prevProps.stock.symbol === nextProps.stock.symbol &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isCompareMode === nextProps.isCompareMode
  );
});
export { MemoizedStockCard };
