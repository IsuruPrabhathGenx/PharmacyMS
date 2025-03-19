// src/app/dashboard/purchases/AddPurchaseModal.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { purchaseService } from '@/services/purchaseService';
import { supplierService } from '@/services/supplierService';
import { inventoryService } from '@/services/inventoryService';
import { Supplier } from '@/types/supplier';
import { InventoryItem } from '@/types/inventory';
import { PurchaseItem } from '@/types/purchase';
import { Plus, X, Loader2, Search, ChevronDown, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AddPurchaseModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPurchaseModal({ onClose, onSuccess }: AddPurchaseModalProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI state for dropdowns
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  
  // For filtering suppliers and inventory
  const [supplierFilter, setSupplierFilter] = useState('');
  const [itemFilter, setItemFilter] = useState('');

  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    items: [] as PurchaseItem[],
    totalAmount: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    notes: ''
  });

  const [currentItem, setCurrentItem] = useState({
    itemId: '',
    itemName: '',
    quantity: 0,
    expiryDate: '',
    costPricePerUnit: 0,
    sellingPricePerUnit: 0
  });

  // Filtered lists
  const filteredSuppliers = useMemo(() => {
    if (!supplierFilter.trim()) return suppliers;
    const lowerFilter = supplierFilter.toLowerCase();
    return suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(lowerFilter) || 
      (supplier.phone && supplier.phone.toLowerCase().includes(lowerFilter))
    );
  }, [suppliers, supplierFilter]);
  
  const filteredInventory = useMemo(() => {
    if (!itemFilter.trim()) return inventory;
    const lowerFilter = itemFilter.toLowerCase();
    return inventory.filter(item => 
      item.name.toLowerCase().includes(lowerFilter) || 
      (item.code && item.code.toLowerCase().includes(lowerFilter))
    );
  }, [inventory, itemFilter]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [suppliersData, inventoryData] = await Promise.all([
          supplierService.getActive(),
          inventoryService.getAll()
        ]);
        setSuppliers(suppliersData);
        setInventory(inventoryData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Reset filters when dropdown closes
  useEffect(() => {
    if (!supplierOpen) {
      setSupplierFilter('');
    }
  }, [supplierOpen]);

  useEffect(() => {
    if (!itemOpen) {
      setItemFilter('');
    }
  }, [itemOpen]);

  const handleAddItem = async () => {
    if (!currentItem.itemId || !currentItem.quantity || !currentItem.expiryDate || 
        currentItem.costPricePerUnit <= 0 || currentItem.sellingPricePerUnit <= 0) {
      alert('Please fill in all item details including prices');
      return;
    }

    if (currentItem.sellingPricePerUnit <= currentItem.costPricePerUnit) {
      alert('Selling price should be higher than cost price');
      return;
    }

    const selectedItem = inventory.find(item => item.id === currentItem.itemId);
    if (!selectedItem) return;

    const batchNumber = await purchaseService.getNextBatchNumber(currentItem.itemId);
    const unitsPerPack = selectedItem.unitContains?.value;
    const totalQuantity = unitsPerPack ? currentItem.quantity * unitsPerPack : currentItem.quantity;

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        inventoryItem: currentItem.itemId,
        itemId: currentItem.itemId, // For compatibility
        batchNumber,
        quantity: currentItem.quantity,
        unitsPerPack,
        totalQuantity,
        expiryDate: new Date(currentItem.expiryDate),
        costPricePerUnit: currentItem.costPricePerUnit,
        sellingPricePerUnit: currentItem.sellingPricePerUnit
      }],
      totalAmount: prev.totalAmount + (currentItem.costPricePerUnit * currentItem.quantity)
    }));

    setCurrentItem({
      itemId: '',
      itemName: '',
      quantity: 0,
      expiryDate: '',
      costPricePerUnit: 0,
      sellingPricePerUnit: 0
    });
  };

  const removeItem = (index: number) => {
    setFormData(prev => {
      const removedItem = prev.items[index];
      const newTotalAmount = prev.totalAmount - (removedItem.costPricePerUnit * removedItem.quantity);
      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
        totalAmount: newTotalAmount
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.supplierId) {
      alert('Please select a supplier');
      return;
    }

    if (!formData.purchaseDate) {
      alert('Please select a purchase date');
      return;
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        supplier: formData.supplierId,
        items: formData.items,
        totalAmount: formData.totalAmount,
        purchaseDate: new Date(formData.purchaseDate),
        invoiceNumber: formData.invoiceNumber,
        notes: formData.notes
      };
      
      await purchaseService.create(submitData);
      onSuccess();
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Error creating purchase. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Loading Purchase Data</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Add New Purchase</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 px-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className="w-full justify-between"
                    >
                      {formData.supplierId
                        ? formData.supplierName
                        : "Select supplier..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <div className="rounded-md border">
                      <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                          className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Search supplier..."
                          value={supplierFilter}
                          onChange={(e) => setSupplierFilter(e.target.value)}
                        />
                      </div>
                      <div className="max-h-64 overflow-auto p-1">
                        {filteredSuppliers.length === 0 ? (
                          <div className="py-6 text-center text-sm">No supplier found.</div>
                        ) : (
                          filteredSuppliers.map((supplier) => (
                            <div
                              key={supplier.id || supplier._id}
                              className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
                                formData.supplierId === (supplier.id || supplier._id) ? "bg-accent" : ""
                              }`}
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  supplierId: supplier.id || supplier._id || '',
                                  supplierName: supplier.name
                                });
                                setSupplierOpen(false);
                              }}
                            >
                              <div className="flex flex-col">
                                <span>{supplier.name}</span>
                                <span className="text-xs text-muted-foreground">{supplier.phone}</span>
                              </div>
                              <Check
                                className={`ml-auto h-4 w-4 ${formData.supplierId === (supplier.id || supplier._id) ? "opacity-100" : "opacity-0"}`}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    invoiceNumber: e.target.value 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Purchase Date *</Label>
                <Input
                  type="date"
                  required
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    purchaseDate: e.target.value 
                  }))}
                />
              </div>
            </div>

            <Card>
              <CardContent className="pt-4">
                <h3 className="font-medium mb-4">Add Items</h3>
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Item *</Label>
                      <Popover open={itemOpen} onOpenChange={setItemOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            type="button"
                            className="w-full justify-between"
                          >
                            {currentItem.itemId
                              ? currentItem.itemName
                              : "Select item..."}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <div className="rounded-md border">
                            <div className="flex items-center border-b px-3">
                              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                              <input
                                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Search by name or code..."
                                value={itemFilter}
                                onChange={(e) => setItemFilter(e.target.value)}
                              />
                            </div>
                            <div className="max-h-64 overflow-auto p-1">
                              {filteredInventory.length === 0 ? (
                                <div className="py-6 text-center text-sm">No item found.</div>
                              ) : (
                                filteredInventory.map((item) => (
                                  <div
                                    key={item.id || item._id}
                                    className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
                                      currentItem.itemId === (item.id || item._id) ? "bg-accent" : ""
                                    }`}
                                    onClick={() => {
                                      setCurrentItem({
                                        ...currentItem,
                                        itemId: item.id || item._id || '',
                                        itemName: item.name
                                      });
                                      setItemOpen(false);
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span>{item.name}</span>
                                      <span className="text-xs text-muted-foreground">Code: {item.code} | Type: {item.type}</span>
                                    </div>
                                    <Check
                                      className={`ml-auto h-4 w-4 ${currentItem.itemId === (item.id || item._id) ? "opacity-100" : "opacity-0"}`}
                                    />
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Quantity (Units) *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={currentItem.quantity || ''}
                          onChange={(e) => setCurrentItem(prev => ({ 
                            ...prev, 
                            quantity: parseInt(e.target.value) 
                          }))}
                        />
                        {currentItem.itemId && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {(() => {
                              const item = inventory.find(i => (i.id || i._id) === currentItem.itemId);
                              if (item?.unitContains) {
                                const total = currentItem.quantity * item.unitContains.value;
                                return `Total: ${total} ${item.unitContains.unit}`;
                              }
                              return `Total: ${currentItem.quantity} units`;
                            })()}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Expiry Date *</Label>
                        <Input
                          type="date"
                          value={currentItem.expiryDate}
                          onChange={(e) => setCurrentItem(prev => ({ 
                            ...prev, 
                            expiryDate: e.target.value 
                          }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Cost Price per Unit *</Label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={currentItem.costPricePerUnit || ''}
                          onChange={(e) => setCurrentItem(prev => ({
                            ...prev,
                            costPricePerUnit: parseFloat(e.target.value)
                          }))}
                        />
                      </div>

                      <div>
                        <Label>Selling Price per Unit *</Label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={currentItem.sellingPricePerUnit || ''}
                          onChange={(e) => setCurrentItem(prev => ({
                            ...prev,
                            sellingPricePerUnit: parseFloat(e.target.value)
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                    <Button
                        type="button"
                        onClick={handleAddItem}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                  </div>

                  {/* Added Items List */}
                  {formData.items.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Added Items</h4>
                      <div className="space-y-2">
                        {formData.items.map((item, index) => {
                          const inventoryItem = inventory.find(i => (i.id || i._id) === item.inventoryItem);
                          return (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                            >
                              <div>
                                <div className="font-medium">{inventoryItem?.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Batch: {item.batchNumber} | Qty: {item.quantity} 
                                  {item.unitsPerPack ? ` (Total: ${item.totalQuantity} ${inventoryItem?.unitContains?.unit})` : ' units'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Cost: Rs{item.costPricePerUnit}/unit | Selling: Rs{item.sellingPricePerUnit}/unit
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Expires: {typeof item.expiryDate === 'object' ? item.expiryDate.toLocaleDateString() : new Date(item.expiryDate).toLocaleDateString()}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Any additional notes..."
              />
            </div>

            <div className="space-y-2">
              <Label>Total Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.totalAmount}
                readOnly
                className="bg-gray-50"
              />
              <div className="text-sm text-muted-foreground">
                Auto-calculated based on cost price and quantity
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formData.items.length === 0 || saving}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Purchase'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}