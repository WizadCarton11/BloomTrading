import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  RefreshCw,
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/home/AppSidebar";
import { Spinner } from "@/components/ui/spinner";
import { MarketService } from "@/lib/api";
import {
  useStockSubscription,
  useStockSubscriptionWithMap,
} from "@/hooks/useStockSubscription";
import { PortfolioBoard } from "@/components/portfolioPage/PortfolioBoard";
import { AccountBalanceCard } from "@/components/portfolioPage/AccountBalance";
import AssetAllocationChart from "@/components/portfolioPage/PortfolioAllocation";

interface StockHolding {
  id: string;
  userId: string;
  symbol: string;
  quantity: number;
  averageCost: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
  transactionId: string;
  currentPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
}

const Portfolio = () => {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [holdingsMap, setHoldingsMap] = useState<Map<string, StockHolding>>(
    new Map()
  );
  const [listOfHoldings, setListOfHoldings] = useState<String[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time price updates
  const fetchHoldings = async () => {
    setLoading(true);
    const response = await MarketService.get("/api/stock/get_portfolio");
    if (response.status === 200) {
      const resopnseData = response.data.data;
      console.log("Fetched holdings:", resopnseData);
      const data = resopnseData.portfolio as StockHolding[];
      setHoldings(data);
      setHoldingsMap(new Map(data.map((holding) => [holding.symbol, holding])));
      setListOfHoldings(resopnseData.listOfAllSymbols as String[]);
      setLoading(false);
    }
  };
  useEffect(() => {
    // const interval = setInterval(() => {
    //   setHoldings((prev) =>
    //     prev.map((holding) => {
    //       const volatility = 0.02; // 2% max change per update
    //       const change = (Math.random() - 0.5) * volatility;
    //       const newPrice = holding.currentPrice! * (1 + change);
    //       const priceChange = newPrice - holding.averageCost;
    //       const priceChangePercent = (priceChange / holding.averageCost) * 100;

    //       return {
    //         ...holding,
    //         currentPrice: parseFloat(newPrice.toFixed(2)),
    //         priceChange: parseFloat(priceChange.toFixed(2)),
    //         priceChangePercent: parseFloat(priceChangePercent.toFixed(2)),
    //         totalValue: parseFloat((newPrice * holding.quantity).toFixed(2)),
    //       };
    //     })
    //   );
    // }, 3000);

    // return () => clearInterval(interval);
    fetchHoldings();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(3)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-950 ">
        <AppSidebar />
        <div className="min-h-screen w-full bg-slate-900 text-slate-100 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Portfolio Dashboard
                </h1>
                <p className="text-slate-400 mt-2">
                  Track your investments in real-time
                </p>
              </div>
              <AccountBalanceCard formatCurrency={formatCurrency} />
            </div>

            {/* Portfolio Overview Cards */}
            <PortfolioBoard
              holdings={holdings}
              isloading={loading}
              formatCurrency={formatCurrency}
              formatPercent={formatPercent}
              listOfHoldings={listOfHoldings}
              holdingsMap={holdingsMap}
              fetchHoldings={fetchHoldings}
            />
            {/* <AssetAllocationChart portfolio={holdings} priceMap={holdingsMap} /> */}
            <div className="text-center text-slate-400 text-sm">
              <p>
                © {new Date().getFullYear()} DarkBloom. All rights reserved.
                Data provided for informational purposes only and not for
                trading or investment advice.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
    </SidebarProvider>
  );
};

export default Portfolio;
