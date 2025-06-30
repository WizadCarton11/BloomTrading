
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterControlsProps {
  selectedSector: string;
  onSectorChange: (sector: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onClearFilters: () => void;
}

export function FilterControls({ 
  selectedSector, 
  onSectorChange, 
  sortBy, 
  onSortChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters
}: FilterControlsProps) {
  const sectors = [
    "All Sectors",
    "Technology", 
    "Healthcare", 
    "Finance", 
    "Energy", 
    "Consumer", 
    "Industrial", 
    "Real Estate",
    "Utilities"
  ];

  const sortOptions = [
    { value: "symbol", label: "Symbol" },
    { value: "price", label: "Price" },
    { value: "change", label: "Change" },
    { value: "volume", label: "Volume" },
    { value: "marketCap", label: "Market Cap" }
  ];

  const hasActiveFilters = selectedSector !== "All Sectors" || sortBy !== "symbol";

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Select value={selectedSector} onValueChange={onSectorChange}>
        <SelectTrigger className="w-48 bg-background border-border">
          <SelectValue placeholder="Select sector" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {sectors.map((sector) => (
            <SelectItem key={sector} value={sector} className="hover:bg-accent">
              {sector}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-40 bg-background border-border">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="hover:bg-accent">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="border-border hover:bg-accent"
      >
        {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
      </Button>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}

      {selectedSector !== "All Sectors" && (
        <Badge variant="secondary" className="bg-accent text-accent-foreground">
          {selectedSector}
        </Badge>
      )}
    </div>
  );
}
