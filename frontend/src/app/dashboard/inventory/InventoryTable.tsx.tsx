// src/app/dashboard/inventory/InventoryTable.tsx

import { InventoryItem } from '@/types/inventory';
import { BatchWithDetails } from '@/types/purchase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface InventoryTableProps {
  inventory: InventoryItem[];
  batches: { [key: string]: BatchWithDetails[] };
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onViewBatches: (item: InventoryItem) => void;
}

interface InventoryRowProps {
  item: InventoryItem;
  batches: BatchWithDetails[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onViewBatches: (item: InventoryItem) => void;
}

const InventoryRow = ({ item, batches, onEdit, onDelete, onViewBatches }: InventoryRowProps) => {
  // Calculate total quantity from all batches
  const totalQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0);
  
  // Calculate available units
  const availableUnits = item.unitContains 
    ? Math.floor(totalQuantity / item.unitContains.value)
    : totalQuantity;

  const formatUnitContains = () => {
    if (!item.unitContains) return '-';
    return `${item.unitContains.value} ${item.unitContains.unit}`;
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{item.code}</TableCell>
      <TableCell>{item.name}</TableCell>
      <TableCell>
        <Badge variant="secondary">
          {item.type}
        </Badge>
      </TableCell>
      <TableCell>{formatUnitContains()}</TableCell>
      <TableCell className="text-right">
        {availableUnits} {item.unitContains ? 'units' : ''}
      </TableCell>
      <TableCell className="text-right">
        {totalQuantity} {item.unitContains ? item.unitContains.unit : 'units'}
      </TableCell>
      <TableCell className="text-right">
        {item.minQuantity} {item.unitContains ? 'units' : ''}
      </TableCell>
      <TableCell className="text-right">
        {item.unitContains 
          ? `${item.minQuantity * item.unitContains.value} ${item.unitContains.unit}`
          : `${item.minQuantity} units`
        }
      </TableCell>
      <TableCell>
        {availableUnits < item.minQuantity && (
          <Badge variant="destructive">Low Stock</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewBatches(item)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          className="h-8 w-8 p-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-900"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

const InventoryTable = ({ inventory, batches, onEdit, onDelete, onViewBatches }: InventoryTableProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Inventory Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="relative overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-white">Code</TableHead>
                  <TableHead className="sticky top-0 bg-white">Name</TableHead>
                  <TableHead className="sticky top-0 bg-white">Type</TableHead>
                  <TableHead className="sticky top-0 bg-white">Contains Per Unit</TableHead>
                  <TableHead className="sticky top-0 bg-white text-right">Available Units</TableHead>
                  <TableHead className="sticky top-0 bg-white text-right">Total Quantity</TableHead>
                  <TableHead className="sticky top-0 bg-white text-right">Min Units</TableHead>
                  <TableHead className="sticky top-0 bg-white text-right">Min Total Quantity</TableHead>
                  <TableHead className="sticky top-0 bg-white">Status</TableHead>
                  <TableHead className="sticky top-0 bg-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <InventoryRow 
                    key={item.id} 
                    item={item} 
                    batches={batches[item.id!] || []}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewBatches={onViewBatches}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryTable;