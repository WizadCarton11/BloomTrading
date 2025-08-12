import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import StockChart from "@/components/singleStockPage/StockChart";
import StockMetrics from "@/components/singleStockPage/StockMetrics";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Globe,
  Calendar,
  DollarSign,
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/home/AppSidebar";
import { MarketService } from "@/lib/api";
import { ShoppingCart, Bot } from "lucide-react";
import { useSingleStockSubscription } from "@/hooks/useStockSubscription";
import AskAIModal from "@/components/singleStockPage/AskAIModal";
import BuySellModal from "@/components/singleStockPage/BuySellModal";

const formatNumber = (value: string | number, prefix = "", suffix = "") => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num >= 1e12) return `${prefix}${(num / 1e12).toFixed(2)}T${suffix}`;
  if (num >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)}B${suffix}`;
  if (num >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)}M${suffix}`;
  if (num >= 1e3) return `${prefix}${(num / 1e3).toFixed(2)}K${suffix}`;
  return `${prefix}${num.toFixed(2)}${suffix}`;
};

const formatPercentage = (value: string) => {
  const num = parseFloat(value) * 100;
  return `${num.toFixed(3)}%`;
};

export interface StockInfo {
  id: string;
  symbol: string;
  assettype: string;
  name: string;
  description: string;
  cik: string;
  exchange: string;
  currency: string;
  country: string;
  sector: string;
  industry: string;
  address: string;
  officialsite: string;
  fiscalyearend: string;
  latestquarter: string;
  marketcapitalization: string;
  ebitda: string;
  peratio: string;
  pegratio: string;
  bookvalue: string;
  dividendpershare: string;
  dividendyield: string;
  eps: string;
  revenuepersharettm: string;
  profitmargin: string;
  operatingmarginttm: string;
  returnonassetsttm: string;
  returnonequityttm: string;
  revenuettm: string;
  grossprofitttm: string;
  dilutedepsttm: string;
  quarterlyearningsgrowthyoy: string;
  quarterlyrevenuegrowthyoy: string;
  analysttargetprice: string;
  analystratingstrongbuy: string;
  analystratingbuy: string;
  analystratinghold: string;
  analystratingsell: string;
  analystratingstrongsell: string;
  trailingpe: string;
  forwardpe: string;
  pricetosalesratiottm: string;
  pricetobookratio: string;
  evtorevenue: string;
  evtoebitda: string;
  beta: string;
  "52weekhigh": string;
  "52weeklow": string;
  "50daymovingaverage": string;
  "200daymovingaverage": string;
  sharesoutstanding: string;
  sharesfloat: string;
  percentinsiders: string;
  percentinstitutions: string;
  dividenddate: string;
  exdividenddate: string;
  row_id: number;
  historicalData?: any[];
  latestDate?: string | null; // Optional field for the latest date in historical data
}
interface ValueComponentProps {
  symbol: string;
}

const ValueComponent = ({ symbol }: ValueComponentProps) => {
  const { data } = useSingleStockSubscription(symbol);
  return (
    <>
      {data ? (
        <>
          <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            ${data?.price}
          </div>
          <div
            className={`flex items-center gap-1 transition-all duration-300 ${
              data?.change >= 0
                ? "text-green-400 hover:text-green-300 hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                : "text-red-400 hover:text-red-300 hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]"
            }`}
          >
            {data.change >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {data.change >= 0 ? "+" : ""}
              {data.change?.toFixed(3)} ({data.changePercent?.toFixed(3)}%)
            </span>
          </div>
        </>
      ) : (
        // loading state
        <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
          Loading...
        </div>
      )}
    </>
  );
};

const SingleStockPage = () => {
  const [stockData, setStockData] = useState<StockInfo>();
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const stockPriceData = [];
  const [todayData, setTodayData] = useState<any[]>([]);
  const [latestDate, setLatestDate] = useState<string | null>(null);
  // const symbol = "AAPL"; // Example stock symbol, replace with dynamic value as needed
  const symbol =
    window.location.pathname.split("/").pop().toUpperCase() || "AAPL"; // Get the symbol from the URL path
  console.log("Rendering SingleStockPage for symbol:", symbol);
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await MarketService.get(
          `/api/stock/stock_details/${symbol}`,
          {},
          `get${symbol}StockDetails`
        );
        console.log("Today Data:", response?.data?.liveData);
        const result = response?.data?.data as StockInfo;
        if (result) {
          setTodayData(response?.data?.liveData || []);
          setStockData(result);
          // setHistoricalData(result?.historicalData)
          result?.historicalData?.forEach((item: any) => {
            stockPriceData.push({
              date: item.date,
              price: item.high,
              formattedDate: new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "2-digit",
              }),
            });
          });
          setHistoricalData(stockPriceData);
          setLatestDate(result?.latestDate);
        } else {
          console.warn("Stock data response is empty or malformed.");
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
        // Handle error appropriately, e.g., show a notification or fallback UI
      }
    };
    // const fetchTodayData = async () => {
    //     const result =await  MarketService.get(`/api/stock/get_today_data/${symbol}`, {}, "getTodayData"+symbol);
    //     console.log("Today Data:", result.data.data);
    //     setTodayData(result.data.data);
    //   }
    //   fetchTodayData()
    fetchStockData();
  }, []);

  if (
    !stockData ||
    Object.keys(stockData).length === 0 ||
    todayData.length === 0
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading Stock Data...</h1>
          <p className="text-lg text-gray-400">
            Please wait while we fetch the latest stock information.
          </p>
        </div>
      </div>
    );
  }
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-950">
        <AppSidebar />
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stockData?.name}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                  >
                    {stockData?.symbol}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1 hover:text-blue-400 transition-colors duration-200">
                    <Building2 className="w-4 h-4" />
                    {stockData?.exchange}
                  </span>
                  <span className="flex items-center gap-1 hover:text-purple-400 transition-colors duration-200">
                    <Globe className="w-4 h-4" />
                    {stockData?.country}
                  </span>
                  <span className="hover:text-green-400 transition-colors duration-200">
                    {stockData?.sector}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <ValueComponent symbol={symbol} />
              </div>
            </div>

            {/* Chart Section */}
            <Card className="bg-gray-900 border-gray-800 hover:border-blue-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20">
              <CardHeader>
                <CardTitle className="text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Price Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StockChart
                  historicalData={historicalData}
                  symbol={stockData?.symbol}
                  latestDate={latestDate}
                  //  todayData={todayData}
                />
              </CardContent>
            </Card>
            {/* Buttons After Chart */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* Buy Button */}
              <BuySellModal
                symbol={stockData?.symbol}
                currentPrice={0}
              ></BuySellModal>
              {/* Ask AI Button */}
              {/* <button className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md transition-all duration-300 hover:bg-blue-500 hover:shadow-blue-400/40 hover:shadow-[0_0_12px]">
    <Bot className="w-5 h-5" />
    Ask AI
  </button> */}
              {/* <AskAIModal /> */}
            </div>
            {/* Company Overview */}
            <Card className="bg-gray-900 border-gray-800 hover:border-purple-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20">
              <CardHeader>
                <CardTitle className="text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Company Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {stockData?.description}
                </p>
                <Separator className="my-4 bg-gray-700" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="hover:bg-gray-800/50 p-2 rounded-lg transition-all duration-200">
                    <span className="text-gray-400">Website:</span>
                    <a
                      href={stockData?.officialsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-400 hover:text-blue-300 transition-all duration-300 hover:drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]"
                    >
                      {stockData?.officialsite}
                    </a>
                  </div>
                  <div className="hover:bg-gray-800/50 p-2 rounded-lg transition-all duration-200">
                    <span className="text-gray-400">Address:</span>
                    <span className="block text-white">
                      {stockData?.address}
                    </span>
                  </div>
                  <div className="hover:bg-gray-800/50 p-2 rounded-lg transition-all duration-200">
                    <span className="text-gray-400">Industry:</span>
                    <span className="block text-white">
                      {stockData?.industry}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <StockMetrics stockData={stockData} />

            {/* Financial Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800 hover:border-green-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400 drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
                    <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      Financial Performance
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-200">
                      <div className="text-gray-400 text-sm">Revenue (TTM)</div>
                      <div className="text-xl font-semibold text-white hover:text-green-400 transition-colors duration-200">
                        {formatNumber(stockData?.revenuettm, "$")}
                      </div>
                    </div>
                    <div className="hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-200">
                      <div className="text-gray-400 text-sm">
                        Gross Profit (TTM)
                      </div>
                      <div className="text-xl font-semibold text-white hover:text-green-400 transition-colors duration-200">
                        {formatNumber(stockData?.grossprofitttm, "$")}
                      </div>
                    </div>
                    <div className="hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-200">
                      <div className="text-gray-400 text-sm">EBITDA</div>
                      <div className="text-xl font-semibold text-white hover:text-green-400 transition-colors duration-200">
                        {formatNumber(stockData?.ebitda, "$")}
                      </div>
                    </div>
                    <div className="hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-200">
                      <div className="text-gray-400 text-sm">Profit Margin</div>
                      <div className="text-xl font-semibold text-white hover:text-green-400 transition-colors duration-200">
                        {formatPercentage(stockData?.profitmargin)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 hover:border-yellow-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-900/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_4px_rgba(234,179,8,0.4)]" />
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      Analyst Ratings
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-200">
                    <div className="text-gray-400 text-sm">Target Price</div>
                    <div className="text-2xl font-bold text-white hover:text-yellow-400 transition-colors duration-200">
                      ${parseFloat(stockData?.analysttargetprice)?.toFixed(2)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center hover:bg-green-900/20 p-2 rounded-lg transition-all duration-200">
                      <div className="text-green-400 font-semibold hover:drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]">
                        {parseInt(stockData?.analystratingstrongbuy) +
                          parseInt(stockData?.analystratingbuy)}
                      </div>
                      <div className="text-gray-400">Buy</div>
                    </div>
                    <div className="text-center hover:bg-yellow-900/20 p-2 rounded-lg transition-all duration-200">
                      <div className="text-yellow-400 font-semibold hover:drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]">
                        {stockData?.analystratinghold}
                      </div>
                      <div className="text-gray-400">Hold</div>
                    </div>
                    <div className="text-center hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200">
                      <div className="text-red-400 font-semibold hover:drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]">
                        {parseInt(stockData?.analystratingsell) +
                          parseInt(stockData?.analystratingstrongsell)}
                      </div>
                      <div className="text-gray-400">Sell</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SingleStockPage;
