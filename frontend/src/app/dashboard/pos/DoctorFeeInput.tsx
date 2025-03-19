// src/app/dashboard/pos/DoctorFeeInput.tsx
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { DoctorFee } from '@/types/doctorFee';

interface DoctorFeeInputProps {
  fee: DoctorFee;
  onAddToCart: (amount: number) => void;
}

export function DoctorFeeInput({ fee, onAddToCart }: DoctorFeeInputProps) {
  const [amount, setAmount] = useState(fee.defaultPrice || 0);

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) return;
    setAmount(numericValue);
  };

  const handleAddToCart = () => {
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onAddToCart(amount);
    setAmount(fee.defaultPrice || 0);
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div>
          <Label>Doctor Fee Details</Label>
          <p className="text-sm text-muted-foreground">{fee.description}</p>
        </div>

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount || ''}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="Enter amount"
          />
          {typeof fee.defaultPrice === 'number' && (
            <p className="text-sm text-muted-foreground">
              Default price: ${fee.defaultPrice.toFixed(2)}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            onClick={handleAddToCart}
            disabled={amount <= 0}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}