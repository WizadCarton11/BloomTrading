

import AccountOverview from "@/components/accountsPage/AccountOverview";
import TransactionsTable from "@/components/accountsPage/TransactionsTable";
import { AppSidebar } from "@/components/home/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { BankService } from "@/lib/api";
import { useEffect, useState } from "react";

interface AccountData {
  balance: number;
  accountNumber: string;
}
const AccountPage = () => {
  // Mock data - in a real app, this would come from an API
//   const accountData = {
//     balance: 1483.71,
//     accountNumber: "6ad77a80-86d9-4b8b-be55-e6cf30bc7f30"
//   };
    const [accountData, setAccountData] = useState<AccountData>();
    const [loading, setLoading] = useState(true);
    const fetchAccountData = async () => {
      try {
        const response = await BankService.get("/api/accounts");
        setAccountData(response.data.data[0]); 
        // Simulate an API call to fetch account data
      //   const response = await BankService.get("/api/bank/get_account_data");
      //   setAccountData(data);
      } catch (error) {
        console.error("Error fetching account data:", error);
      }
    };
    const onRefresh = async () => {
      fetchAccountData();
    }
    useEffect(() => {
      fetchAccountData();
    }, []);

    if (!accountData) {
      
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-950 ">
          <AppSidebar />
          <div className="min-h-screen w-full bg-background flex items-center justify-center">
            <Spinner />
          </div>
        </div>
      </SidebarProvider>
    );
    }
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-950 ">
        <AppSidebar />
    <div className="min-h-screen w-full bg-background">
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Account Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive overview of your trading account, balance, and transaction history.
          </p>
        </div>
        
        <AccountOverview 
  onRefresh={onRefresh}
          balance={accountData?.balance}
          accountNumber={accountData?.accountNumber}
        />
        
        <TransactionsTable accountNumber={accountData?.accountNumber}/>
      </main>
    </div>
    </div>
    </SidebarProvider>
  );
};

export default AccountPage;
