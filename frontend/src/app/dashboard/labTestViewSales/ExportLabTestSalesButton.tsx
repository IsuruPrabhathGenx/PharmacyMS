// src/app/dashboard/labTestViewSales/ExportLabTestSalesButton.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Sale } from '@/types/sale';

interface ExportLabTestSalesButtonProps {
  sales: Sale[];
  isFiltered: boolean;
  allSales: Sale[];
  showDiscounted?: boolean;
}

const ExportLabTestSalesButton = ({ 
  sales, 
  isFiltered, 
  allSales,
  showDiscounted = false 
}: ExportLabTestSalesButtonProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const prepareExcelData = (salesData: Sale[]) => {
    return salesData.map(sale => {
      const labTestsTotal = sale.laboratoryTests?.reduce((sum, test) => sum + test.price, 0) || 0;
      const discountedTotal = labTestsTotal * 0.75; // 25% discount
      const labFee = labTestsTotal * 0.25; // 25% lab fee
      
      return {
        'Sale ID': sale.id,
        'Date': formatDate(sale.saleDate),
        'Patient Name': sale.customer?.name || 'Walk-in Patient',
        'Patient Mobile': sale.customer?.mobile || '-',
        'Patient Address': sale.customer?.address || '-',
        'Tests': sale.laboratoryTests?.map(test => 
          `${test.test.name} - Rs${test.price.toFixed(2)}`
        ).join('\n') || '-',
        'Original Amount': `Rs${labTestsTotal.toFixed(2)}`,
        'Lab Fee (25%)': `Rs${labFee.toFixed(2)}`,
        'Net Amount': `Rs${discountedTotal.toFixed(2)}`,
        'Created At': formatDate(sale.createdAt),
        'Updated At': formatDate(sale.updatedAt)
      };
    });
  };

  const handleExport = () => {
    const dataToExport = isFiltered ? sales : allSales;
    const data = prepareExcelData(dataToExport);
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laboratory Test Sales');

    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(
        key.length, 
        ...data.map(row => {
          const cellValue = row[key];
          return typeof cellValue === 'string' ? 
            cellValue.split('\n').reduce((max, line) => Math.max(max, line.length), 0) : 
            String(cellValue).length;
        })
      )
    }));
    ws['!cols'] = colWidths;

    // Export the file
    XLSX.writeFile(wb, `lab_test_sales_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport}
      className="gap-2"
    >
      <FileDown className="h-4 w-4" />
      Export {isFiltered ? 'Filtered' : 'All'} Lab Tests
    </Button>
  );
};

export default ExportLabTestSalesButton;