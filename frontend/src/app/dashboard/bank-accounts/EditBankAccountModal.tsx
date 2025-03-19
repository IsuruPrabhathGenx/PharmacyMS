// src/app/dashboard/bank-accounts/EditBankAccountModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { bankAccountService } from '@/services/bankAccountService';
import { BankAccount } from '@/types/bankAccount';
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
import { toast } from '@/hooks/use-toast';

interface EditBankAccountModalProps {
  account: BankAccount | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditBankAccountModal({ 
  account, 
  open, 
  onClose, 
  onSuccess 
}: EditBankAccountModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    balance: 0,
    status: 'active' as 'active' | 'inactive' // Add this line
  });

  // Reset form when account changes
  useEffect(() => {
    if (account) {
      setFormData({
        bankName: account.bankName,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        balance: account.balance || 0,
        status: account.status || 'active'
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account?.id) return;
    
    try {
      setIsSubmitting(true);
      await bankAccountService.update(account.id, formData);
      toast({
        title: "Account updated",
        description: "Your bank account has been successfully updated.",
        variant: "success",
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update bank account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Bank Account</DialogTitle>
          <DialogDescription>
            Update the details of your bank account.
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
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                required
                value={formData.accountName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                required
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="balance">Balance</Label>
              <Input
                id="balance"
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.balance}
                onChange={(e) => setFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) }))}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}