// src/app/dashboard/viewSales/TopSellingItemsTable.tsx
import React from 'react';
import { TopSellingItem } from '@/services/salesReportService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface TopSellingItemsTableProps {
  items: TopSellingItem[];
}

const TopSellingItemsTable: React.FC<TopSellingItemsTableProps> = ({ items }) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Item</TableHead>
            <TableHead className="w-[100px] text-right">Quantity</TableHead>
            <TableHead className="w-[120px] text-right">Sales</TableHead>
            <TableHead className="w-[120px] text-right">Cost</TableHead>
            <TableHead className="w-[120px] text-right">Profit</TableHead>
            <TableHead className="w-[100px] text-right">Margin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            // Calculate profit margin
            const profitMargin = item.totalSales > 0 
              ? (item.totalProfit / item.totalSales) * 100
              : 0;
              
            return (
              <TableRow key={item.itemId}>
                <TableCell className="font-medium">
                  <div>
                    <p>{item.itemName}</p>
                    <p className="text-sm text-muted-foreground">{item.itemCode}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline">{item.totalQuantity}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  Rs{item.totalSales.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  Rs{item.totalCost.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  Rs{item.totalProfit.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {profitMargin.toFixed(1)}%
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TopSellingItemsTable;