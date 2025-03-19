// src/app/dashboard/laboratory-tests/EditLaboratoryTestModal.tsx
'use client';

import { useState } from 'react';
import { laboratoryTestService } from '@/services/laboratoryTestService';
import { LaboratoryTest } from '@/types/laboratoryTest';
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
import { Textarea } from "@/components/ui/textarea";

interface EditLaboratoryTestModalProps {
  test: LaboratoryTest;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditLaboratoryTestModal({ 
  test, 
  onClose, 
  onSuccess 
}: EditLaboratoryTestModalProps) {
  const [formData, setFormData] = useState({
    name: test.name,
    description: test.description,
    price: test.price.toString()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue < 0) {
      alert('Please enter a valid price');
      return;
    }

    if (test.id) {
      await laboratoryTestService.update(test.id, {
        name: formData.name,
        description: formData.description,
        price: priceValue
      });
      onSuccess();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Laboratory Test</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Test Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    name: e.target.value 
                  }))}
                  placeholder="e.g., Blood Sugar Test"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                  placeholder="Enter test description"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price: e.target.value 
                  }))}
                  placeholder="Enter test price"
                />
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
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}