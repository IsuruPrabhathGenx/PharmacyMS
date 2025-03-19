// src/app/dashboard/bank-accounts/AddBankAccountModal.tsx
'use client';

import { useState } from 'react';
import { bankAccountService } from '@/services/bankAccountService';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface AddBankAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBankAccountModal({ open, onClose, onSuccess }: AddBankAccountModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    balance: 0,
    status: 'active' as 'active' | 'inactive' // Add this line
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await bankAccountService.create(formData);
      toast({
        title: "Account created",
        description: "Your bank account has been successfully added.",
        variant: "success",
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create bank account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Bank Account</DialogTitle>
          <DialogDescription>
            Enter the details of your bank account to add it to your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-2">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                required
                value={formData.bankName}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                placeholder="Enter bank name"
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                required
                value={formData.accountName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                placeholder="Enter account name"
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                required
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="Enter account number"
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="balance">Opening Balance</Label>
              <Input
                id="balance"
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.balance}
                onChange={(e) => setFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) }))}
                placeholder="Enter opening balance"
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Bank Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}