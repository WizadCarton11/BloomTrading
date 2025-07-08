import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DollarSign,
} from "lucide-react";
import { BankService } from "@/lib/api";
export const AccountBalanceCard = ({formatCurrency}) =>{
  const [accountBalance, setAccountBalance] = useState(0);
  useEffect(() => {
    const getAccountBalance = async () => {
      try {
        const response = await BankService.get('/api/accounts',{}, "getAccountBalance");
        if (response && response.data){
          const responseData= response.data.data[0];
          console.log("Account Balance Response: ", responseData);
          setAccountBalance(Number(responseData.balance))
        }
      } catch (error) {
        
      }
    }
    getAccountBalance();
  }
  , [])

  if (accountBalance === 0) {
    return (
      <Card className="bg-indigo-900/30 border-indigo-600/50 hover:border-blue-500 hover:bg-indigo-800/40 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-slate-300">Account Balance</p>
              <p className="text-lg font-semibold text-blue-400">
                Loading...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="bg-indigo-900/30 border-indigo-600/50 hover:border-blue-500 hover:bg-indigo-800/40 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
                    <div>
                      <p className="text-sm text-slate-300">Account Balance</p>
                      <p className="text-lg font-semibold text-blue-400">
                        {formatCurrency(accountBalance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
  )
}
