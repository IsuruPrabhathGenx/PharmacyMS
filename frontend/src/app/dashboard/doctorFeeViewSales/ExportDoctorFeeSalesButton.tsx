// src/app/dashboard/doctorFeeViewSales/ExportDoctorFeeSalesButton.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Sale } from '@/types/sale';

interface ExportDoctorFeeSalesButtonProps {
  sales: Sale[];
  isFiltered: boolean;
  allSales: Sale[];
}

const ExportDoctorFeeSalesButton = ({ sales, isFiltered, allSales }: ExportDoctorFeeSalesButtonProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const prepareExcelData = (salesData: Sale[]) => {
    return salesData.map(sale => {
      const doctorFeesTotal = sale.doctorFees?.reduce((sum, fee) => sum + fee.amount, 0) || 0;
      
      return {
        'Sale ID': sale.id,
        'Date': formatDate(sale.saleDate),
        'Patient Name': sale.customer?.name || 'Walk-in Patient',
        'Patient Mobile': sale.customer?.mobile || '-',
        'Patient Address': sale.customer?.address || '-',
        'Services': sale.doctorFees?.map(fee => 
          `${fee.fee.name} - Rs${fee.amount.toFixed(2)}`
        ).join('\n') || '-',
        'Total Amount': `Rs${doctorFeesTotal.toFixed(2)}`,
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
    XLSX.utils.book_append_sheet(wb, ws, 'Doctor Fee Sales');

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
    XLSX.writeFile(wb, `doctor_fee_sales_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport}
      className="gap-2"
    >
      <FileDown className="h-4 w-4" />
      Export {isFiltered ? 'Filtered' : 'All'} Sales
    </Button>
  );
};

export default ExportDoctorFeeSalesButton;