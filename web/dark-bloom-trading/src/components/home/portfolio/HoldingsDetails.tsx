
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Holding {
  symbol: string;
  value: number;
  allocation: number;
  gain: number;
}

interface HoldingsDetailsProps {
  holdings: Holding[];
}

export function HoldingsDetails({ holdings }: HoldingsDetailsProps) {
  return (
    <Card className="relative bg-gray-800/90 border-gray-700/50 backdrop-blur-sm shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-lg blur-xl"></div>
      <div className="relative">
        <CardHeader>
          <CardTitle className="text-white">Holdings Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {holdings.map((holding, index) => (
              <div key={holding.symbol} className="flex items-center justify-between group hover:bg-gray-700/30 p-3 rounded-lg transition-all duration-200">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`font-semibold text-white min-w-[60px] px-2 py-1 rounded ${
                    index === 0 ? 'bg-blue-600/20 text-blue-300' : 
                    index === 1 ? 'bg-emerald-600/20 text-emerald-300' :
                    index === 2 ? 'bg-purple-600/20 text-purple-300' :
                    index === 3 ? 'bg-orange-600/20 text-orange-300' :
                    'bg-gray-600/20 text-gray-300'
                  }`}>
                    {holding.symbol}
                  </div>
                  <div className="flex-1">
                    <Progress 
                      value={holding.allocation} 
                      className="h-3 bg-gray-700" 
                    />
                  </div>
                  <div className="text-sm text-gray-400 min-w-[50px] text-right">
                    {holding.allocation}%
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-8">
                  <div className="text-white font-medium">
                    ${holding.value.toLocaleString()}
                  </div>
                  <div className={`text-sm font-medium min-w-[60px] text-right px-2 py-1 rounded ${
                    holding.gain >= 0 ? 'text-green-300 bg-green-600/20' : 'text-red-300 bg-red-600/20'
                  }`}>
                    {holding.gain >= 0 ? '+' : ''}{holding.gain}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
