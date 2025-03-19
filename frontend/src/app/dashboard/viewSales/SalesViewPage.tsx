// src/app/dashboard/viewSales/SalesViewPage.tsx
import React, { useState, useEffect } from 'react';
import { saleService } from '@/services/saleService';
import { salesReportService,  TimeSeriesDataPoint, TopSellingItem } from '@/services/salesReportService';
import { Sale } from '@/types/sale';
import { Customer } from '@/types/customer';
import DashboardLayout from '@/components/DashboardLayout';
import { SalesTable } from './SalesTable';
import { SaleDetails } from './SaleDetails';
import { CustomerSelector } from './CustomerSelector';
import SalesLineChart from './SalesLineChart';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X, Calendar, RefreshCcw } from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SalesSummary from './SalesSummary';
import { ItemSelector } from './ItemSelector';
import ItemSalesSummary from './ItemSalesSummary';
import { InventoryItem } from '@/types/inventory';
import { inventoryService } from '@/services/inventoryService';
import ExportSalesButton from './ExportSalesButton';
import TopSellingItemsTable from './TopSellingItemsTable';

export default function SalesViewPage() {
  // State for sales data
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // State for reports data
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Filter states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [filterType, setFilterType] = useState<'all' | 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom'>('thisMonth'); // Default to "this month"
  const [timeInterval, setTimeInterval] = useState<'day' | 'week' | 'month'>('day');
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadSales();
    loadInventoryItems();
  }, []);

  // Load reports whenever filters change
  useEffect(() => {
    loadReports();
  }, [filterType, dateRange, selectedCustomer, selectedItem, timeInterval]);

  const loadInventoryItems = async () => {
    try {
      const items = await inventoryService.getAll();
      setInventoryItems(items);
      setLoadingInventory(false);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      setLoadingInventory(false);
    }
  };
  
  const loadSales = async () => {
    try {
      const data = await saleService.getAll();
      const salesWithInventory = data.filter(sale => sale.items && sale.items.length > 0);
      setSales(salesWithInventory);
    } catch (error) {
      console.error('Error loading sales:', error);
      alert('Error loading sales data');
    } finally {
      setLoading(false);
    }
  };
  
  const loadReports = async () => {
    setLoadingReports(true);
    try {
      // Prepare date filters
      let dateFilters: { startDate?: Date; endDate?: Date } = {};
      
      if (filterType === 'custom' && dateRange.from && dateRange.to) {
        dateFilters = {
          startDate: dateRange.from,
          endDate: dateRange.to
        };
      }
      
      // Prepare customer and item filters
      const filters = {
        ...dateFilters,
        customerId: selectedCustomer?.id,
        itemId: selectedItem?.id
      };
      
      // Load summary data
      const summary = await salesReportService.getSalesSummary(filters);
      setSalesSummary(summary);
      
      // Load time series data for charts
      const timeData = await salesReportService.getTimeSeriesData(timeInterval, filters);
      setTimeSeriesData(timeData);
      
      // Load top selling items
      const topItems = await salesReportService.getTopSellingItems(dateFilters);
      setTopSellingItems(topItems);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsDialog(false);
    setSelectedSale(null);
  };

  // Function to determine if filters are active
  const isFiltering = (): boolean => {
    return filterType !== 'all' || !!selectedCustomer || !!selectedItem;
  };

  // Filter functions for legacy data
  const filterSales = (sales: Sale[]) => {
    let filteredSales = [...sales];
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
  
    switch (filterType) {
      case 'today':
        filteredSales = filteredSales.filter(sale => 
          sale.saleDate >= startOfDay
        );
        break;
      case 'thisWeek':
        filteredSales = filteredSales.filter(sale => 
          sale.saleDate >= startOfWeek
        );
        break;
      case 'thisMonth':
        filteredSales = filteredSales.filter(sale => 
          sale.saleDate >= startOfMonth
        );
        break;
      case 'thisYear':
        filteredSales = filteredSales.filter(sale => 
          sale.saleDate >= startOfYear
        );
        break;
      case 'custom':
        if (dateRange.from && dateRange.to) {
          filteredSales = filteredSales.filter(sale => 
            sale.saleDate >= dateRange.from && sale.saleDate <= dateRange.to
          );
        }
        break;
    }
  
    // Filter by customer
    if (selectedCustomer) {
      filteredSales = filteredSales.filter(sale => 
        sale.customer?.id === selectedCustomer.id
      );
    }

    // Filter by item
    if (selectedItem) {
      filteredSales = filteredSales.filter(sale => 
        sale.items.some(item => item.itemId === selectedItem.id)
      );
    }
  
    return filteredSales;
  };

  const handleClearFilters = () => {
    setFilterType('all');
    setDateRange({ from: undefined, to: undefined });
    setSelectedCustomer(undefined);
    setSelectedItem(undefined);
  };

  // Get filtered sales (for legacy components)
  const filteredSales = filterSales(sales);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={loadReports}
              disabled={loadingReports}
              className="gap-2"
            >
              {loadingReports ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh Data
            </Button>
            <ExportSalesButton 
              sales={filteredSales}
              isFiltered={isFiltering()}
              allSales={sales}
            />
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Filters</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Time Period</Label>
                <Select
                  value={filterType}
                  onValueChange={(value: typeof filterType) => {
                    setFilterType(value);
                    if (value !== 'custom') {
                      setDateRange({ from: undefined, to: undefined });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="thisYear">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Chart Time Interval</Label>
                <Select
                  value={timeInterval}
                  onValueChange={(value: 'day' | 'week' | 'month') => {
                    setTimeInterval(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterType === 'custom' && (
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                              </>
                            ) : (
                              dateRange.from.toLocaleDateString()
                            )
                          ) : (
                            "Select dates..."
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <CalendarComponent
                          initialFocus
                          selected={{
                            from: dateRange.from ?? undefined,
                            to: dateRange.to ?? undefined
                          }}
                          mode="range"
                          onSelect={(selectedRange) => {
                            setDateRange({
                              from: selectedRange?.from,
                              to: selectedRange?.to
                            });
                          }}
                          numberOfMonths={1}
                          defaultMonth={dateRange.from ?? new Date()}
                          className="rounded-md border"
                          classNames={{
                            day_range_start: "rounded-l-md",
                            day_range_end: "rounded-r-md",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <CustomerSelector
                  selectedCustomer={selectedCustomer}
                  onSelectCustomer={setSelectedCustomer}
                />
              </div>

              <div className="space-y-2">
                <ItemSelector
                  selectedItem={selectedItem}
                  onSelectItem={setSelectedItem}
                  items={inventoryItems}
                  loading={loadingInventory}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different report views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items">Top Items</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Summary Cards */}
            {salesSummary && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rs{salesSummary.totalSales.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      From {salesSummary.saleCount} transactions
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rs{salesSummary.totalCost.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Inventory cost
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      Rs{salesSummary.totalProfit.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Net profit from sales
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {salesSummary.profitMargin.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average profit margin
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* MongoDB-driven chart for time series data */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {filterType === 'all' ? 'All Time Sales Data' :
                   filterType === 'today' ? 'Today\'s Sales' :
                   filterType === 'thisWeek' ? 'This Week\'s Sales' :
                   filterType === 'thisMonth' ? 'This Month\'s Sales' :
                   filterType === 'thisYear' ? 'This Year\'s Sales' :
                   filterType === 'custom' && dateRange.from && dateRange.to ? 
                     `Sales from ${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}` :
                     'Sales Data'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  {loadingReports ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : timeSeriesData.length > 0 ? (
                    // Enhanced chart component using MongoDB aggregation data
                    <SalesLineChart 
                      chartData={timeSeriesData}
                      timeInterval={timeInterval}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No data available for the selected period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Item-specific summary if an item is selected */}
            {selectedItem && (
              <ItemSalesSummary 
                sales={filteredSales}
                selectedItem={selectedItem}
              />
            )}
          </TabsContent>
          
          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingReports ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : topSellingItems.length > 0 ? (
                  <TopSellingItemsTable items={topSellingItems} />
                ) : (
                  <div className="flex items-center justify-center h-40 text-muted-foreground">
                    No data available for the selected period
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            {/* Legacy sales table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sales Transactions</CardTitle>
                  <span className="text-muted-foreground">
                    {filteredSales.length} sales found
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <SalesTable 
                  sales={filteredSales}
                  onViewDetails={handleViewDetails}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sale Details Dialog */}
        <Dialog 
          open={showDetailsDialog} 
          onOpenChange={setShowDetailsDialog}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogTitle></DialogTitle>
            {selectedSale && (
              <SaleDetails 
                sale={selectedSale}
                onClose={handleCloseDetails}
                onUpdate={loadSales}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}