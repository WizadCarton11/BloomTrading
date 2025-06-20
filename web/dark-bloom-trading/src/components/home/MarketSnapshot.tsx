
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
}

export function MarketSnapshot() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate real-time market data
  useEffect(() => {
    const generateRandomData = (): MarketData[] => [
      {
        symbol: "AAPL",
        price: 175.50 + (Math.random() - 0.5) * 10,
        change: (Math.random() - 0.5) * 5,
        changePercent: (Math.random() - 0.5) * 0.05,
        volume: "45.2M"
      },
      {
        symbol: "GOOGL",
        price: 2850.25 + (Math.random() - 0.5) * 50,
        change: (Math.random() - 0.5) * 15,
        changePercent: (Math.random() - 0.5) * 0.08,
        volume: "28.1M"
      },
      {
        symbol: "MSFT",
        price: 420.75 + (Math.random() - 0.5) * 20,
        change: (Math.random() - 0.5) * 8,
        changePercent: (Math.random() - 0.5) * 0.06,
        volume: "32.8M"
      },
      {
        symbol: "TSLA",
        price: 245.80 + (Math.random() - 0.5) * 30,
        change: (Math.random() - 0.5) * 12,
        changePercent: (Math.random() - 0.5) * 0.1,
        volume: "89.5M"
      },
      {
        symbol: "NVDA",
        price: 875.40 + (Math.random() - 0.5) * 40,
        change: (Math.random() - 0.5) * 20,
        changePercent: (Math.random() - 0.5) * 0.12,
        volume: "56.3M"
      },
      {
        symbol: "AMZN",
        price: 155.20 + (Math.random() - 0.5) * 15,
        change: (Math.random() - 0.5) * 6,
        changePercent: (Math.random() - 0.5) * 0.07,
        volume: "41.7M"
      }
    ];

    setMarketData(generateRandomData());

    const interval = setInterval(() => {
      setMarketData(generateRandomData());
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 px-6 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Live Market Snapshot</h2>
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketData.map((stock) => (
            <Card 
              key={stock.symbol} 
              className="bg-gray-800 border-gray-700 hover:border-emerald-500 transition-all duration-500 group hover:shadow-2xl hover:shadow-emerald-500/20 transform hover:scale-105 hover:rotate-1 hover:-translate-y-2 cursor-pointer perspective-1000"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <CardHeader className="pb-3 transition-transform duration-500 group-hover:translate-z-4">
                <CardTitle className="text-emerald-400 text-lg font-semibold group-hover:text-emerald-300 transition-colors">
                  {stock.symbol}
                </CardTitle>
              </CardHeader>
              <CardContent className="transition-transform duration-500 group-hover:translate-z-2">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white group-hover:text-emerald-100 transition-colors">
                    ${stock.price.toFixed(2)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm transition-all duration-300 ${
                    stock.change >= 0 ? 'text-green-400 group-hover:text-green-300' : 'text-red-400 group-hover:text-red-300'
                  }`}>
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <TrendingDown className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    )}
                    <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}</span>
                    <span>({stock.changePercent >= 0 ? '+' : ''}{(stock.changePercent * 100).toFixed(2)}%)</span>
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Volume: {stock.volume}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
