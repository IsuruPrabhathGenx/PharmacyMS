// src/app/dashboard/reports/ReportsPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { financialReportService, FinancialReportData, FinancialSummary, DailyFinancialData, CategoryExpense } from '@/services/financialReportService';
import { saleService } from '@/services/saleService';
import { expenseService } from '@/services/expenseService';
import { Sale } from '@/types/sale';
import { Expense, ExpenseCategory } from '@/types/expense';
import { Customer } from '@/types/customer';
import DashboardLayout from '@/components/DashboardLayout';
import { CustomerSelector } from '@/app/dashboard/viewSales/CustomerSelector';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Loader2, X, Calendar, Download, ArrowUpDown, RefreshCcw } from 'lucide-react';
import FinancialChart from './FinancialChart';
import ExpensePieChart from './ExpensePieChart';
import ReportsInstructions from './ReportsInstructions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const { toast } = useToast();
  
  // State for data
  const [reportData, setReportData] = useState<FinancialReportData | null>(null);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [filterType, setFilterType] = useState<'all' | 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom'>('thisMonth');
  const [activeTab, setActiveTab] = useState("summary");
  
  // Sorting state
  const [salesSortField, setSalesSortField] = useState<string>("date");
  const [salesSortDirection, setSalesSortDirection] = useState<"asc" | "desc">("desc");
  const [expensesSortField, setExpensesSortField] = useState<string>("date");
  const [expensesSortDirection, setExpensesSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadData();
  }, []);

  // When filters change, reload the data
  useEffect(() => {
    loadFilteredData();
  }, [filterType, dateRange, selectedCustomer]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load the expense categories for reference
      const categoriesData = await expenseService.getAllCategories();
      setExpenseCategories(categoriesData);
      
      // Initial data load with filter
      await loadFilteredData();
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load report data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredData = async () => {
    try {
      setRefreshing(true);
      
      // Prepare filter based on selected filter type
      const filters: { startDate?: Date; endDate?: Date; customerId?: string } = {};
      
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      
      // Apply date filter based on filter type
      switch (filterType) {
        case 'today':
          filters.startDate = startOfDay;
          filters.endDate = new Date(); // Now
          break;
        case 'thisWeek':
          filters.startDate = startOfWeek;
          filters.endDate = new Date(); // Now
          break;
        case 'thisMonth':
          filters.startDate = startOfMonth;
          filters.endDate = new Date(); // Now
          break;
        case 'thisYear':
          filters.startDate = startOfYear;
          filters.endDate = new Date(); // Now
          break;
        case 'custom':
          if (dateRange.from) {
            const fromDate = new Date(dateRange.from);
            fromDate.setHours(0, 0, 0, 0);
            filters.startDate = fromDate;
            
            if (dateRange.to) {
              const toDate = new Date(dateRange.to);
              toDate.setHours(23, 59, 59, 999);
              filters.endDate = toDate;
            } else {
              filters.endDate = new Date(); // Now if only start date is set
            }
          }
          break;
      }
      
      // Apply customer filter if selected
      if (selectedCustomer?.id) {
        filters.customerId = selectedCustomer.id;
      }
      
      // Fetch the data from the API
      const data = await financialReportService.getFinancialReport(filters);
      setReportData(data);
      
    } catch (error) {
      console.error('Error loading filtered data:', error);
      toast({
        title: "Error",
        description: "Failed to apply filters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadFilteredData();
  };

  const sortSales = (salesToSort: Sale[]) => {
    return [...salesToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (salesSortField) {
        case "date":
          comparison = a.saleDate.getTime() - b.saleDate.getTime();
          break;
        case "customer":
          const aName = a.customer?.name || "";
          const bName = b.customer?.name || "";
          comparison = aName.localeCompare(bName);
          break;
        case "amount":
          const aTotal = a.items.reduce((sum, item) => sum + item.totalPrice, 0);
          const bTotal = b.items.reduce((sum, item) => sum + item.totalPrice, 0);
          comparison = aTotal - bTotal;
          break;
        case "profit":
          const aProfit = a.items.reduce((sum, item) => sum + item.totalPrice - item.totalCost, 0);
          const bProfit = b.items.reduce((sum, item) => sum + item.totalPrice - item.totalCost, 0);
          comparison = aProfit - bProfit;
          break;
      }
      
      return salesSortDirection === "asc" ? comparison : -comparison;
    });
  };

  const sortExpenses = (expensesToSort: Expense[]) => {
    return [...expensesToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (expensesSortField) {
        case "date":
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case "category":
          comparison = a.categoryName.localeCompare(b.categoryName);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
      }
      
      return expensesSortDirection === "asc" ? comparison : -comparison;
    });
  };

  const handleSalesSort = (field: string) => {
    if (salesSortField === field) {
      setSalesSortDirection(salesSortDirection === "asc" ? "desc" : "asc");
    } else {
      setSalesSortField(field);
      setSalesSortDirection("desc");
    }
  };

  const handleExpensesSort = (field: string) => {
    if (expensesSortField === field) {
      setExpensesSortDirection(expensesSortDirection === "asc" ? "desc" : "asc");
    } else {
      setExpensesSortField(field);
      setExpensesSortDirection("desc");
    }
  };

  // Export reports
  const exportExcel = () => {
    if (!reportData) return;
    
    const { summary, dailyData, expensesByCategory } = reportData;
    const sales = sortSales(reportData.sales || []);
    const expenses = sortExpenses(reportData.expenses || []);
    
    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      ["Financial Summary", "", ""],
      ["Period", getDisplayPeriod(), ""],
      ["", "", ""],
      ["Total Revenue", `Rs${summary.totalRevenue.toFixed(2)}`, ""],
      ["Total Inventory Cost", `Rs${summary.totalInventoryCost.toFixed(2)}`, ""],
      ["Gross Profit", `Rs${summary.grossProfit.toFixed(2)}`, ""],
      ["Total Expenses", `Rs${summary.totalExpenses.toFixed(2)}`, ""],
      ["Net Profit", `Rs${summary.netProfit.toFixed(2)}`, ""],
      ["Profit Margin", `${summary.profitMargin.toFixed(2)}%`, ""],
      ["", "", ""],
      ["Sales Count", summary.salesCount.toString(), ""],
      ["Expenses Count", summary.expensesCount.toString(), ""]
    ];
    
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");
    
    // Expenses by Category
    const categoryData = [
      ["Expense Category", "Amount", "Percentage"],
      ...expensesByCategory.map(item => [
        item.category,
        `Rs${item.amount.toFixed(2)}`,
        `${item.percentage.toFixed(2)}%`
      ])
    ];
    
    const categoryWS = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, categoryWS, "Expenses by Category");
    
    // Daily Breakdown
    const dailyDataFormatted = [
      ["Date", "Revenue", "Inventory Cost", "Gross Profit", "Expenses", "Net Profit"],
      ...dailyData.map(day => [
        day.date,
        `Rs${day.revenue.toFixed(2)}`,
        `Rs${day.cost.toFixed(2)}`,
        `Rs${day.profit.toFixed(2)}`,
        `Rs${day.expenses.toFixed(2)}`,
        `Rs${day.netProfit.toFixed(2)}`
      ])
    ];
    
    const dailyWS = XLSX.utils.aoa_to_sheet(dailyDataFormatted);
    XLSX.utils.book_append_sheet(wb, dailyWS, "Daily Breakdown");
    
    // Sales Details
    const salesData = [
      ["Date", "Customer", "Items", "Revenue", "Cost", "Profit"],
      ...sales.map(sale => {
        const revenue = sale.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const cost = sale.items.reduce((sum, item) => sum + item.totalCost, 0);
        return [
          sale.saleDate.toISOString().split('T')[0],
          sale.customer?.name || "Walk-in Customer",
          sale.items.length.toString(),
          `Rs${revenue.toFixed(2)}`,
          `Rs${cost.toFixed(2)}`,
          `Rs${(revenue - cost).toFixed(2)}`
        ];
      })
    ];
    
    const salesWS = XLSX.utils.aoa_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, salesWS, "Sales");
    
    // Expense Details
    const expensesData = [
      ["Date", "Category", "Details", "Amount"],
      ...expenses.map(expense => [
        expense.date.toISOString().split('T')[0],
        expense.categoryName,
        expense.details,
        `Rs${expense.amount.toFixed(2)}`
      ])
    ];
    
    const expensesWS = XLSX.utils.aoa_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(wb, expensesWS, "Expenses");
    
    // Export the workbook
    XLSX.writeFile(wb, `financial_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getDisplayPeriod = () => {
    switch (filterType) {
      case 'all':
        return 'All Time';
      case 'today':
        return 'Today';
      case 'thisWeek':
        return 'This Week';
      case 'thisMonth':
        return 'This Month';
      case 'thisYear':
        return 'This Year';
      case 'custom':
        if (dateRange.from) {
          const fromStr = dateRange.from.toLocaleDateString();
          return dateRange.to 
            ? `${fromStr} to ${dateRange.to.toLocaleDateString()}`
            : `From ${fromStr}`;
        }
        return 'Custom Range';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Safe access to report data
  const summary = reportData?.summary || {
    totalRevenue: 0,
    totalInventoryCost: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
    salesCount: 0,
    expensesCount: 0
  };

  const dailyData = reportData?.dailyData || [];
  const expensesByCategory = reportData?.expensesByCategory || [];
  const sales = reportData?.sales ? sortSales(reportData.sales) : [];
  const expenses = reportData?.expenses ? sortExpenses(reportData.expenses) : [];

  return (
    <DashboardLayout>
      <div className="space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <ReportsInstructions />
            <Button 
              variant="outline"
              onClick={exportExcel}
              className="flex items-center gap-2"
              disabled={!reportData}
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Report Filters</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterType('thisMonth');
                  setDateRange({ from: undefined, to: undefined });
                  setSelectedCustomer(undefined);
                }}
                className="h-8"
              >
                <X className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          numberOfMonths={2}
                          defaultMonth={dateRange.from ?? new Date()}
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
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs{summary.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From {summary.salesCount} sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-2xl font-bold">Rs{(summary.totalInventoryCost + summary.totalExpenses).toFixed(2)}</div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Inventory: Rs{summary.totalInventoryCost.toFixed(2)}</span>
                  <span>Expenses: Rs{summary.totalExpenses.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rs{summary.netProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                After all expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.profitMargin.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Net profit / Total revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            {/* Financial Charts */}
            {dailyData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FinancialChart 
                  data={dailyData.slice(0, 14)} 
                  title="Revenue & Profit Trends" 
                  type="line" 
                />
                <FinancialChart 
                  data={dailyData.slice(0, 14)} 
                  title="Financial Breakdown" 
                  type="bar" 
                />
              </div>
            )}
            
            {/* Daily Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Financial Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Inv. Cost</TableHead>
                        <TableHead className="text-right">Gross Profit</TableHead>
                        <TableHead className="text-right">Expenses</TableHead>
                        <TableHead className="text-right">Net Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyData.slice(0, 20).map((day) => (
                        <TableRow key={day.date}>
                          <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">Rs{day.revenue.toFixed(2)}</TableCell>
                          <TableCell className="text-right">Rs{day.cost.toFixed(2)}</TableCell>
                          <TableCell className="text-right">Rs{day.profit.toFixed(2)}</TableCell>
                          <TableCell className="text-right">Rs{day.expenses.toFixed(2)}</TableCell>
                          <TableCell className={`text-right font-medium ${day.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Rs{day.netProfit.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {dailyData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            No data available for the selected period
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Expense Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ExpensePieChart 
                data={expensesByCategory} 
                title="Expense Breakdown by Category" 
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Expense Category Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">% of Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expensesByCategory.map((category) => (
                          <TableRow key={category.category}>
                            <TableCell>{category.category}</TableCell>
                            <TableCell className="text-right">Rs{category.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              {category.percentage.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                        {expensesByCategory.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                              No expense data available for the selected period
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sales Details</CardTitle>
                  <span className="text-muted-foreground">
                    {sales.length} sales found
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSalesSort("date")}
                        >
                          <div className="flex items-center gap-1">
                            Date
                            {salesSortField === "date" && (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSalesSort("customer")}
                        >
                          <div className="flex items-center gap-1">
                            Customer
                            {salesSortField === "customer" && (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-center">Items</TableHead>
                        <TableHead 
                          className="text-right cursor-pointer"
                          onClick={() => handleSalesSort("amount")}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Revenue
                            {salesSortField === "amount" && (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Inv. Cost</TableHead>
                        <TableHead 
                          className="text-right cursor-pointer"
                          onClick={() => handleSalesSort("profit")}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Profit
                            {salesSortField === "profit" && (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => {
                        const revenue = sale.items.reduce((sum, item) => sum + item.totalPrice, 0);
                        const cost = sale.items.reduce((sum, item) => sum + item.totalCost, 0);
                        const profit = revenue - cost;
                        
                        return (
                          <TableRow key={sale.id}>
                            <TableCell>
                              {sale.saleDate.toLocaleDateString()}
                              <div className="text-xs text-muted-foreground">
                                {sale.saleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </TableCell>
                            <TableCell>
                              {sale.customer 
                                ? <div>
                                    <p className="font-medium">{sale.customer.name}</p>
                                    <p className="text-xs text-muted-foreground">{sale.customer.mobile}</p>
                                  </div>
                                : <span className="text-muted-foreground">Walk-in Customer</span>
                              }
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-medium">{sale.items.length}</span>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              Rs{revenue.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              Rs{cost.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              Rs{profit.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {sales.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            No sales found for the selected period
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Expenses Details</CardTitle>
                  <span className="text-muted-foreground">
                    {expenses.length} expenses found
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleExpensesSort("date")}
                        >
                          <div className="flex items-center gap-1">
                            Date
                            {expensesSortField === "date" && (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleExpensesSort("category")}
                        >
                          <div className="flex items-center gap-1">
                            Category
                            {expensesSortField === "category" && (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead 
                          className="text-right cursor-pointer"
                          onClick={() => handleExpensesSort("amount")}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Amount
                            {expensesSortField === "amount" && (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{expense.date.toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className="font-medium">{expense.categoryName}</span>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {expense.details}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            Rs{expense.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {expenses.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No expenses found for the selected period
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}