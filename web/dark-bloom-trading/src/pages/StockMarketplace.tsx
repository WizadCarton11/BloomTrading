
import { useState, useMemo, useEffect } from "react";
import { StockCard } from "../components/stockMarketPlace/StockCard";
import { SearchBar } from "../components/stockMarketPlace/SearchBar";
import { FilterControls } from "../components/stockMarketPlace/FilterControls";
import { CompareMode } from "../components/stockMarketPlace/CompareMode";
import { stockData, Stock } from "../components/data/stockData";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/home/AppSidebar";
import { useAxiosWrapper } from "@/context/AxiosWrapper";

export default function StockMarketplace() {
  const [stockData, setStockData] = useState<any[]>([]); // Replace 'any' with your Stock type if available
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [sortBy, setSortBy] = useState("symbol");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const {get, loading, error} =useAxiosWrapper(import.meta.env.VITE_API_STOCK_BACKEND_URL)
  
  // Compare mode states
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSubMode, setCompareSubMode] = useState<'sector' | 'custom'>('sector');
  const [compareSelectedSector, setCompareSelectedSector] = useState("");
  const [selectedStockIds, setSelectedStockIds] = useState<string[]>([]);

  // Get unique sectors for compare mode

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await get("/api/stock/stocksList");
        if (response && response.data) {
          setStockData(response.data);
        }
      } catch (err) {
        console.error("Error fetching stock data:", err);
      }
    };

    fetchStockData();
  }, []);

  const sectors = useMemo(() => {
    return Array.from(new Set(stockData.map(stock => stock.sector)));
  }, []);

  // Update selected stocks when sector changes in compare mode
  const handleCompareSectorChange = (sector: string) => {
    setCompareSelectedSector(sector);
    if (sector) {
      const sectorStockIds = stockData
        .filter(stock => stock.sector === sector)
        .map(stock => stock.id);
      setSelectedStockIds(sectorStockIds);
    } else {
      setSelectedStockIds([]);
    }
  };

  // Handle individual stock selection in custom mode
  const handleStockSelect = (stockId: string) => {
    if (compareSubMode === 'custom') {
      setSelectedStockIds(prev => 
        prev.includes(stockId) 
          ? prev.filter(id => id !== stockId)
          : [...prev, stockId]
      );
    }
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedStockIds([]);
    setCompareSelectedSector("");
  };

  // Toggle compare mode
  const handleToggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    if (isCompareMode) {
      handleClearSelection();
    }
  };

  // Handle sub-mode change
  const handleSubModeChange = (mode: 'sector' | 'custom') => {
    setCompareSubMode(mode);
    handleClearSelection();
  };

  // Handle submit compare
  const handleSubmitCompare = () => {
    console.log('Comparing stocks:', selectedStockIds);
    // Add your compare logic here
  };

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = stockData.filter((stock) => {
      const matchesSearch = 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSector = 
        selectedSector === "All Sectors" || stock.sector === selectedSector;

      return matchesSearch && matchesSector;
    });

    // Filter to show only selected stocks when in sector mode
    if (isCompareMode && compareSubMode === 'sector' && selectedStockIds.length > 0) {
      filtered = filtered.filter(stock => selectedStockIds.includes(stock.id));
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "change":
          aValue = a.change;
          bValue = b.change;
          break;
        case "volume":
          aValue = a.volume;
          bValue = b.volume;
          break;
        case "marketCap":
          // Convert market cap to number for sorting
          aValue = parseFloat(a.marketCap.replace(/[$TB]/g, '')) * (a.marketCap.includes('T') ? 1000 : 1);
          bValue = parseFloat(b.marketCap.replace(/[$TB]/g, '')) * (b.marketCap.includes('T') ? 1000 : 1);
          break;
        default:
          aValue = a.symbol;
          bValue = b.symbol;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, selectedSector, sortBy, sortOrder, isCompareMode, compareSubMode, selectedStockIds]);

  const handleClearFilters = () => {
    setSelectedSector("All Sectors");
    setSortBy("symbol");
    setSortOrder('asc');
    setSearchTerm("");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-950">
              <AppSidebar />

      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
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
                Showing {filteredAndSortedStocks.length} of {stockData.length} stocks
              </div>
            </div>
            
            <FilterControls
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
              {filteredAndSortedStocks.map((stock) => (
                <StockCard 
                  key={stock.id} 
                  stock={stock}
                  isCompareMode={isCompareMode}
                  isSelected={selectedStockIds.includes(stock.id)}
                  onSelect={handleStockSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </SidebarProvider>
  );
}
