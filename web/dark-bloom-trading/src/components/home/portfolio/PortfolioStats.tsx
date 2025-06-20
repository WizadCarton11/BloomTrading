
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, PieChart, Target } from "lucide-react";

interface PortfolioData {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  totalGain: number;
  totalGainPercent: number;
  holdings: Array<{
    symbol: string;
    value: number;
    allocation: number;
    gain: number;
  }>;
}

interface PortfolioStatsProps {
  portfolioData: PortfolioData;
}

export function PortfolioStats({ portfolioData }: PortfolioStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="relative bg-gradient-to-br from-blue-950/80 to-blue-900/80 border-blue-400/50 hover:border-blue-300/80 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 before:absolute before:inset-0 before:bg-blue-500/10 before:blur-xl before:-z-10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-100">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-50">
            ${portfolioData.totalValue.toLocaleString()}
          </div>
          <p className="text-xs text-blue-200/80 mt-1">
            Portfolio balance
          </p>
        </CardContent>
      </Card>

      <Card className="relative bg-gradient-to-br from-emerald-950/80 to-emerald-900/80 border-emerald-400/50 hover:border-emerald-300/80 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 before:absolute before:inset-0 before:bg-emerald-500/10 before:blur-xl before:-z-10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-100">Day Change</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-50">
            +${portfolioData.dayChange.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-200/80 mt-1">
            +{portfolioData.dayChangePercent}% today
          </p>
        </CardContent>
      </Card>

      <Card className="relative bg-gradient-to-br from-purple-950/80 to-purple-900/80 border-purple-400/50 hover:border-purple-300/80 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 before:absolute before:inset-0 before:bg-purple-500/10 before:blur-xl before:-z-10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-100">Total Gain</CardTitle>
          <Target className="h-4 w-4 text-purple-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-50">
            +${portfolioData.totalGain.toLocaleString()}
          </div>
          <p className="text-xs text-purple-200/80 mt-1">
            +{portfolioData.totalGainPercent}% all time
          </p>
        </CardContent>
      </Card>

      <Card className="relative bg-gradient-to-br from-orange-950/80 to-orange-900/80 border-orange-400/50 hover:border-orange-300/80 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 before:absolute before:inset-0 before:bg-orange-500/10 before:blur-xl before:-z-10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-100">Holdings</CardTitle>
          <PieChart className="h-4 w-4 text-orange-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-50">
            {portfolioData.holdings.length}
          </div>
          <p className="text-xs text-orange-200/80 mt-1">
            Active positions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
