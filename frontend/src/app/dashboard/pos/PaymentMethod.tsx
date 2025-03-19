import React, { useState, useEffect, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bankAccountService } from '@/services/bankAccountService';
import { BankAccount } from '@/types/bankAccount';
import { Wallet, CreditCard, Building2, ChevronDown, CheckCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentMethodProps {
  totalAmount: number;
  onPaymentMethodChange: (method: string, bankAccountId?: string) => void;
  onPressEnter?: () => void; // Add callback for Enter key
}

export default function PaymentMethod({ 
  totalAmount, 
  onPaymentMethodChange, 
  onPressEnter 
}: PaymentMethodProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isBankSelectOpen, setIsBankSelectOpen] = useState(false);
  
  // Refs for focusing elements
  const cashRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const bankDepositRef = useRef<HTMLButtonElement>(null);
  const bankSelectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (paymentMethod === 'bank_deposit') {
      loadBankAccounts();
    }
  }, [paymentMethod]);

  // Auto-focus on the first payment method option when the component mounts
  useEffect(() => {
    if (cashRef.current) {
      cashRef.current.focus();
    }
  }, []);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await bankAccountService.getAll();
      setBankAccounts(accounts);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (method !== 'bank_deposit') {
      setSelectedBankAccount('');
      onPaymentMethodChange(method);
    } else {
      // Focus on the bank select after a short delay to allow the UI to update
      setTimeout(() => {
        if (bankSelectRef.current) {
          bankSelectRef.current.focus();
        }
      }, 50);
    }
  };

  const handleBankAccountSelect = (accountId: string) => {
    setSelectedBankAccount(accountId);
    onPaymentMethodChange('bank_deposit', accountId);
    setIsBankSelectOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        if (paymentMethod === 'cash') {
          handlePaymentMethodChange('card');
          cardRef.current?.focus();
        } else if (paymentMethod === 'card') {
          handlePaymentMethodChange('bank_deposit');
          bankDepositRef.current?.focus();
        } else if (paymentMethod === 'bank_deposit' && !isBankSelectOpen) {
          // If the select dropdown is not open, focus on it
          bankSelectRef.current?.focus();
        }
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        if (paymentMethod === 'bank_deposit' && !isBankSelectOpen) {
          handlePaymentMethodChange('card');
          cardRef.current?.focus();
        } else if (paymentMethod === 'card') {
          handlePaymentMethodChange('cash');
          cashRef.current?.focus();
        } else if (paymentMethod === 'bank_deposit' && isBankSelectOpen) {
          // Close the select dropdown if it's open
          setIsBankSelectOpen(false);
        }
        break;
        
      case 'Enter':
        if (paymentMethod === 'bank_deposit' && !selectedBankAccount) {
          if (!isBankSelectOpen) {
            e.preventDefault();
            setIsBankSelectOpen(true);
          }
        } else if (onPressEnter && ((paymentMethod !== 'bank_deposit') || 
                  (paymentMethod === 'bank_deposit' && selectedBankAccount))) {
          e.preventDefault();
          onPressEnter();
        }
        break;
        
      case 'Escape':
        if (isBankSelectOpen) {
          e.preventDefault();
          setIsBankSelectOpen(false);
        }
        break;
    }
  };

  // Handle bank account selection with keyboard
  const handleBankAccountKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, accountId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBankAccountSelect(accountId);
      setIsBankSelectOpen(false);
    }
  };

  // Icons for payment methods
  const PaymentMethodIcon = {
    cash: Wallet,
    card: CreditCard,
    bank_deposit: Building2
  };

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown}>
      <Label className="flex items-center text-lg font-medium">
        <span>Payment Method</span>
        <Badge variant="outline" className="ml-2 text-xs font-normal">Use arrow keys to navigate</Badge>
      </Label>
      
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(PaymentMethodIcon).map(([method, Icon]) => {
          const isSelected = paymentMethod === method;
          const ref = method === 'cash' ? cashRef : method === 'card' ? cardRef : bankDepositRef;
          
          return (
            <div 
              key={method}
              className={`
                relative p-4 border rounded-lg cursor-pointer transition-all
                ${isSelected 
                  ? 'bg-primary/10 border-primary ring-1 ring-primary/50 shadow-sm' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'}
              `}
              onClick={() => handlePaymentMethodChange(method)}
              ref={ref as React.RefObject<HTMLDivElement>}
              tabIndex={0}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`p-3 rounded-full ${isSelected ? 'bg-primary/20' : 'bg-gray-100'}`}>
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-gray-600'}`} />
                </div>
                <span className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                  {method === 'cash' ? 'Cash' : method === 'card' ? 'Card' : 'Bank Deposit'}
                </span>
                {isSelected && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </div>
              <input 
                type="radio" 
                name="payment-method" 
                value={method}
                className="sr-only"
                checked={isSelected}
                onChange={() => handlePaymentMethodChange(method)}
              />
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {paymentMethod === 'bank_deposit' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 overflow-hidden"
          >
            <Label className="flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-primary" />
              <span>Select Bank Account</span>
              <Badge variant="outline" className="ml-2 text-xs font-normal">press Enter to select</Badge>
            </Label>
            <Select
              value={selectedBankAccount}
              onValueChange={handleBankAccountSelect}
              open={isBankSelectOpen}
              onOpenChange={setIsBankSelectOpen}
            >
              <SelectTrigger 
                className="w-full bg-white" 
                ref={bankSelectRef}
                onKeyDown={handleKeyDown}
              >
                <SelectValue placeholder="Select a bank account" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="p-2 text-center text-gray-500">Loading bank accounts...</div>
                ) : bankAccounts.length === 0 ? (
                  <div className="p-2 text-center text-gray-500">No bank accounts available</div>
                ) : (
                  bankAccounts.map((account) => (
                    <SelectItem 
                      key={account.id} 
                      value={account.id!}
                      onKeyDown={(e) => handleBankAccountKeyDown(e, account.id!)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col py-1">
                        <div className="font-medium">{account.bankName} - {account.accountName}</div>
                        <div className="text-xs text-gray-500">
                          Account: {account.accountNumber}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            
            {selectedBankAccount && (
              <div className="text-sm text-green-600 flex items-center mt-2">
                <CheckCircle className="h-4 w-4 mr-1.5" />
                <span>Bank account selected. Press Enter to complete sale.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Display the total amount prominently */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
        <div className="text-sm text-gray-500 mb-1">Payment Total:</div>
        <div className="text-2xl font-bold text-primary">Rs{totalAmount.toFixed(2)}</div>
      </div>
      
      {/* Instruction for keyboard navigation */}
      <div className="text-sm text-muted-foreground mt-4 bg-gray-50 p-3 rounded-md border">
        <p className="font-medium mb-1">Keyboard shortcuts:</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center"><Badge variant="secondary" className="mr-1 text-xs">←→</Badge> Change payment method</div>
          <div className="flex items-center"><Badge variant="secondary" className="mr-1 text-xs">Enter</Badge> Complete sale</div>
          <div className="flex items-center"><Badge variant="secondary" className="mr-1 text-xs">Esc</Badge> Close dropdown</div>
        </div>
      </div>
    </div>
  );
}