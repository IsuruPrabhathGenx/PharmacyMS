// src/app/dashboard/labTestViewSales/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { saleService } from '@/services/saleService';
import { Sale } from '@/types/sale';
import { Customer } from '@/types/customer';
import DashboardLayout from '@/components/DashboardLayout';
import LabSalesView from './LabSalesView';
import { CustomerSelector } from '@/app/dashboard/viewSales/CustomerSelector';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Loader2, X, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LabTestSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
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
      // Only include sales that have laboratory tests
      const salesWithLabTests = data.filter(sale => sale.laboratoryTests && sale.laboratoryTests.length > 0);
      setSales(salesWithLabTests);
    } catch (error) {
      console.error('Error loading sales:', error);
      alert('Error loading sales data');
    } finally {
      setLoading(false);
    }
  };

  const filterSales = (sales: Sale[]) => {
    // First, ensure we only work with sales that have laboratory tests
    let filteredSales = sales.filter(sale => 
      sale.laboratoryTests && sale.laboratoryTests.length > 0
    );
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
  
    // Apply date filters
    switch (filterType) {
      case 'today':
        filteredSales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= startOfDay;
        });
        break;
      case 'thisWeek':
        filteredSales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= startOfWeek;
        });
        break;
      case 'thisMonth':
        filteredSales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= startOfMonth;
        });
        break;
      case 'thisYear':
        filteredSales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= startOfYear;
        });
        break;
      case 'custom':
        if (dateRange.from && dateRange.to) {
          const fromDate = new Date(dateRange.from);
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999); // Include the entire end date
          
          filteredSales = filteredSales.filter(sale => {
            const saleDate = new Date(sale.saleDate);
            return saleDate >= fromDate && saleDate <= toDate;
          });
        }
        break;
    }
  
    // Apply customer filter if selected
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
          <h1 className="text-3xl font-bold tracking-tight">Laboratory Test Sales History</h1>
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

        {/* Lab Sales View Component */}
        <LabSalesView 
          sales={filteredSales}
          isFiltered={filterType !== 'all' || !!selectedCustomer}
          filterType={filterType}
          dateRange={dateRange}
          selectedCustomer={selectedCustomer}
        />
      </div>
    </DashboardLayout>
  );
}