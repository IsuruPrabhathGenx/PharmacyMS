// src/app/dashboard/doctorFeeViewSales/DoctorFeeViewPage.tsx
import React, { useState, useEffect } from 'react';
import { saleService } from '@/services/saleService';
import { Sale } from '@/types/sale';
import { Customer } from '@/types/customer';
import DashboardLayout from '@/components/DashboardLayout';
import { DoctorFeeSalesTable } from './DoctorFeeSalesTable';
import { DoctorFeeSaleDetails } from './DoctorFeeSaleDetails';
import { CustomerSelector } from '@/app/dashboard/viewSales/CustomerSelector';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Loader2, X, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DoctorFeeSalesSummary from './DoctorFeeSalesSummary';
import ExportDoctorFeeSalesButton from './ExportDoctorFeeSalesButton';

export default function DoctorFeeViewPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Filter states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [filterType, setFilterType] = useState<'all' | 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom'>('all');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await saleService.getAll();
      // Only include sales that have doctor fees
      const salesWithDoctorFees = data.filter(sale => sale.doctorFees && sale.doctorFees.length > 0);
      setSales(salesWithDoctorFees);
    } catch (error) {
      console.error('Error loading sales:', error);
      alert('Error loading sales data');
    } finally {
      setLoading(false);
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
  
    return filteredSales;
  };

  const handleClearFilters = () => {
    setFilterType('all');
    setDateRange({ from: undefined, to: undefined });
    setSelectedCustomer(undefined);
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Doctor Fee Sales History</h1>
          <ExportDoctorFeeSalesButton 
            sales={filteredSales}
            isFiltered={filterType !== 'all' || !!selectedCustomer}
            allSales={sales}
          />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          numberOfMonths={1}
                          defaultMonth={dateRange.from ?? new Date()}
                          className="rounded-md border"
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

        <DoctorFeeSalesSummary sales={filteredSales} />

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Doctor Fee Sales</CardTitle>
              <span className="text-muted-foreground">
                {filteredSales.length} sales found
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <DoctorFeeSalesTable 
              sales={filteredSales}
              onViewDetails={handleViewDetails}
            />
          </CardContent>
        </Card>

        {/* Sale Details Dialog */}
        <Dialog 
          open={showDetailsDialog} 
          onOpenChange={setShowDetailsDialog}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            {selectedSale && (
              <DoctorFeeSaleDetails 
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