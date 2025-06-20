
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Pie } from "recharts";

interface Holding {
  symbol: string;
  value: number;
  allocation: number;
  gain: number;
}

interface PortfolioAllocationChartProps {
  holdings: Holding[];
}

export function PortfolioAllocationChart({ holdings }: PortfolioAllocationChartProps) {
  const chartConfig = {
    AAPL: {
      label: "Apple",
      color: "#3b82f6",
    },
    GOOGL: {
      label: "Google",
      color: "#10b981",
    },
    MSFT: {
      label: "Microsoft",
      color: "#8b5cf6",
    },
    TSLA: {
      label: "Tesla",
      color: "#f59e0b",
    },
    Others: {
      label: "Others",
      color: "#6b7280",
    },
  };

  const pieData = holdings.map((holding) => ({
    name: holding.symbol,
    value: holding.allocation,
    fill: chartConfig[holding.symbol as keyof typeof chartConfig]?.color || "#6b7280",
  }));

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#6b7280"];

  return (
    <Card className="relative bg-gray-800/90 border-gray-700/50 backdrop-blur-sm shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg blur-xl"></div>
      <div className="relative">
        <CardHeader>
          <CardTitle className="text-white">Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {holdings.map((holding, index) => (
              <div key={holding.symbol} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-300">
                  {holding.symbol} ({holding.allocation}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
