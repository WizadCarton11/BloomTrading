import { useState, useMemo, useEffect } from "react";
import { StockCard } from "../components/stockMarketPlace/StockCard";
import { SearchBar } from "../components/stockMarketPlace/SearchBar";
import { FilterControls } from "../components/stockMarketPlace/FilterControls";
import { CompareMode } from "../components/stockMarketPlace/CompareMode";
import { Stock } from "../components/data/stockData";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/home/AppSidebar";
import { MarketService } from "@/lib/api";
import { useSingleStockSubscription, useStockSubscription } from "@/hooks/useStockSubscription";
import { useNavigate } from "react-router-dom";

// Define response shape
interface StockApiResponse {
  stocks: Stock[];
  allStocksList: string[];
  totalCount: number;
  sectors?: string[];
}

export default function StockMarketplace() {
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [sortBy, setSortBy] = useState("symbol");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [stockList, setStockList] = useState<string[]>([]);
  // Compare mode states
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSubMode, setCompareSubMode] = useState<'sector' | 'custom'>('sector');
  const [compareSelectedSector, setCompareSelectedSector] = useState<string>("");
  const [selectedStockIds, setSelectedStockIds] = useState<string[]>([]);
  const [sectorList, setSectorList] = useState<string[]>([]);
  // Fetch stock data from backend
  useEffect(() => {
    const fetchStockData = async () => {
      // const {symbol, data}= useSingleStockSubscription("AAPL")
      try {
        const response = await MarketService.get("/api/stock/stocksList", {}, "stockData");
        const result = response?.data?.data as StockApiResponse;
        if (result) {
          result.stocks = result.stocks.map(stock => ({
            ...stock,
            visible: true, // Add visibility flag
          }));
          console.log("Fetched stock data:", result);
          setStockData(result.stocks || []);
          setStockList(result.allStocksList || []);
          setSectorList(result.sectors || []);
        } else {
          console.warn("Stock data response is empty or malformed.");
        }
      } catch (err) {
        console.error("Error fetching stock data:", err);
      }
    };

    fetchStockData();
  }, []);
  // Unique sectors
  const sectors = useMemo(() => {
    return sectorList.length > 0
    ? ["All Sectors", ...new Set(sectorList)]
      : ["All Sectors"];
  }, [sectorList]);
  
  // Compare sector change
  const handleCompareSectorChange = (sector: string) => {
    setCompareSelectedSector(state => sector);
    if (sector) {
      const sectorStockIds = stockData
        .filter(stock => (stock.sector === sector || sector === "All Sectors"))
        .map(stock => stock.symbol);
      setSelectedStockIds(sectorStockIds);
    } else {
      setSelectedStockIds([]);
    }
  };

  // Custom stock select
  const handleStockSelect = (stockId: string) => {
    if (compareSubMode === 'custom') {
      setSelectedStockIds(prev =>
        prev.includes(stockId)
        ? prev.filter(id => id !== stockId)
        : [...prev, stockId]
      );
    }
  };
  
  const handleClearSelection = () => {
    setSelectedStockIds([]);
    setCompareSelectedSector("");
  };

  const handleToggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    if (isCompareMode) {
      handleClearSelection();
    }
  };
  
  const handleSubModeChange = (mode: 'sector' | 'custom') => {
    setCompareSubMode(mode);
    handleClearSelection();
  };
  const navigation = useNavigate();
  const handleSubmitCompare = () => {
    navigation(`/compare/${selectedStockIds.join(',')}`, {
      state: {
        selectedStocks: stockData.filter(stock => selectedStockIds.includes(stock.symbol)),
      },
    });
  };
  
  // Derived filtered and sorted list
  // const filteredAndSortedStocks = useMemo(() => {
  //   let filtered = stockData.filter((stock) => {
  //     const matchesSearch =
  //       stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       stock.name.toLowerCase().includes(searchTerm.toLowerCase());

  //     const matchesSector =
  //       selectedSector === "All Sectors" || stock.sector === selectedSector;

  //     return matchesSearch && matchesSector;
  //   });
    
    
  //   if (isCompareMode && compareSubMode === 'sector' && selectedStockIds.length > 0) {
  //     filtered = filtered.filter(stock => selectedStockIds.includes(stock.id));
  //   }
    
  //   filtered.sort((a, b) => {
  //     let aValue: any, bValue: any;
      
  //     switch (sortBy) {
  //       case "price":
  //         aValue = a.price;
  //         bValue = b.price;
  //         break;
  //         case "change":
  //           aValue = a.change;
  //           bValue = b.change;
  //           break;
  //           case "volume":
  //             aValue = a.volume;
  //             bValue = b.volume;
  //             break;
  //             case "marketCap":
  //               // market cap is number | bigint
  //         // aValue = parseFloat(a.marketCap.replace(/[$TB]/g, '')) * (a.marketCap.includes('T') ? 1000 : 1);
  //         // bValue = parseFloat(b.marketCap.replace(/[$TB]/g, '')) * (b.marketCap.includes('T') ? 1000 : 1);
  //         aValue = typeof a.marketCap === 'bigint' ? Number(a.marketCap) : a.marketCap;
  //         bValue = typeof b.marketCap === 'bigint' ? Number(b.marketCap) : b.marketCap;
  //         break;
  //       default:
  //         aValue = a.symbol;
  //         bValue = b.symbol;
  //     }
      
  //     return sortOrder === 'asc'
  //       ? aValue > bValue ? 1 : -1
  //       : aValue < bValue ? 1 : -1;
  //     });
      
  //     return filtered;
  //   }, [stockData, searchTerm, selectedSector, sortBy, sortOrder, isCompareMode, compareSubMode, selectedStockIds]);
    useEffect(() => {
  const updatedStockData = [...stockData]  // Make a shallow copy

    .map(stock => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSector =
        selectedSector === "All Sectors" || stock.sector === selectedSector;

      const isInCompareSelection =
        !isCompareMode || compareSubMode !== 'sector' || selectedStockIds.includes(stock.symbol);

      return {
        ...stock,
        visible: matchesSearch && matchesSector && isInCompareSelection,
      };
    })

    .sort((a, b) => {
      let aValue: any, bValue: any;

      // switch (sortBy) {
      //   case "price":
      //     aValue = a.price;
      //     bValue = b.price;
      //     break;
      //     case "change":
      //       aValue = a.change;
      //       bValue = b.change;
      //       break;
      //       case "volume":
      //         aValue = a.volume;
      //         bValue = b.volume;
      //         break;
      //         case "marketCap":
      //           aValue = typeof a.marketCap === 'bigint' ? Number(a.marketCap) : a.marketCap;
      //           bValue = typeof b.marketCap === 'bigint' ? Number(b.marketCap) : b.marketCap;
      //           break;
      //           case "name":
      //             aValue = a.name.toLowerCase().trim();
      //             bValue = b.name.toLowerCase().trim();
      //             break;
      //             default:
      //               aValue = a.symbol;
      //               bValue = b.symbol;
      // }
      if (sortBy === "marketCap") {
        aValue = !(typeof a.marketCap === 'bigint') ? (a.marketCap) : BigInt(a.marketCap);
        bValue = !(typeof b.marketCap === 'bigint') ? (b.marketCap) : BigInt(b.marketCap);
      } else if (sortBy === "name") {
        aValue = a.name.toLowerCase().trim();
        bValue = b.name.toLowerCase().trim();
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }

      return sortOrder === 'asc'
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });

  setStockData(updatedStockData);
}, [
  stockData,
  searchTerm,
  selectedSector,
  sortBy,
  sortOrder,
  isCompareMode,
  compareSubMode,
  selectedStockIds,
]);


    const handleClearFilters = () => {
      setSelectedSector("All Sectors");
      setSortBy("symbol");
      setSortOrder('asc');
      setSearchTerm("");
    };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-950 ">
        <AppSidebar />

        <div className="h-screen bg-background text-foreground flex-1 overflow-y-auto scrollbar">


          <div className="container mx-auto px-4 py-8 ">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                
                Stock Marketplace
              </h1>
              <p className="text-muted-foreground text-lg">
                Real-time market data for top performing stocks
              </p>
            </div>

            {/* Compare Mode */}
            <div className="mb-8">
              <CompareMode
                isCompareMode={isCompareMode}
                onToggleCompareMode={handleToggleCompareMode}
                compareSubMode={compareSubMode}
                onSubModeChange={handleSubModeChange}
                selectedSector={compareSelectedSector}
                onSectorChange={handleCompareSectorChange}
                selectedStockIds={selectedStockIds}
                onClearSelection={handleClearSelection}
                onSubmitCompare={handleSubmitCompare}
                sectors={sectors}
              />
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                <div className="text-sm text-muted-foreground">
                  {/* Showing {filteredAndSortedStocks.length} of {stockData.length} stocks */}
                </div>
              </div>

              <FilterControls
              sectors={sectors}
                selectedSector={selectedSector}
                onSectorChange={setSelectedSector}
                sortBy={sortBy}
                onSortChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Stock Grid */}
            <StockGrid filteredAndSortedStocks={stockData} isCompareMode={isCompareMode} 
            selectedStockIds={selectedStockIds} handleStockSelect={handleStockSelect} 
            handleClearFilters={handleClearFilters}/>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

const StockGrid = ({filteredAndSortedStocks, isCompareMode, selectedStockIds, handleStockSelect, handleClearFilters}) => {
  
  return (
    <>
    {filteredAndSortedStocks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No stocks found matching your criteria.</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-blue-500 hover:text-blue-600 underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedStocks.map((stock, idx) => (
                  <StockCard
                    // data={stockSocketSub[idx].data}
                    key={stock.symbol}
                    stock={stock}
                    isCompareMode={isCompareMode}
                    isSelected={selectedStockIds.includes(stock.symbol)}
                    onSelect={handleStockSelect}
                  />
                ))}
              </div>
            )}
    </>
  )
}