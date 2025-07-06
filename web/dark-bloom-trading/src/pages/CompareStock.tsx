import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Target,
  Users,
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { AppSidebar } from "@/components/home/AppSidebar";
import {
  PageHeader,
  StockOverviewCard,
  MarketCapChart,
  PERatioChart,
  RadarAnalysisChart,
  ProfitabilityChart,
  ValuationCard,
  AnalystRatingsCard,
  InvestmentSummary,
} from "@/components/stockComparison";
import { useParams } from "react-router-dom";
import { MarketService } from "@/lib/api";


const StockComparison = () => {
  const { symbols } = useParams();
  const [selectedStocks, setSelectedStocks] = useState([]);
  // const [selectedStocks, setSelectedStocks] = useState([])
  const [activeTab, setActiveTab] = useState("overview");
  const requestKey="stockComparison"+ symbols;
  
  useEffect(() => {
    const fetchStocks = async () => {
      if (symbols) {
        try {
          const stocks = await MarketService.get('/api/stock/get_stocks_details', {
            params: { listOfStocks: symbols },
          },
           requestKey
          );
          setSelectedStocks(stocks.data.data);
        } catch (error) {
          console.error("Error fetching stocks:", error);
        }
      } else {
        setSelectedStocks([]);
      }
    };
    
    fetchStocks();
  }, [symbols]);
  if (MarketService.isLoading(requestKey) || selectedStocks === undefined || selectedStocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }
  // Format large numbers
  const formatNumber = (num: string | number) => {
    const value = typeof num === "string" ? parseFloat(num) : num;
    if (value >= 1e12) return `$${(value / 1e12)?.toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9)?.toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6)?.toFixed(2)}M`;
    return `$${value?.toFixed(2)}`;
  };

  const formatPercentage = (num: string | number) => {
    const value = typeof num === "string" ? parseFloat(num) : num;
    return `${(value * 100)?.toFixed(2)}%`;
  };

  // Prepare chart data
  const marketCapData = selectedStocks.map((stock) => ({
    name: stock.symbol,
    value: parseFloat(stock.marketcapitalization) / 1e9,
    fullName: stock.name,
  }));

  const peRatioData = selectedStocks.map((stock) => ({
    name: stock.symbol,
    pe: parseFloat(stock.peratio),
    fullName: stock.name,
  }));

  const profitabilityData = selectedStocks.map((stock) => ({
    name: stock.symbol,
    profitMargin: parseFloat(stock.profitmargin) * 100,
    operatingMargin: parseFloat(stock.operatingmarginttm) * 100,
    roe: parseFloat(stock.returnonequityttm) * 100,
  }));

  const analystRatingsData = selectedStocks.map((stock) => [
    {
      name: "Strong Buy",
      value: parseInt(stock.analystratingstrongbuy),
      color: "#22c55e",
    },
    { name: "Buy", value: parseInt(stock.analystratingbuy), color: "#84cc16" },
    {
      name: "Hold",
      value: parseInt(stock.analystratinghold),
      color: "#eab308",
    },
    {
      name: "Sell",
      value: parseInt(stock.analystratingsell),
      color: "#f97316",
    },
    {
      name: "Strong Sell",
      value: parseInt(stock.analystratingstrongsell),
      color: "#ef4444",
    },
  ]);

  const radarData = selectedStocks.map((stock) => ({
    stock: stock.symbol,
    "P/E Ratio": Math.min(parseFloat(stock.peratio), 50),
    "Profit Margin": parseFloat(stock.profitmargin) * 100,
    ROE: parseFloat(stock.returnonequityttm) * 100,
    "Operating Margin": parseFloat(stock.operatingmarginttm) * 100,
    "Earnings Growth": parseFloat(stock.quarterlyearningsgrowthyoy) * 100,
  }));


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-950">
        <AppSidebar />
        <div className="min-h-screen bg-background text-foreground p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <PageHeader />

            {/* Stock Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedStocks.map((stock, index) => (
                <StockOverviewCard
                  key={stock.symbol}
                  stock={stock}
                  formatNumber={formatNumber}
                  formatPercentage={formatPercentage}
                />
              ))}
            </div>

            {/* Main Analysis Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 bg-muted/50 backdrop-blur-sm">
                <TabsTrigger
                  value="overview"
                  className="hover:bg-primary/20 hover:text-primary transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30"
                >
                  Market Overview
                </TabsTrigger>
                <TabsTrigger
                  value="profitability"
                  className="hover:bg-primary/20 hover:text-primary transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30"
                >
                  Profitability
                </TabsTrigger>
                <TabsTrigger
                  value="valuation"
                  className="hover:bg-primary/20 hover:text-primary transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30"
                >
                  Valuation
                </TabsTrigger>
                <TabsTrigger
                  value="analysts"
                  className="hover:bg-primary/20 hover:text-primary transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30"
                >
                  Analyst Ratings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MarketCapChart data={marketCapData} />
                  <PERatioChart data={peRatioData} />
                </div>
                <RadarAnalysisChart
                  radarData={radarData}
                  selectedStocks={selectedStocks}
                />
              </TabsContent>

              <TabsContent value="profitability" className="space-y-6">
                <ProfitabilityChart data={profitabilityData} />
              </TabsContent>

              <TabsContent value="valuation" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {selectedStocks.map((stock, index) => (
                    <ValuationCard key={stock.symbol} stock={stock} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analysts" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {selectedStocks.map((stock, index) => (
                    <AnalystRatingsCard
                      key={stock.symbol}
                      stock={stock}
                      ratingsData={analystRatingsData[index]}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Summary Section */}
            <InvestmentSummary selectedStocks={selectedStocks} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StockComparison;
