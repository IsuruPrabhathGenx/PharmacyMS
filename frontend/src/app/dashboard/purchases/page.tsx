//src/app/dashboard/purchases/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { purchaseService } from '@/services/purchaseService';
import { PurchaseWithDetails } from '@/types/purchase';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Search, Loader2 } from 'lucide-react';
import AddPurchaseModal from './AddPurchaseModal';
import PurchaseDetails from './PurchaseDetails';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<PurchaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseWithDetails | null>(null);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await purchaseService.getAll();
      setPurchases(data);
      setFilteredPurchases(data);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPurchases(purchases);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = purchases.filter(purchase =>
      purchase.supplier?.name?.toLowerCase().includes(query) ||
      purchase.invoiceNumber?.toLowerCase().includes(query) ||
      purchase.items.some(item => 
        item.item?.name?.toLowerCase().includes(query) ||
        item.batchNumber?.toLowerCase().includes(query)
      )
    );
    setFilteredPurchases(filtered);
  }, [searchQuery, purchases]);

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Purchase
          </Button>
        </div>

        <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by supplier, invoice, item..."
            className="flex-1 outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="relative max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="bg-white">Date</TableHead>
                        <TableHead className="bg-white">Supplier</TableHead>
                        <TableHead className="bg-white">Invoice #</TableHead>
                        <TableHead className="bg-white">Items</TableHead>
                        <TableHead className="bg-white text-right">Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchases.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No purchase records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPurchases.map((purchase) => (
                          <TableRow 
                            key={purchase.id || purchase._id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => setSelectedPurchase(purchase)}
                          >
                            <TableCell>
                              {formatDate(purchase.purchaseDate)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{purchase.supplier?.name || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {purchase.supplier?.phone || 'N/A'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{purchase.invoiceNumber || '-'}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {purchase.items.map((item, index) => (
                                  <div key={index} className="text-sm">
                                    <div className="flex items-center gap-2">
                                      <span>{item.item?.name || 'Unknown Item'}</span>
                                      <Badge variant="secondary">
                                        Batch {item.batchNumber}
                                      </Badge>
                                    </div>
                                    <p className="text-muted-foreground">
                                      Qty: {item.quantity} 
                                      {item.unitsPerPack 
                                        ? ` (Total: ${item.totalQuantity} ${item.item?.unitContains?.unit || 'units'})`
                                        : ' units'
                                      } | 
                                      Expires: {formatDate(item.expiryDate)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              Rs{purchase.totalAmount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showAddModal && (
        <AddPurchaseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadPurchases();
          }}
        />
      )}

      {selectedPurchase && (
        <PurchaseDetails
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}
    </DashboardLayout>
  );
}