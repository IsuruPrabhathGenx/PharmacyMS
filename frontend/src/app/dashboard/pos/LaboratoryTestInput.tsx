import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { LaboratoryTest } from '@/types/laboratoryTest';

interface LaboratoryTestInputProps {
  test: LaboratoryTest;
  onAddToCart: (price: number) => void;
}

export function LaboratoryTestInput({ test, onAddToCart }: LaboratoryTestInputProps) {
  const [price, setPrice] = useState(test.price);

  const handlePriceChange = (value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) return;
    setPrice(numericValue);
  };

  const handleAddToCart = () => {
    if (price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    onAddToCart(price);
    setPrice(test.price);
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div>
          <Label>Laboratory Test Details</Label>
          <p className="text-sm text-muted-foreground">{test.description}</p>
        </div>

        <div className="space-y-2">
          <Label>Price</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price || ''}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="Enter price"
          />
          <p className="text-sm text-muted-foreground">
            Default price: Rs{test.price.toFixed(2)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            onClick={handleAddToCart}
            disabled={price <= 0}
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