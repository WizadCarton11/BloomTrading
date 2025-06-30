
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, BarChart3 } from "lucide-react";

interface CompareModeProps {
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  compareSubMode: 'sector' | 'custom';
  onSubModeChange: (mode: 'sector' | 'custom') => void;
  selectedSector: string;
  onSectorChange: (sector: string) => void;
  selectedStockIds: string[];
  onClearSelection: () => void;
  onSubmitCompare: () => void;
  sectors: string[];
}

export function CompareMode({
  isCompareMode,
  onToggleCompareMode,
  compareSubMode,
  onSubModeChange,
  selectedSector,
  onSectorChange,
  selectedStockIds,
  onClearSelection,
  onSubmitCompare,
  sectors
}: CompareModeProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isCompareMode ? 'text-primary' : 'text-muted-foreground'}`}>Compare Mode</h3>
        <Button
          variant={isCompareMode ? "default" : "outline"}
          onClick={onToggleCompareMode}
          className="transition-all duration-200"
        >
          {isCompareMode ? "Exit Compare" : "Enter Compare Mode"}
        </Button>
      </div>

      {isCompareMode && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={compareSubMode === 'sector' ? "default" : "outline"}
              onClick={() => onSubModeChange('sector')}
              size="sm"
            >
              Sector Based
            </Button>
            <Button
              variant={compareSubMode === 'custom' ? "default" : "outline"}
              onClick={() => onSubModeChange('custom')}
              size="sm"
            >
              Custom Selection
            </Button>
          </div>

          {compareSubMode === 'sector' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Select Sector:</span>
              <Select value={selectedSector} onValueChange={onSectorChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Choose a sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedStockIds.length > 0 && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Selected:</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedStockIds.length} stock{selectedStockIds.length !== 1 ? 's' : ''}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={onClearSelection}
                  />
                </Badge>
              </div>
              
              <Button
                onClick={onSubmitCompare}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Compare Stocks
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
