
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Filter, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface CustomerFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (value: 'asc' | 'desc') => void
  minOrderValue: string
  onMinOrderValueChange: (value: string) => void
  minOrderCount: string
  onMinOrderCountChange: (value: string) => void
  onClearFilters: () => void
}

const CustomerFilters = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  minOrderValue,
  onMinOrderValueChange,
  minOrderCount,
  onMinOrderCountChange,
  onClearFilters
}: CustomerFiltersProps) => {
  const hasActiveFilters = minOrderValue || minOrderCount || searchTerm

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Search & Filter Customers</span>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="total_order_value">Total Spent</SelectItem>
                <SelectItem value="order_count">Order Count</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label>Order</Label>
            <Select value={sortOrder} onValueChange={onSortOrderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Order Value Filter */}
          <div className="space-y-2">
            <Label>Min Total Spent (₹)</Label>
            <Input
              type="number"
              placeholder="0"
              value={minOrderValue}
              onChange={(e) => onMinOrderValueChange(e.target.value)}
            />
          </div>

          {/* Min Order Count Filter */}
          <div className="space-y-2">
            <Label>Min Order Count</Label>
            <Input
              type="number"
              placeholder="0"
              value={minOrderCount}
              onChange={(e) => onMinOrderCountChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerFilters
