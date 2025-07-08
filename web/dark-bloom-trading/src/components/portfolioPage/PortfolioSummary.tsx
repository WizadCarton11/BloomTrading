
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
export const PortfolioSummary = ({totalValue,totalCost, totalGainLoss, totalGainLossPercent,
  formatCurrency, formatPercent
})=>{

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700 hover:bg-gradient-to-br hover:from-cyan-900/30 hover:to-slate-800 hover:border-cyan-400/70 hover:shadow-2xl hover:shadow-cyan-400/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center group-hover:text-cyan-300 transition-colors duration-300">
              <DollarSign className="w-4 h-4 mr-2 group-hover:text-cyan-400" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100 group-hover:text-cyan-100 transition-colors duration-300">
              {formatCurrency(totalValue)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 hover:bg-gradient-to-br hover:from-purple-900/30 hover:to-slate-800 hover:border-purple-400/70 hover:shadow-2xl hover:shadow-purple-400/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center group-hover:text-purple-300 transition-colors duration-300">
              <PieChart className="w-4 h-4 mr-2 group-hover:text-purple-400" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100 group-hover:text-purple-100 transition-colors duration-300">
              {formatCurrency(totalCost)}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-slate-800 border-slate-700 hover:scale-105 transition-all duration-300 cursor-pointer group ${
            totalGainLoss >= 0
              ? "hover:bg-gradient-to-br hover:from-emerald-900/30 hover:to-slate-800 hover:border-emerald-400/70 hover:shadow-2xl hover:shadow-emerald-400/20"
              : "hover:bg-gradient-to-br hover:from-rose-900/30 hover:to-slate-800 hover:border-rose-400/70 hover:shadow-2xl hover:shadow-rose-400/20"
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className={`text-sm font-medium text-slate-300 flex items-center transition-colors duration-300 ${
                totalGainLoss >= 0
                  ? "group-hover:text-emerald-300"
                  : "group-hover:text-rose-300"
              }`}
            >
              {totalGainLoss >= 0 ? (
                <TrendingUp
                  className={`w-4 h-4 mr-2 ${
                    totalGainLoss >= 0
                      ? "group-hover:text-emerald-400"
                      : "group-hover:text-rose-400"
                  }`}
                />
              ) : (
                <TrendingDown
                  className={`w-4 h-4 mr-2 ${
                    totalGainLoss >= 0
                      ? "group-hover:text-emerald-400"
                      : "group-hover:text-rose-400"
                  }`}
                />
              )}
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalGainLoss >= 0
                  ? "text-green-400 group-hover:text-emerald-200"
                  : "text-red-400 group-hover:text-rose-200"
              } transition-colors duration-300`}
            >
              {formatCurrency(totalGainLoss)}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-slate-800 border-slate-700 hover:scale-105 transition-all duration-300 cursor-pointer group ${
            Number(totalGainLossPercent) >= 0
              ? "hover:bg-gradient-to-br hover:from-teal-900/30 hover:to-slate-800 hover:border-teal-400/70 hover:shadow-2xl hover:shadow-teal-400/20"
              : "hover:bg-gradient-to-br hover:from-orange-900/30 hover:to-slate-800 hover:border-orange-400/70 hover:shadow-2xl hover:shadow-orange-400/20"
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className={`text-sm font-medium text-slate-300 transition-colors duration-300 ${
                Number(totalGainLossPercent) >= 0
                  ? "group-hover:text-teal-300"
                  : "group-hover:text-orange-300"
              }`}
            >
              Total Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                Number(totalGainLossPercent) >= 0
                  ? "text-green-400 group-hover:text-teal-200"
                  : "text-red-400 group-hover:text-orange-200"
              } transition-colors duration-300`}
            >
              {formatPercent(totalGainLossPercent)}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}