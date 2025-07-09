import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard, TrendingUp, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Add CSS animation keyframes
const refreshAnimation = `
  @keyframes refresh-spin {
    0% { 
      transform: rotate(0deg);
      color: rgb(148 163 184); /* slate-400 */
    }
    10% { 
      transform: rotate(36deg);
      color: rgb(96 165 250); /* blue-400 */
    }
    90% { 
      transform: rotate(324deg);
      color: rgb(96 165 250); /* blue-400 */
    }
    100% { 
      transform: rotate(360deg);
      color: rgb(148 163 184); /* slate-400 */
    }
  }
  
  .animate-refresh {
    animation: refresh-spin 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = refreshAnimation;
  document.head.appendChild(styleSheet);
}

interface AccountOverviewProps {
  balance: number;
  accountNumber: string;
  onRefresh?: () => void;
  setLoading?: any
}

const AccountOverview = ({ balance, accountNumber, onRefresh }: AccountOverviewProps) => {
  const { toast } = useToast();

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(accountNumber);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
    });
  };

  const handleRefresh = (e: React.MouseEvent<HTMLButtonElement>) => {
    onRefresh?.();
    
    // Add animation class and remove it after animation completes
    const button = e.currentTarget;
    const icon = button.querySelector('.refresh-icon');
    
    // Remove existing animation class if present
    icon?.classList.remove('animate-refresh');
    
    // Trigger reflow to ensure class removal takes effect
    button.offsetHeight;
    
    // Add animation class
    icon?.classList.add('animate-refresh');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:border-blue-500/30 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
            Account Balance
          </CardTitle>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-full bg-slate-800/60 border border-slate-600/40 hover:bg-slate-700/60 hover:border-slate-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-110 group/refresh"
            >
              <RefreshCw className="refresh-icon h-4 w-4 text-slate-400 group-hover/refresh:text-blue-400 transition-colors duration-300" />
            </button>
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Wallet className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2 group-hover:from-green-300 group-hover:to-emerald-300 transition-all duration-300">
            {formatCurrency(balance)}
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span>Available balance</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-500/30 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
            Account Number
          </CardTitle>
          <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <CreditCard className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-4">
            <div className="font-mono text-sm bg-slate-800/60 border border-slate-700/50 p-4 rounded-lg break-all text-slate-200 hover:bg-slate-800/80 transition-all duration-300 hover:border-slate-600/50">
              {accountNumber}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAccountNumber}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 hover:border-purple-400/50 text-slate-200 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <Copy className="h-4 w-4" />
              <span className="font-medium">Copy Account</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountOverview;
