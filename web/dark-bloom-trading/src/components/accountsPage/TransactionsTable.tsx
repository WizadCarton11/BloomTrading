import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "../ui/spinner";
import { BankService } from "@/lib/api";
import { RefreshCw } from "lucide-react";

// Add CSS animation keyframes for the refresh button
const refreshButtonAnimation = `
  @keyframes refresh-button-spin {
    0% { 
      transform: rotate(0deg);
    }
    100% { 
      transform: rotate(360deg);
    }
  }
  
  .animate-refresh-button {
    animation: refresh-button-spin 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  .animate-refresh-button.refreshing {
    color: rgb(34 197 94); /* green-400 */
    filter: drop-shadow(0 0 8px rgba(34,197,94,0.6));
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = refreshButtonAnimation;
  document.head.appendChild(styleSheet);
}

interface Transaction {
  id: string;
  refId?: string;
  type: "DEBIT" | "CREDIT";
  amount: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

const sampleData: Transaction[] = [
  {
    id: "6ad77a80-86d9-4b8b-be55-e6cf30bc7f30",
    type: "DEBIT",
    amount: "0.000000000000000000000000000000",
    createdAt: "2025-07-07 17:32:12.323",
    updatedAt: "2025-07-07 17:32:12.323",
  },
  {
    id: "1bb037ee-4cac-402a-be06-751f047611a5",
    refId: "21b7d94b-598b-4043-a824-7c94ae054f56",
    type: "CREDIT",
    amount: "200.000000000000000000000000000000",
    createdAt: "2025-07-09 13:16:22.073",
    updatedAt: "2025-07-09 13:16:27.521",
    description: "Sold stock AAPL for 200 Dollars for 50 shares on average price 10"
  },
  {
    id: "2c3d4e5f-6a7b-8c9d-e0f1-2a3b4c5d6e7f",
    type: "DEBIT",
    amount: "50.000000000000000000000000000000",
    createdAt: "2025-07-10 09:45:00.000",
    updatedAt: "2025-07-10 09:45:00.000",
    description: "Bought stock TSLA for 50 Dollars for 5 shares on average price 10"
  },
  {
    id: "3d4e5f6a-7b8c-9d0e-1f2a3b4c5d6e",
    type: "CREDIT",
    amount: "100.000000000000000000000000000000",
    createdAt: "2025-07-11 11:30:00.000",
    updatedAt: "2025-07-11 11:30:00.000",
    description: "Sold stock GOOGL for 100 Dollars for 10 shares on average price 10"
  },
];

const ITEMS_PER_PAGE = 10;

export default function TransactionsTab({accountNumber}: { accountNumber: string }) {
  const [page, setPage] = useState(1);
  const [transactionData, setTransactionData] = useState<Transaction[]>();
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchTransactionData = async () => {
    try {
      // Simulate an API call to fetch transaction data
      // Replace this with your actual API call
      const response = await BankService.get(`/api/accounts/${accountNumber}/transactions?page=${page}&limit=${ITEMS_PER_PAGE}`);
      setTransactionData(response.data.data.transactions);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    }
  };

  const handleRefresh = (e: React.MouseEvent<HTMLButtonElement>) => {
    fetchTransactionData();
    
    // Add animation class and remove it after animation completes
    const button = e.currentTarget;
    const icon = button.querySelector('.refresh-button-icon');
    const span = button.querySelector('.refresh-button-text');
    
    // Remove existing animation class if present
    icon?.classList.remove('animate-refresh-button', 'refreshing');
    
    // Trigger reflow to ensure class removal takes effect
    button.offsetHeight;
    
    // Add animation class
    icon?.classList.add('animate-refresh-button', 'refreshing');
    
    // Update button text
    if (span) {
      span.textContent = 'Refreshing...';
    }
    
    // Reset text after animation
    setTimeout(() => {
      if (span) {
        span.textContent = 'Refresh';
      }
    }, 2000);
  };

  useEffect(() => {
    fetchTransactionData();
  }, [accountNumber, page]);
    if (!transactionData) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      )
    }
  const paginatedData = transactionData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // const totalPages = Math.ceil(transactionData.length / ITEMS_PER_PAGE);
  return (
    <div className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Transaction History
        </h2>
        <Button
          onClick={handleRefresh}
          className="bg-slate-800/80 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-green-600 text-slate-200 hover:text-white font-medium px-6 py-2 rounded-md border border-slate-600/50 hover:border-green-500/70 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:scale-105 flex items-center space-x-2 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-green-400/20 to-emerald-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <RefreshCw className="refresh-button-icon h-4 w-4 relative z-10 transition-all duration-300 group-hover:rotate-180 group-hover:text-green-300" />
          <span className="refresh-button-text relative z-10 transition-all duration-300 group-hover:text-green-100">
            Refresh
          </span>
        </Button>
      </div>
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-700/50 bg-slate-800/50">
              <TableHead className="text-slate-200 font-semibold py-4 px-6">ID</TableHead>
              <TableHead className="text-slate-200 font-semibold py-4 px-6">Type</TableHead>
              <TableHead className="text-slate-200 font-semibold py-4 px-6">Amount</TableHead>
              <TableHead className="text-slate-200 font-semibold py-4 px-6">Created At</TableHead>
              <TableHead className="text-slate-200 font-semibold py-4 px-6">Updated At</TableHead>
              <TableHead className="text-slate-200 font-semibold py-4 px-6">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
    {transactionData.map((tx, index) => (
      <TableRow 
        key={tx.id} 
        className="border-b border-slate-700/30 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
      >
        <TableCell className="py-4 px-6 text-slate-300 font-mono text-sm group-hover:text-blue-400 transition-colors duration-300">
          {tx.id.substring(0, 8)}...
        </TableCell>
        <TableCell className="py-4 px-6">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            tx.type === 'CREDIT' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-green-500/20 shadow-md' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-red-500/20 shadow-md'
          }`}>
            {tx.type}
          </span>
        </TableCell>
        <TableCell className="py-4 px-6 font-mono font-semibold">
          <span className={`${
            tx.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'
          }`}>
            ${parseFloat(tx.amount).toFixed(2)}
          </span>
        </TableCell>
        <TableCell className="py-4 px-6 text-slate-400 text-sm">
          {new Date(tx.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell className="py-4 px-6 text-slate-400 text-sm">
          {new Date(tx.updatedAt).toLocaleDateString()}
        </TableCell>
        <TableCell className="py-4 px-6 text-slate-300 max-w-xs truncate">
          {tx.description || <span className="text-slate-500 italic">No description</span>}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700/30">
        <Button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="bg-slate-800/80 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-blue-600 disabled:bg-slate-900/50 disabled:text-slate-500 text-slate-200 hover:text-white font-medium px-8 py-3 rounded-md border border-slate-600/50 hover:border-blue-500/70 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 disabled:border-slate-800/50 disabled:hover:shadow-none disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          ← Previous
        </Button>
        <div className="text-slate-400 font-medium bg-slate-800/30 px-6 py-3 rounded-md border border-slate-700/40 backdrop-blur-sm">
          Page <span className="text-slate-200 font-semibold mx-1">{page}</span> of <span className="text-slate-200 font-semibold mx-1">{totalPages}</span>
        </div>
        <Button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="bg-slate-800/80 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 disabled:bg-slate-900/50 disabled:text-slate-500 text-slate-200 hover:text-white font-medium px-8 py-3 rounded-md border border-slate-600/50 hover:border-blue-500/70 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 disabled:border-slate-800/50 disabled:hover:shadow-none disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
