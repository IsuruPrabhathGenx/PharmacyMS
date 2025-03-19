// src/app/dashboard/inventory/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { purchaseService } from '@/services/purchaseService';
import { InventoryItem } from '@/types/inventory';
import { BatchWithDetails } from '@/types/purchase';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Pencil, Trash2, Loader2, Eye, Search, FilterX } from 'lucide-react';
import AddInventoryModal from './AddInventoryModal';
import EditInventoryModal from './EditInventoryModal';
import BatchDetails from './BatchDetails';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import InventoryTable from './InventoryTable.tsx';
import ExcelExport from './ExcelExport';

type FilterType = 'all' | 'low-stock' | 'expiring-3m' | 'expiring-6m' | 'has-batches' | 'no-batches';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemBatches, setItemBatches] = useState<{ [key: string]: BatchWithDetails[] }>({});
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const applyFilters = (items: InventoryItem[], batches: { [key: string]: BatchWithDetails[] }, filter: FilterType, search: string) => {
    // First apply search filter
    let filtered = items;
    
    if (search.trim() !== '') {
      const query = search.toLowerCase().trim();
      filtered = items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.code.toLowerCase().includes(query) || 
        item.type.toLowerCase().includes(query)
      );
    }
    
    // Then apply category filter
    switch (filter) {
      case 'low-stock':
        filtered = filtered.filter(item => {
          const itemBatches = batches[item.id!] || [];
          const totalQuantity = itemBatches.reduce((sum, batch) => sum + batch.quantity, 0);
          const availableUnits = item.unitContains 
            ? Math.floor(totalQuantity / item.unitContains.value)
            : totalQuantity;
          return availableUnits < item.minQuantity;
        });
        break;
        
      case 'expiring-3m':
      case 'expiring-6m':
        const months = filter === 'expiring-3m' ? 3 : 6;
        const thresholdDate = new Date();
        thresholdDate.setMonth(thresholdDate.getMonth() + months);
        
        filtered = filtered.filter(item => {
          const itemBatches = batches[item.id!] || [];
          return itemBatches.some(batch => {
            const expiryDate = new Date(batch.expiryDate);
            return expiryDate <= thresholdDate && expiryDate > new Date();
          });
        });
        break;

      case 'has-batches':
        filtered = filtered.filter(item => {
          const itemBatches = batches[item.id!] || [];
          return itemBatches.length > 0;
        });
        break;

      case 'no-batches':
        filtered = filtered.filter(item => {
          const itemBatches = batches[item.id!] || [];
          return itemBatches.length === 0;
        });
        break;
    }
    
    setFilteredInventory(filtered);
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAll();
      setInventory(data);
      
      // Load batch details for each item
      const batchPromises = data.map(async (item) => {
        if (item.id) {
          const batches = await purchaseService.getBatchesByItem(item.id);
          return { itemId: item.id, batches };
        }
        return null;
      });
      
      const batchResults = await Promise.all(batchPromises);
      const batchMap: { [key: string]: BatchWithDetails[] } = {};
      batchResults.forEach(result => {
        if (result && result.itemId) {
          batchMap[result.itemId] = result.batches;
        }
      });
      setItemBatches(batchMap);
      
      // Apply initial filter
      applyFilters(data, batchMap, 'all', '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    applyFilters(inventory, itemBatches, filterType, searchQuery);
  }, [filterType, inventory, itemBatches, searchQuery]);

  const handleDelete = async (id: string) => {
    await inventoryService.delete(id);
    setShowDeleteDialog(false);
    await loadInventory();
  };

  const clearFilters = () => {
    setFilterType('all');
    setSearchQuery('');
  };

  // Calculate summary counts
  const getLowStockCount = () => {
    return inventory.filter(item => {
      const batches = itemBatches[item.id!] || [];
      const totalQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0);
      const availableUnits = item.unitContains 
        ? Math.floor(totalQuantity / item.unitContains.value)
        : totalQuantity;
      return availableUnits < item.minQuantity;
    }).length;
  };

  const getExpiringCount = (months: number) => {
    const thresholdDate = new Date();
    thresholdDate.setMonth(thresholdDate.getMonth() + months);
    
    return inventory.filter(item => {
      const batches = itemBatches[item.id!] || [];
      return batches.some(batch => {
        const expiryDate = new Date(batch.expiryDate);
        return expiryDate <= thresholdDate && expiryDate > new Date();
      });
    }).length;
  };

  const getNoBatchesCount = () => {
    return inventory.filter(item => {
      const batches = itemBatches[item.id!] || [];
      return batches.length === 0;
    }).length;
  };

  const isFiltered = filterType !== 'all' || searchQuery.trim() !== '';

  return (
    <DashboardLayout>
      <div className="space-y-4 p-6 h-full">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <div className="flex items-center gap-4">
            <ExcelExport inventory={inventory} batches={itemBatches} />
            <Button
              onClick={() => setShowAddModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setFilterType('low-stock')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getLowStockCount()}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setFilterType('expiring-3m')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expiring in 3 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getExpiringCount(3)}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setFilterType('expiring-6m')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expiring in 6 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getExpiringCount(6)}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setFilterType('no-batches')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Items Without Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getNoBatchesCount()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search by name, code, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Select
                  value={filterType}
                  onValueChange={(value: FilterType) => setFilterType(value)}
                >
                  <SelectTrigger className="min-w-[180px]">
                    <SelectValue placeholder="Filter items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Filter</SelectLabel>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="low-stock">Low Stock Items</SelectItem>
                      <SelectItem value="expiring-3m">Expiring in 3 Months</SelectItem>
                      <SelectItem value="expiring-6m">Expiring in 6 Months</SelectItem>
                      <SelectItem value="has-batches">Has Stock</SelectItem>
                      <SelectItem value="no-batches">No Stock</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                {isFiltered && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearFilters}
                    title="Clear filters"
                  >
                    <FilterX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {isFiltered && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-2 py-1">
                    {filterType === 'all' ? 'Search results' : 
                     filterType === 'low-stock' ? 'Low Stock Items' :
                     filterType === 'expiring-3m' ? 'Expiring in 3 Months' :
                     filterType === 'expiring-6m' ? 'Expiring in 6 Months' :
                     filterType === 'has-batches' ? 'Items with Stock' :
                     filterType === 'no-batches' ? 'Items without Stock' : ''}
                    {searchQuery && ` + Search: "${searchQuery}"`}
                  </Badge>
                </div>
              )}
              
              <span className="text-sm text-muted-foreground ml-auto">
                Showing {filteredInventory.length} of {inventory.length} items
              </span>
            </div>

            <div className="relative">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <InventoryTable 
                  inventory={filteredInventory}
                  batches={itemBatches}
                  onEdit={(item) => {
                    setSelectedItem(item);
                    setShowEditModal(true);
                  }}
                  onDelete={(item) => {
                    setSelectedItem(item);
                    setShowDeleteDialog(true);
                  }}
                  onViewBatches={(item) => {
                    setSelectedItem(item);
                    setShowBatchDetails(true);
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-medium">{selectedItem?.name}</span> from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => selectedItem?.id && handleDelete(selectedItem.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showAddModal && (
        <AddInventoryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadInventory();
          }}
        />
      )}

      {showEditModal && selectedItem && (
        <EditInventoryModal
          item={selectedItem}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedItem(null);
            loadInventory();
          }}
        />
      )}

      {showBatchDetails && selectedItem && (
        <BatchDetails
          item={selectedItem}
          onClose={() => {
            setShowBatchDetails(false);
            setSelectedItem(null);
          }}
        />
      )}

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94A3B8;
        }
      `}</style>
    </DashboardLayout>
  );
}