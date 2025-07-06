
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";
import { StockInfo } from "@/pages/SingleStockPage";


interface StockData {
  [key: string]: string;
}

interface StockMetricsProps {
  stockData: StockData;
}

const formatNumber = (value: string | number, prefix = "", suffix = "") => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "N/A";
  if (num >= 1e12) return `${prefix}${(num / 1e12).toFixed(2)}T${suffix}`;
  if (num >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)}B${suffix}`;
  if (num >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)}M${suffix}`;
  if (num >= 1e3) return `${prefix}${(num / 1e3).toFixed(2)}K${suffix}`;
  return `${prefix}${num.toFixed(2)}${suffix}`;
};

const formatPercentage = (value: string) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "N/A";
  return `${(num * 100).toFixed(2)}%`;
};

const StockMetrics = ({ stockData }: { stockData: StockInfo}) => {
  const keyMetrics = [
    {
      title: "Market Cap",
      value: formatNumber(stockData.marketcapitalization, "$"),
      icon: <DollarSign className="w-4 h-4 text-green-400" />,
      color: "green"
    },
    {
      title: "P/E Ratio",
      value: stockData.peratio,
      icon: <Activity className="w-4 h-4 text-blue-400" />,
      color: "blue"
    },
    {
      title: "EPS",
      value: `$${stockData.eps}`,
      icon: <TrendingUp className="w-4 h-4 text-purple-400" />,
      color: "purple"
    },
    {
      title: "Dividend Yield",
      value: formatPercentage(stockData.dividendyield),
      icon: <DollarSign className="w-4 h-4 text-yellow-400" />,
      color: "yellow"
    },
    {
      title: "52W High",
      value: `$${stockData["52weekhigh"]}`,
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      color: "emerald"
    },
    {
      title: "52W Low",
      value: `$${stockData["52weeklow"]}`,
      icon: <TrendingDown className="w-4 h-4 text-red-400" />,
      color: "red"
    },
    {
      title: "Beta",
      value: stockData.beta,
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      color: "cyan"
    },
    {
      title: "Book Value",
      value: `$${stockData.bookvalue}`,
      icon: <DollarSign className="w-4 h-4 text-indigo-400" />,
      color: "indigo"
    }
  ];

  const additionalMetrics = [
    { label: "Forward P/E", value: stockData.forwardpe },
    { label: "PEG Ratio", value: stockData.pegratio },
    { label: "Price/Sales", value: stockData.pricetosalesratiottm },
    { label: "Price/Book", value: stockData.pricetobookratio },
    { label: "ROE", value: formatPercentage(stockData.returnonequityttm) },
    { label: "ROA", value: formatPercentage(stockData.returnonassetsttm) },
    { label: "Operating Margin", value: formatPercentage(stockData.operatingmarginttm) },
    { label: "50D MA", value: `$${stockData["50daymovingaverage"]}` },
    { label: "200D MA", value: `$${stockData["200daymovingaverage"]}` },
    { label: "Shares Outstanding", value: formatNumber(stockData.sharesoutstanding) },
    { label: "Float", value: formatNumber(stockData.sharesfloat) },
    { label: "Insider Ownership", value: formatPercentage(stockData.percentinsiders) }
  ];

  const getHoverClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      green: "hover:border-green-800/50 hover:shadow-green-900/20",
      blue: "hover:border-blue-800/50 hover:shadow-blue-900/20",
      purple: "hover:border-purple-800/50 hover:shadow-purple-900/20",
      yellow: "hover:border-yellow-800/50 hover:shadow-yellow-900/20",
      emerald: "hover:border-emerald-800/50 hover:shadow-emerald-900/20",
      red: "hover:border-red-800/50 hover:shadow-red-900/20",
      cyan: "hover:border-cyan-800/50 hover:shadow-cyan-900/20",
      indigo: "hover:border-indigo-800/50 hover:shadow-indigo-900/20"
    };
    return colorMap[color] || "hover:border-gray-700/50 hover:shadow-gray-900/20";
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index} className={`bg-gray-900 border-gray-800 transition-all duration-300 hover:shadow-lg ${getHoverClasses(metric.color)} group cursor-pointer`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="transition-all duration-300 group-hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]">
                  {metric.icon}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                    {metric.title}
                  </div>
                  <div className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-200">
                    {metric.value}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Metrics Table */}
      <Card className="bg-gray-900 border-gray-800 hover:border-blue-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20">
        <CardHeader>
          <CardTitle className="text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Key Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/30 px-2 rounded transition-all duration-200 group">
                <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-200">
                  {metric.label}
                </span>
                <span className="text-white font-medium group-hover:text-blue-300 transition-colors duration-200">
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Indicators */}
      <Card className="bg-gray-900 border-gray-800 hover:border-purple-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20">
        <CardHeader>
          <CardTitle className="text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Growth Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                  Quarterly Earnings Growth
                </span>
                <div className="flex items-center gap-1">
                  {parseFloat(stockData.quarterlyearningsgrowthyoy) >= 0 ? 
                    <TrendingUp className="w-4 h-4 text-green-400 group-hover:drop-shadow-[0_0_4px_rgba(34,197,94,0.5)] transition-all duration-200" /> : 
                    <TrendingDown className="w-4 h-4 text-red-400 group-hover:drop-shadow-[0_0_4px_rgba(239,68,68,0.5)] transition-all duration-200" />
                  }
                  <span className={`transition-all duration-200 ${parseFloat(stockData.quarterlyearningsgrowthyoy) >= 0 ? 'text-green-400 group-hover:text-green-300' : 'text-red-400 group-hover:text-red-300'}`}>
                    {formatPercentage(stockData.quarterlyearningsgrowthyoy)}
                  </span>
                </div>
              </div>
            </div>
            <div className="hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-200 group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                  Quarterly Revenue Growth
                </span>
                <div className="flex items-center gap-1">
                  {parseFloat(stockData.quarterlyrevenuegrowthyoy) >= 0 ? 
                    <TrendingUp className="w-4 h-4 text-green-400 group-hover:drop-shadow-[0_0_4px_rgba(34,197,94,0.5)] transition-all duration-200" /> : 
                    <TrendingDown className="w-4 h-4 text-red-400 group-hover:drop-shadow-[0_0_4px_rgba(239,68,68,0.5)] transition-all duration-200" />
                  }
                  <span className={`transition-all duration-200 ${parseFloat(stockData.quarterlyrevenuegrowthyoy) >= 0 ? 'text-green-400 group-hover:text-green-300' : 'text-red-400 group-hover:text-red-300'}`}>
                    {formatPercentage(stockData.quarterlyrevenuegrowthyoy)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dividend Information */}
      <Card className="bg-gray-900 border-gray-800 hover:border-green-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20">
        <CardHeader>
          <CardTitle className="text-white bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Dividend Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center hover:bg-gray-800/30 p-4 rounded-lg transition-all duration-200 group">
              <div className="text-2xl font-bold text-white group-hover:text-green-300 transition-colors duration-200">
                ${stockData.dividendpershare}
              </div>
              <div className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-200">
                Annual Dividend
              </div>
            </div>
            <div className="text-center hover:bg-gray-800/30 p-4 rounded-lg transition-all duration-200 group">
              <div className="text-2xl font-bold text-white group-hover:text-green-300 transition-colors duration-200">
                {formatPercentage(stockData.dividendyield)}
              </div>
              <div className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-200">
                Dividend Yield
              </div>
            </div>
            <div className="text-center hover:bg-gray-800/30 p-4 rounded-lg transition-all duration-200 group">
              <div className="text-lg font-medium text-white group-hover:text-green-300 transition-colors duration-200">
                {new Date(stockData.dividenddate).toLocaleDateString()}
              </div>
              <div className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-200">
                Next Dividend Date
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockMetrics;
