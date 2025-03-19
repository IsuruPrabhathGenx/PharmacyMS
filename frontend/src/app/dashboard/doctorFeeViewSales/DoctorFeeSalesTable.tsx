// src/app/dashboard/doctorFeeViewSales/DoctorFeeSalesTable.tsx
import React from 'react';
import { Sale } from '@/types/sale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from 'lucide-react';

interface DoctorFeeSalesTableProps {
  sales: Sale[];
  onViewDetails: (sale: Sale) => void;
}

export function DoctorFeeSalesTable({ sales, onViewDetails }: DoctorFeeSalesTableProps) {
  const sortedSales = [...sales]
    .filter(sale => sale.doctorFees && sale.doctorFees.length > 0)
    .sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime());

  // Calculate doctor fees total
  const calculateDoctorFeesTotal = (sale: Sale) => {
    return sale.doctorFees?.reduce((sum, fee) => sum + fee.amount, 0) || 0;
  };

  return (
    <div className="rounded-md border">
      {/* Fixed header */}
      <div className="border-b">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Date</TableHead>
              <TableHead className="w-[200px]">Patient</TableHead>
              <TableHead className="w-[200px]">Services</TableHead>
              <TableHead className="w-[120px]">Total Amount</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Scrollable body */}
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
        <Table>
          <TableBody>
            {sortedSales.map((sale) => {
              const doctorFeesTotal = calculateDoctorFeesTotal(sale);

              return (
                <TableRow key={sale.id}>
                  <TableCell className="w-[180px]">
                    {sale.saleDate.toLocaleDateString()}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {sale.saleDate.toLocaleTimeString()}
                    </span>
                  </TableCell>
                  <TableCell className="w-[200px]">
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
                  </TableCell>
                  <TableCell className="w-[200px]">
                    <div className="space-y-1">
                      {sale.doctorFees?.map((fee, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{fee.fee.name}</span>
                          <span className="text-muted-foreground"> - Rs{fee.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="w-[120px] font-medium">
                    Rs{doctorFeesTotal.toFixed(2)}
                  </TableCell>
                  <TableCell className="w-[60px]">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(sale)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}