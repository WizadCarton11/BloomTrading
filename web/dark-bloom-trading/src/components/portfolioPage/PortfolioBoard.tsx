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
import { useNavigate, useNavigation } from "react-router-dom";
import { PortfolioSummary } from "@/components/portfolioPage/PortfolioSummary";
import AssetAllocationChart from "./PortfolioAllocation";
export const PortfolioBoard = ({
  fetchHoldings,
  isloading,
  holdings,
  formatCurrency,
  formatPercent,
  listOfHoldings,
  holdingsMap,
}) => {
  if (!listOfHoldings || listOfHoldings?.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }
  const [sortKey, setSortKey] = useState<
    "symbol" | "quantity" | "averageCost" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const sortedHoldings = useMemo(() => {
    if (!sortKey) return holdings;

    const sorted = [...holdings].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [holdings, sortKey, sortOrder]);

  const navigate = useNavigate();

  const handleRowClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };
  const stockMap = useStockSubscriptionWithMap(listOfHoldings);

  const getCurrentStockData = (symbol: string) => {
    const stock = stockMap.get(symbol.toLowerCase());
    return {
      price: formatCurrency(stock?.data?.price),
      changePrice: stock?.data?.change?.toFixed(3) || "—",
      marketValue: holdingsMap.get(symbol)?.quantity
        ? formatCurrency(stock?.data?.price * holdingsMap.get(symbol)?.quantity)
        : "—",
      gainLoss: (
        -holdingsMap.get(symbol)?.totalValue +
        stock?.data?.price * holdingsMap.get(symbol)?.quantity
      ).toFixed(2),
      returnPercent: holdingsMap.get(symbol)?.quantity
        ? (
            ((-holdingsMap.get(symbol)?.totalValue +
              stock?.data?.price * holdingsMap.get(symbol)?.quantity) /
              (holdingsMap.get(symbol)?.totalValue || 1)) *
            100
          ).toFixed(3)
        : "—",
    };
  };
  const handleSort = (key: "symbol" | "quantity" | "averageCost") => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // You can add your refresh logic here
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000); // Stop spinning after 2 seconds
  };

  const { totalValue, totalCost, totalGainLoss, totalGainLossPercent } =
    useMemo(() => {
      let _totalValue = 0;
      let _totalCost = 0;

      listOfHoldings.forEach((symbol) => {
        const stock = stockMap.get(symbol.toLowerCase());
        const holding = holdingsMap.get(symbol);

        if (!stock || !holding) return;

        const currentPrice = stock.data?.price ?? 0;
        const quantity = holding.quantity ?? 0;
        const cost = holding.totalValue ?? 0;

        const marketValue = currentPrice * quantity;

        _totalValue += marketValue;
        _totalCost += cost;
      });

      const _gainLoss = _totalValue - _totalCost;
      const _gainLossPercent =
        _totalCost !== 0 ? (_gainLoss / _totalCost) * 100 : 0;

      return {
        totalValue: _totalValue,
        totalCost: _totalCost,
        totalGainLoss: _gainLoss,
        totalGainLossPercent: _gainLossPercent,
      };
    }, [stockMap]);
  const allPricesAvailable = listOfHoldings.every((symbol) => {
    const stock = stockMap.get(symbol.toLowerCase());
    return stock  && stock.data 
  });

  if (!allPricesAvailable) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      
      <PortfolioSummary
        totalValue={totalValue}
        totalCost={totalCost}
        totalGainLoss={totalGainLoss}
        totalGainLossPercent={totalGainLossPercent}
        formatCurrency={formatCurrency}
        formatPercent={formatPercent}
      />
      {/* Holdings Table */}
      <Card className="bg-slate-800 border-slate-700 hover:bg-gradient-to-br hover:from-indigo-900/20 hover:to-slate-800 hover:border-indigo-400/60 hover:shadow-2xl hover:shadow-indigo-400/15 hover:scale-[1.01] transition-all duration-300 group cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100 group-hover:text-indigo-100 transition-colors duration-300">
                Stock Holdings
              </CardTitle>
              <CardDescription className="text-slate-400 group-hover:text-indigo-300 transition-colors duration-300">
                Real-time portfolio positions and performance
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-indigo-800/40 hover:border-indigo-500/60 hover:text-indigo-200 hover:shadow-lg hover:shadow-indigo-400/20 transition-all duration-300 group/refresh"
            >
              <RefreshCw className={`w-4 h-4 group-hover/refresh:text-indigo-300 transition-all duration-500 ease-in-out ${
                isRefreshing 
                  ? 'text-indigo-300 animate-spin [animation-duration:2.5s]' 
                  : 'group-hover/refresh:rotate-90'
              }`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr className="border-b border-slate-700">
                  <th
                    className="text-left py-3 px-2 text-slate-300 font-medium cursor-pointer bg-slate-800"
                    onClick={() => handleSort("symbol")}
                  >
                    Symbol{" "}
                    {sortKey === "symbol" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="text-right py-3 px-2 text-slate-300 font-medium cursor-pointer bg-slate-800"
                    onClick={() => handleSort("quantity")}
                  >
                    Quantity{" "}
                    {sortKey === "quantity" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="text-right py-3 px-2 text-slate-300 font-medium cursor-pointer bg-slate-800"
                    onClick={() => handleSort("averageCost")}
                  >
                    Avg Cost{" "}
                    {sortKey === "averageCost" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>

                  <th className="text-right py-3 px-2 text-slate-300 font-medium bg-slate-800">
                    Current Price
                  </th>
                  <th className="text-right py-3 px-2 text-slate-300 font-medium bg-slate-800">
                    Market Value
                  </th>
                  <th className="text-right py-3 px-2 text-slate-300 font-medium bg-slate-800">
                    P&L
                  </th>
                  <th className="text-right py-3 px-2 text-slate-300 font-medium bg-slate-800">
                    Return %
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedHoldings?.map((holding) => {
                  const gainLoss =
                    holding.totalValue - holding.averageCost * holding.quantity;
                  const gainLossPercent =
                    (gainLoss / (holding.averageCost * holding.quantity)) * 100;

                  return (
                    <tr
                      onClick={() => handleRowClick(holding.symbol)}
                      key={holding.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/40 hover:border-slate-600/50 hover:shadow-lg hover:shadow-cyan-400/5 transition-all duration-300 cursor-pointer group"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="border-slate-600 text-slate-200 bg-slate-700 group-hover:border-cyan-400 group-hover:text-cyan-400 group-hover:shadow-md group-hover:shadow-cyan-400/20 transition-all duration-300"
                          >
                            {holding.symbol}
                          </Badge>
                        </div>
                      </td>
                      <td className="text-right py-4 px-2 font-medium text-slate-200 group-hover:text-slate-100 transition-colors duration-300">
                        {holding.quantity}
                      </td>
                      <td className="text-right py-4 px-2 text-slate-200 group-hover:text-slate-100 transition-colors duration-300">
                        {formatCurrency(holding.averageCost)}
                      </td>
                      <td className="text-right py-4 px-2 font-medium">
                        <div className="flex flex-col items-end">
                          <span className="text-slate-200 group-hover:text-slate-100 transition-colors duration-300">
                            {getCurrentStockData(holding.symbol).price}
                          </span>
                          <span
                            className={`text-xs ${
                              getCurrentStockData(holding.symbol)
                                .changePrice! >= 0
                                ? "text-green-400 group-hover:text-green-300 group-hover:drop-shadow-sm group-hover:drop-shadow-green-400/50"
                                : "text-red-400 group-hover:text-red-300 group-hover:drop-shadow-sm group-hover:drop-shadow-red-400/50"
                            } transition-all duration-300`}
                          >
                            {getCurrentStockData(holding.symbol).changePrice! >=
                            0
                              ? "+"
                              : ""}
                            {getCurrentStockData(holding.symbol).changePrice}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-2 font-medium text-slate-200 group-hover:text-slate-100 transition-colors duration-300">
                        {getCurrentStockData(holding.symbol).marketValue}
                      </td>
                      <td
                        className={`text-right py-4 px-2 font-medium ${
                          Number(
                            getCurrentStockData(holding.symbol).gainLoss
                          ) >= 0
                            ? "text-green-400 group-hover:text-green-300 group-hover:drop-shadow-sm group-hover:drop-shadow-green-400/50"
                            : "text-red-400 group-hover:text-red-300 group-hover:drop-shadow-sm group-hover:drop-shadow-red-400/50"
                        } transition-all duration-300`}
                      >
                        {getCurrentStockData(holding.symbol).gainLoss}
                      </td>
                      <td
                        className={`text-right py-4 px-2 font-medium ${
                          Number(
                            getCurrentStockData(holding.symbol).gainLoss
                          ) >= 0
                            ? "text-green-400 group-hover:text-green-300 group-hover:drop-shadow-sm group-hover:drop-shadow-green-400/50"
                            : "text-red-400 group-hover:text-red-300 group-hover:drop-shadow-sm group-hover:drop-shadow-red-400/50"
                        } transition-all duration-300`}
                      >
                        {getCurrentStockData(holding.symbol).returnPercent}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <AssetAllocationChart portfolio={sortedHoldings} />
  

    </>
  );
};
