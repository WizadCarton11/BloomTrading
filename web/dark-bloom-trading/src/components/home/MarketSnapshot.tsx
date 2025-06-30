import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useStockSubscription } from "@/hooks/useStockSubscription";

export function MarketSnapshot() {
  const symbols = ['AAPL','GOOGL', 'TSLA'];
  const stockData = useStockSubscription(symbols);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Update timestamp on any data change
  useEffect(() => {
    if (stockData.some(({ data }) => data)) {
      setLastUpdate(new Date());
    }
  }, [JSON.stringify(stockData.map(s => s.data))]); // triggers on data change

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
          {stockData.map(({ symbol, data }) => (
            <Card 
              key={symbol} 
              className="bg-gray-800 border-gray-700 hover:border-emerald-500 transition-all duration-500 group hover:shadow-2xl hover:shadow-blue-500/20 transform hover:scale-105 hover:rotate-1 hover:-translate-y-2 cursor-pointer perspective-1000"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <CardHeader className="pb-3 transition-transform duration-500 group-hover:translate-z-4">
                <CardTitle className="text-emerald-400 text-lg font-semibold group-hover:text-emerald-300 transition-colors">
                  {symbol}
                </CardTitle>
              </CardHeader>
              <CardContent className="transition-transform duration-500 group-hover:translate-z-2">
                {
                  data?
                <>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white group-hover:text-emerald-100 transition-colors">
                    ${data?.price ?? '0.00'}
                  </div>
                  <div className={`flex items-center gap-1 text-sm transition-all duration-300 ${
                    data?.change >= 0 ? 'text-green-400 group-hover:text-green-300' : 'text-red-400 group-hover:text-red-300'
                  }`}>
                    {data?.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <TrendingDown className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    )}
                    <span>{data?.change >= 0 ? '+' : ''}{data?.change?.toFixed(2) ?? '0.00'}</span>
                    <span>
                      ({data?.changePercent >= 0 ? '+' : ''}{((data?.changePercent ?? 0) * 100)?.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Volume: {data?.volume ?? '—'}
                  </div>
                </div>
                </>
                :
                <div className="text-gray-500 text-center py-6">
                  Loading data for {symbol}...
                </div>
                }
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
