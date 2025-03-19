import React, { useState } from 'react';
import { Sale } from '@/types/sale';
import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, FileDown, Users, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';

interface LabSalesViewProps {
  sales: Sale[];
  isFiltered: boolean;
  filterType: 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';
  dateRange: { from: Date | undefined; to: Date | undefined };
  selectedCustomer: Customer | undefined;
}

const LabSalesView = ({ 
  sales,
  isFiltered,
  filterType,
  dateRange,
  selectedCustomer 
}: LabSalesViewProps) => {
  const [showDiscountedPrices, setShowDiscountedPrices] = useState(false);

  // Calculate totals including lab tests
  const calculateTotals = (salesData: Sale[]) => {
    return salesData.reduce((acc, sale) => {
      const labTestsTotal = sale.laboratoryTests?.reduce((sum, test) => sum + test.price, 0) || 0;
      
      return {
        total: acc.total + labTestsTotal,
        transactions: acc.transactions + (sale.laboratoryTests && sale.laboratoryTests.length > 0 ? 1 : 0),
        uniqueCustomers: new Set([...acc.uniqueCustomers, sale.customer?.id].filter(Boolean))
      };
    }, { 
      total: 0, 
      transactions: 0, 
      uniqueCustomers: new Set<string>()
    });
  };

  const totals = calculateTotals(sales);
  const discountedTotal = totals.total * 0.75; // 25% discount
  const labFee = totals.total * 0.25; // 25% lab fee

  // Export function
  const handleExport = () => {
    const data = sales.map(sale => ({
      'Sale ID': sale.id,
      'Date': sale.saleDate.toLocaleDateString(),
      'Patient Name': sale.customer?.name || 'Walk-in Patient',
      'Patient Mobile': sale.customer?.mobile || '-',
      'Tests': sale.laboratoryTests?.map(test => 
        `${test.test.name} - Rs${test.price.toFixed(2)}`
      ).join('\n') || '-',
      'Original Amount': `Rs${(sale.laboratoryTests?.reduce((sum, test) => sum + test.price, 0) || 0).toFixed(2)}`,
      'After Lab Fee (25% deducted)': `Rs${((sale.laboratoryTests?.reduce((sum, test) => sum + test.price, 0) || 0) * 0.75).toFixed(2)}`,
      'Lab Fee': `Rs${((sale.laboratoryTests?.reduce((sum, test) => sum + test.price, 0) || 0) * 0.25).toFixed(2)}`
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lab Tests');
    
    XLSX.writeFile(wb, `lab_test_sales_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs{showDiscountedPrices ? discountedTotal.toFixed(2) : totals.total.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {showDiscountedPrices ? 'After 25% Lab Fee' : 'Before Lab Fee'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lab Fee (25%)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs{labFee.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total lab fee amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.transactions}</div>
            <p className="text-xs text-muted-foreground">Number of test transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.uniqueCustomers.size}</div>
            <p className="text-xs text-muted-foreground">Unique patients tested</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => setShowDiscountedPrices(!showDiscountedPrices)}
        >
          Show {showDiscountedPrices ? 'Original' : 'After Lab Fee'} Prices
        </Button>
        <Button
          variant="outline"
          onClick={handleExport}
          className="gap-2"
        >
          <FileDown className="h-4 w-4" />
          Export {isFiltered ? 'Filtered' : 'All'} Lab Tests
        </Button>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Laboratory Test Sales</CardTitle>
            <span className="text-muted-foreground">
              {sales.length} sales found
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Patient</th>
                  <th className="p-2 text-left">Tests</th>
                  <th className="p-2 text-right">Amount</th>
                  {showDiscountedPrices && (
                    <th className="p-2 text-right">After Lab Fee</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const testTotal = sale.laboratoryTests?.reduce((sum, test) => sum + test.price, 0) || 0;
                  const discountedTestTotal = testTotal * 0.75;

                  return (
                    <tr key={sale.id} className="border-b">
                      <td className="p-2">
                        {sale.saleDate.toLocaleDateString()}
                        <br />
                        <span className="text-sm text-muted-foreground">
                          {sale.saleDate.toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="p-2">
                        {sale.customer ? (
                          <div>
                            <p className="font-medium">{sale.customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {sale.customer.mobile}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Walk-in Patient</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          {sale.laboratoryTests?.map((test, index) => (
                            <div key={index} className="text-sm">
                              {test.test.name}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-2 text-right font-medium">
                        Rs{testTotal.toFixed(2)}
                      </td>
                      {showDiscountedPrices && (
                        <td className="p-2 text-right font-medium">
                          Rs{discountedTestTotal.toFixed(2)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabSalesView;