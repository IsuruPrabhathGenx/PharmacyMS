// src/app/dashboard/purchases/PurchaseDetails.tsx

import React from 'react';
import { PurchaseWithDetails } from '@/types/purchase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PurchaseDetailsProps {
  purchase: PurchaseWithDetails;
  onClose: () => void;
}

const PurchaseDetails = ({ purchase, onClose }: PurchaseDetailsProps) => {
  const getTotalUnits = (item: PurchaseWithDetails['items'][0]) => {
    if (item.item.unitContains) {
      return Math.floor(item.totalQuantity / item.item.unitContains.value);
    }
    return item.totalQuantity;
  };

  const formatPrice = (price: number | undefined | null) => {
    if (typeof price !== 'number') return '-';
    return `${price.toFixed(2)}`;
  };

  const calculateSubtotal = (item: PurchaseWithDetails['items'][0]) => {
    return item.quantity * item.costPricePerUnit;
  };

  const supplierName = purchase.supplier?.name || 'N/A';
  const supplierPhone = purchase.supplier?.phone || 'N/A';
  const supplierEmail = purchase.supplier?.email || 'N/A';

  const getMarginPercentage = (cost: number, selling: number) => {
    if (cost === 0 || !cost || !selling) return 0;
    return ((selling - cost) / cost * 100).toFixed(1);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
       <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Purchase Details</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {/* Purchase Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-medium mb-2">Supplier Information</h3>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{supplierName}</p>
                  <p className="text-sm text-muted-foreground">{supplierPhone}</p>
                  <p className="text-sm text-muted-foreground">{supplierEmail}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h3 className="font-medium mb-2">Purchase Information</h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Date: </span>
                    {purchase.purchaseDate instanceof Date 
                      ? purchase.purchaseDate.toLocaleDateString() 
                      : new Date(purchase.purchaseDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Invoice: </span>
                    {purchase.invoiceNumber || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Total Amount: </span>
                    Rs{purchase.totalAmount.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Table */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-4">Purchased Items</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Batch #</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Cost/Unit</TableHead>
                      <TableHead className="text-right">Selling/Unit</TableHead>
                      <TableHead className="text-right">Margin %</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchase.items?.map((item, index) => {
                      if (!item || !item.item) return null;
                      
                      const margin = getMarginPercentage(
                        item.costPricePerUnit,
                        item.sellingPricePerUnit
                      );

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.item.name}</p>
                              <p className="text-sm text-muted-foreground">Code: {item.item.code}</p>
                              <div className="flex mt-1">
                                <Badge variant="secondary">
                                  {item.item.type}
                                </Badge>
                              </div>
                              {item.item.unitContains && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.item.unitContains.value} {item.item.unitContains.unit} per unit
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.batchNumber}</TableCell>
                          <TableCell className="text-right">
                            <div>
                              <p>{item.quantity} units</p>
                              {item.totalQuantity !== item.quantity && (
                                <p className="text-xs text-muted-foreground">
                                  Total: {item.totalQuantity} {item.item.unitContains?.unit || 'units'}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>
                              <p className="font-medium">{formatPrice(item.costPricePerUnit)}</p>
                              <p className="text-xs text-muted-foreground">per unit</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>
                              <p className="font-medium">{formatPrice(item.sellingPricePerUnit)}</p>
                              <p className="text-xs text-muted-foreground">per unit</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Badge variant={
                                parseFloat(margin) >= 30 ? "success" : 
                                parseFloat(margin) >= 20 ? "default" : 
                                "destructive"
                              }>
                                {margin}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.expiryDate instanceof Date 
                              ? item.expiryDate.toLocaleDateString() 
                              : new Date(item.expiryDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(calculateSubtotal(item))}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={7}>Total</TableCell>
                      <TableCell className="text-right">
                        Rs{purchase.totalAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>

          {purchase.notes && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-medium mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{purchase.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDetails;