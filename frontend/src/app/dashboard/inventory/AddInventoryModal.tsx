// src/app/dashboard/inventory/AddInventoryModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { MedicineType, getMedicineTypeUnit } from '@/types/inventory';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface AddInventoryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const medicineTypes: MedicineType[] = [
  'Tablet',
  'Syrup',
  'Capsule',
  'Injection',
  'Cream',
  'Ointment',
  'Other'
];

export default function AddInventoryModal({ onClose, onSuccess }: AddInventoryModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Tablet' as MedicineType,
    hasUnitContains: false,
    unitContains: {
      value: 0,
      unit: getMedicineTypeUnit('Tablet')
    },
    minQuantity: 0
  });

  const [totalQuantity, setTotalQuantity] = useState('0');

  useEffect(() => {
    if (formData.hasUnitContains) {
      const total = formData.minQuantity * formData.unitContains.value;
      setTotalQuantity(`${total} ${formData.unitContains.unit}`);
    } else {
      setTotalQuantity(`${formData.minQuantity} units`);
    }
  }, [formData.minQuantity, formData.unitContains.value, formData.unitContains.unit, formData.hasUnitContains]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      unitContains: {
        ...prev.unitContains,
        unit: getMedicineTypeUnit(prev.type)
      }
    }));
  }, [formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      unitContains: formData.hasUnitContains ? formData.unitContains : undefined
    };
    await inventoryService.create(submitData);
    onSuccess();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Item Code *</Label>
                  <Input
                    id="code"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: MedicineType) => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicineTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasUnitContains"
                    checked={formData.hasUnitContains}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        hasUnitContains: checked as boolean 
                      }))
                    }
                  />
                  <Label htmlFor="hasUnitContains">Specify contents per unit</Label>
                </div>

                {formData.hasUnitContains && (
                  <div className="space-y-2">
                    <Label htmlFor="unitContains">
                      Contains per Unit * ({formData.unitContains.unit})
                    </Label>
                    <Input
                      id="unitContains"
                      type="number"
                      required
                      min="0"
                      step={formData.type === 'Tablet' || formData.type === 'Capsule' ? "1" : "0.01"}
                      value={formData.unitContains.value}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        unitContains: {
                          ...prev.unitContains,
                          value: parseFloat(e.target.value)
                        }
                      }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="minQuantity">Minimum Stock Level (Units/Bottles) *</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    required
                    min="0"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      minQuantity: parseInt(e.target.value) 
                    }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Total minimum quantity: {totalQuantity}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
            >
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}