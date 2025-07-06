import { memo, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MarketService } from "@/lib/api";
import { useSingleStockSubscription } from "@/hooks/useStockSubscription";
import React, { useCallback, useMemo } from 'react';





const sortData = (period: string, data: any[], todaDate: any) => {
  const filtered = data.filter((d) => {
    const date = new Date(d.formattedDate);
    const today = new Date(todaDate);

    if (period === "week") {
      const cutoff = new Date(today);
      cutoff.setDate(today.getDate() - 7);
      return date >= cutoff;
    } else if (period === "month") {
      const cutoff = new Date(today);
      cutoff.setDate(today.getDate() - 29);
      return date >= cutoff;
    } else if (period === "year") {
      const cutoff = new Date(today);
      cutoff.setFullYear(today.getFullYear() - 1);
      return date >= cutoff;
    } else if (period === "today") {
      return false;
    }

    return true; // 'all' or unrecognized periods
  });

  return filtered.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};
const StockChart = ({ historicalData = [], symbol, latestDate }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // console.log("Rendering StockChart for symbol:", symbol);
  const { data: liveStockData } = useSingleStockSubscription(symbol);

  // Memoize period configurations
  const periodConfigs = useMemo(() => ({
    today: {
      gradient: { from: 'blue-600', to: 'blue-700', shadow: 'blue-500/25' },
      tickCount: 6,
      maxDataPoints: 10000 // Limit data points for performance
    },
    week: {
      gradient: { from: 'purple-600', to: 'purple-700', shadow: 'purple-500/25' },
      tickCount: 7
    },
    month: {
      gradient: { from: 'green-600', to: 'green-700', shadow: 'green-500/25' },
      tickCount: 8
    },
    year: {
      gradient: { from: 'yellow-600', to: 'yellow-700', shadow: 'yellow-500/25' },
      tickCount: 12
    },
    all: {
      gradient: { from: 'cyan-600', to: 'cyan-700', shadow: 'cyan-500/25' },
      tickCount: 10
    }
  }), []);



  // Handle live data updates for "today" period
  useEffect(() => {
    if (selectedPeriod !== "today" || !liveStockData?.price) return;

    const price = parseFloat(liveStockData.price);
    if (isNaN(price)) return;

    setFilteredData(prev => {
      const now = new Date();
      const formattedDate = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });

      const newPoint = {
        formattedDate,
        price,
        date: now.toISOString(),
        timestamp: now.getTime()
      };

      const updated = [...prev, newPoint];
      const config = periodConfigs[selectedPeriod];
      
      // Limit data points for performance
      if (config.maxDataPoints && updated.length > config.maxDataPoints) {
        return updated.slice(-config.maxDataPoints);
      }
      
      return updated;
    });
  }, [liveStockData, selectedPeriod, periodConfigs]);

  // Handle period changes and data fetching
  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;
      console.log("Fetching data for symbol:", symbol, "Period:", selectedPeriod);
      setLoading(true);
      setError(null);
      
      try {
        if (selectedPeriod === "today") {
          const result = await MarketService.get(
            `/api/stock/get_today_data/${symbol}`,
            {},
            `getTodayData${symbol}`
          );
          
          if (result?.data?.data && Array.isArray(result.data.data)) {
            setFilteredData(result.data.data);
          } else {
            setFilteredData([]);
          }
        } else {
          const result = sortData(selectedPeriod, historicalData, latestDate);
          setFilteredData(result);
        }
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data. Please try again.');
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod, historicalData, symbol, sortData]);

  // Memoized tooltip formatter
  const formatTooltip = useCallback((value, name) => {
    if (name === "price") {
      return [`$${parseFloat(value).toFixed(4)}`, "Price"];
    }
    return [value, name];
  }, []);

  // Memoized label formatter
  const formatTooltipLabel = useCallback((label) => {
    const dataPoint = filteredData.find(d => d.formattedDate === label);
    if (dataPoint) {
      const date = new Date(dataPoint.date);
      return selectedPeriod === "today"
        ? dataPoint.formattedDate
        : date.toLocaleDateString([], { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
    }
    return label;
  }, [filteredData, selectedPeriod]);

  // Memoized Y-axis formatter
  const formatYAxis = useCallback((value) => {
    if (typeof value !== 'number') return '$0';
    return `$${value.toFixed(4)}`;
  }, []);

  // Memoized domain calculation
  const yAxisDomain = useMemo(() => {
    if (!filteredData.length) return ["dataMin - 1", "dataMax + 1"];
    
    const prices = filteredData.map(d => d.price).filter(p => typeof p === 'number');
    if (prices.length === 0) return ["dataMin - 1", "dataMax + 1"];
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.05; // 5% padding
    
    return [min - padding, max + padding];
  }, [filteredData]);

  // Render loading state
  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error Loading Chart</p>
          <p className="text-sm mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs
        value={selectedPeriod}
        onValueChange={setSelectedPeriod}
        className="w-full"
      >
        <div className="flex justify-center mb-6">
          <TabsList className="bg-gray-800/80 border-gray-700 backdrop-blur-sm shadow-lg">
            {Object.entries(periodConfigs).map(([period, config]) => (
              <TabsTrigger
                key={period}
                value={period}
                className={`
                  data-[state=active]:bg-gradient-to-r 
                  data-[state=active]:from-${config.gradient.from} 
                  data-[state=active]:to-${config.gradient.to} 
                  data-[state=active]:text-white 
                  data-[state=active]:shadow-lg 
                  data-[state=active]:shadow-${config.gradient.shadow}
                  text-gray-300 hover:text-white hover:bg-gray-700/50 
                  transition-all duration-300
                `}
              >
                {period === 'today' ? 'Today' : 
                 period === 'week' ? '1 Week' :
                 period === 'month' ? '1 Month' :
                 period === 'year' ? '1 Year' : 'All'}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={selectedPeriod} className="mt-0">
          <div className="h-80 w-full">
            {filteredData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No data available for the selected period</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickCount={periodConfigs[selectedPeriod].tickCount}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    domain={yAxisDomain}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip
                    formatter={formatTooltip}
                    labelFormatter={formatTooltipLabel}
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      color: "#F9FAFB",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="url(#colorGradient)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={selectedPeriod !== "today"}
                    animateNewValues={selectedPeriod === "today"}
                    activeDot={{
                      r: 6,
                      fill: "#3B82F6",
                      stroke: "#1E40AF",
                      strokeWidth: 2,
                      filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))",
                    }}
                  />
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockChart;