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

interface SalesTableProps {
  sales: Sale[];
  onViewDetails: (sale: Sale) => void;
}

export function SalesTable({ sales, onViewDetails }: SalesTableProps) {
  const sortedSales = [...sales]
    .filter(sale => sale.items && sale.items.length > 0)
    .sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime());

  // Calculate inventory totals
  const calculateInventoryTotals = (sale: Sale) => {
    const inventoryTotal = sale.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const inventoryCost = sale.items.reduce((sum, item) => sum + item.totalCost, 0);
    return { total: inventoryTotal, cost: inventoryCost };
  };

  return (
    <div className="rounded-md border">
      {/* Fixed header */}
      <div className="border-b">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Date</TableHead>
              <TableHead className="w-[200px]">Customer</TableHead>
              <TableHead className="w-[100px]">Items</TableHead>
              <TableHead className="w-[120px]">Total Amount</TableHead>
              <TableHead className="w-[120px]">Profit</TableHead>
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
              const { total, cost } = calculateInventoryTotals(sale);
              const profit = total - cost;

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
                      <span className="text-muted-foreground">Walk-in Customer</span>
                    )}
                  </TableCell>
                  <TableCell className="w-[100px]">
                    <span className="font-medium">{sale.items.length} items</span>
                  </TableCell>
                  <TableCell className="w-[120px] font-medium">
                    Rs{total.toFixed(2)}
                  </TableCell>
                  <TableCell className="w-[120px]">
                    <span className="text-green-600 font-medium">
                      Rs{profit.toFixed(2)}
                    </span>
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