// src/app/dashboard/doctor-fees/EditDoctorFeeModal.tsx
'use client';

import { useState } from 'react';
import { doctorFeeService } from '@/services/doctorFeeService';
import { DoctorFee } from '@/types/doctorFee';
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

interface EditDoctorFeeModalProps {
  fee: DoctorFee;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDoctorFeeModal({ fee, onClose, onSuccess }: EditDoctorFeeModalProps) {
  const [formData, setFormData] = useState({
    name: fee.name,
    description: fee.description
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fee.id) {
      await doctorFeeService.update(fee.id, formData);
      onSuccess();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Doctor Fee</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Fee Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    name: e.target.value 
                  }))}
                  placeholder="e.g., Consultation Fee"
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
                  placeholder="Enter fee description"
                  className="min-h-[100px]"
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