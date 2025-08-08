import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  sortBy: string;
  inStock: boolean;
}

interface ProductSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  categories: string[];
  maxPrice: number;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onSearch,
  onFilter,
  categories,
  maxPrice
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, maxPrice],
    sortBy: 'name',
    inStock: false
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  useEffect(() => {
    onFilter(filters);
    updateActiveFilters();
  }, [filters, onFilter]);

  const updateActiveFilters = () => {
    const active: string[] = [];
    if (filters.categories.length > 0) {
      active.push(...filters.categories);
    }
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) {
      active.push(`₹${filters.priceRange[0]} - ₹${filters.priceRange[1]}`);
    }
    if (filters.inStock) {
      active.push('In Stock');
    }
    setActiveFilters(active);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [value[0], value[1]]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, maxPrice],
      sortBy: 'name',
      inStock: false
    });
  };

  const removeFilter = (filterToRemove: string) => {
    if (categories.includes(filterToRemove)) {
      handleCategoryChange(filterToRemove, false);
    } else if (filterToRemove === 'In Stock') {
      setFilters(prev => ({ ...prev, inStock: false }));
    } else if (filterToRemove.includes('₹')) {
      setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div>
                <label className="text-sm font-medium mb-3 block">Sort By</label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Categories</label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(category, checked as boolean)
                        }
                      />
                      <label htmlFor={category} className="text-sm">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                </label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={maxPrice}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, inStock: checked as boolean }))
                  }
                />
                <label htmlFor="inStock" className="text-sm">
                  In Stock Only
                </label>
              </div>

              <Button onClick={clearFilters} variant="outline" className="w-full">
                Clear All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="flex items-center gap-1">
              {filter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter(filter)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};