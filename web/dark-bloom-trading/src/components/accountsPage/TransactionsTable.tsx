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

  .tooltip {
    position: absolute;
    background: rgba(30, 41, 59, 0.95);
    color: #e2e8f0;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.875rem;
    z-index: 1000;
    max-width: 300px;
    word-wrap: break-word;
    border: 1px solid rgba(71, 85, 105, 0.5);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
    pointer-events: none;
    opacity: 0;
    transform: translateY(5px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  
  .tooltip.show {
    opacity: 1;
    transform: translateY(0);
  }
  
  .tooltip::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid rgba(30, 41, 59, 0.95);
  }
`;

// Inject styles only once
if (typeof document !== 'undefined' && !document.querySelector('#transaction-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'transaction-styles';
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

const ITEMS_PER_PAGE = 10;

export default function TransactionsTab({ accountNumber }: { accountNumber: string }) {
  const [page, setPage] = useState(1);
  const [transactionData, setTransactionData] = useState<Transaction[]>();
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [tooltip, setTooltip] = useState({
    show: false,
    text: '',
    position: { x: 0, y: 0 }
  });

  const fetchTransactionData = async () => {
    setIsLoading(true);
    try {
      const response = await BankService.get(`/api/accounts/${accountNumber}/transactions?page=${page}&limit=${ITEMS_PER_PAGE}`);
      setTransactionData(response.data.data.transactions);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    } finally {
      setIsLoading(false);
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

  const handleMouseEnter = (e: React.MouseEvent, description: string) => {
    if (!description) return;
    
    const cell = e.currentTarget;
    const tableContainer = cell.closest('.table-container');
    
    if (tableContainer) {
      const cellRect = cell.getBoundingClientRect();
      const containerRect = tableContainer.getBoundingClientRect();
      
      setTooltip({
        show: true,
        text: description,
        position: {
          x: cellRect.left - containerRect.left + cellRect.width / 2 - 150, // Center relative to container
          y: cellRect.top - containerRect.top - 40 // Position above the element relative to container
        }
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    fetchTransactionData();
  }, [accountNumber, page]);

  if (!transactionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Transaction History
        </h2>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          className="bg-slate-800/80 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-green-600 text-slate-200 hover:text-white font-medium px-6 py-2 rounded-md border border-slate-600/50 hover:border-green-500/70 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:scale-105 flex items-center space-x-2 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-green-400/20 to-emerald-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <RefreshCw className="refresh-button-icon h-4 w-4 relative z-10 transition-all duration-300 group-hover:rotate-180 group-hover:text-green-300" />
          <span className="refresh-button-text relative z-10 transition-all duration-300 group-hover:text-green-100">
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </span>
        </Button>
      </div>
      
      <div className="table-container relative rounded-lg border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-700/50 bg-slate-800/50">
              <TableHead className="text-slate-200 font-semibold py-4 px-6">ID</TableHead>
              <TableHead className="text-slate-200 font-semibold py-4 px-6">Type</TableHead>
              <TableHead className="text-slate-200 font-semibold py-4 px-6">Amount</TableHead>
              <TableHead className="text-slate-200 font-semibold py-4 px-6">Created At</TableHead>
              <TableHead className="text-slate-200 font-semibold py-4 px-6">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionData.map((tx) => (
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
                <TableCell
                  className="py-4 px-6 text-slate-300 max-w-xs truncate cursor-pointer hover:text-blue-400 transition-colors duration-300"
                  onMouseEnter={(e) => handleMouseEnter(e, tx.description || '')}
                  onMouseLeave={handleMouseLeave}
                >
                  {tx.description || <span className="text-slate-500 italic">No description</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {tooltip.show && (
          <div 
            className="tooltip show"
            style={{
              position: 'absolute',
              left: tooltip.position.x,
              top: tooltip.position.y,
              zIndex: 1000
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* {tooltip.show && (
        <div 
          className="tooltip show"
          style={{
            position: 'fixed',
            left: tooltip.position.x,
            top: tooltip.position.y,
            zIndex: 1000
          }}
        >
          {tooltip.text}
        </div>
      )} */}

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