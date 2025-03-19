import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryItem } from '@/types/inventory';
import { BatchWithDetails } from '@/types/purchase';
import { ShoppingCart, Plus, Minus, AlertCircle, Package2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface QuantityInputProps {
  item: InventoryItem;
  batch: BatchWithDetails;
  onQuantityChange: (unitQty: number, subUnitQty: number) => void;
  unitQtyInputRef?: React.RefObject<HTMLInputElement>;
  subUnitQtyInputRef?: React.RefObject<HTMLInputElement>;
  onEnterKeyPress?: (unitQty: number, subUnitQty: number) => void;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  item,
  batch,
  onQuantityChange,
  unitQtyInputRef,
  subUnitQtyInputRef,
  onEnterKeyPress
}) => {
  const [unitQty, setUnitQty] = useState<number>(0);
  const [subUnitQty, setSubUnitQty] = useState<number>(0);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  
  // Local refs if none are provided from parent
  const localUnitQtyRef = useRef<HTMLInputElement>(null);
  const localSubUnitQtyRef = useRef<HTMLInputElement>(null);
  
  // Use provided refs or local refs
  const unitQtyRef = unitQtyInputRef || localUnitQtyRef;
  const subUnitQtyRef = subUnitQtyInputRef || localSubUnitQtyRef;
  
  // Get the unit name from the item
  const unitName = item.type === 'Tablet' || item.type === 'Capsule' 
    ? 'tablets'
    : item.type === 'Syrup' || item.type === 'Injection'
      ? 'ml'
      : item.type === 'Cream' || item.type === 'Ointment'
        ? 'g'
        : 'units';
  
  // Max available quantity based on batch
  const maxAvailable = batch.quantity;
  
  // Set up keyboard event handlers for the inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Enter key to add to cart
      if (e.key === 'Enter' && isValid && onEnterKeyPress) {
        e.preventDefault();
        onEnterKeyPress(unitQty, subUnitQty);
      }
    };
    
    // Attach listeners to the input refs
    const unitInput = unitQtyRef.current;
    const subUnitInput = subUnitQtyRef.current;
    
    if (unitInput) {
      unitInput.addEventListener('keydown', handleKeyDown);
    }
    
    if (subUnitInput) {
      subUnitInput.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (unitInput) {
        unitInput.removeEventListener('keydown', handleKeyDown);
      }
      
      if (subUnitInput) {
        subUnitInput.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [unitQty, subUnitQty, isValid, onEnterKeyPress]);
  
  // Validate input whenever quantities change
  useEffect(() => {
    validateQuantities();
  }, [unitQty, subUnitQty, maxAvailable]);
  
  const validateQuantities = () => {
    // Check that at least one quantity is positive
    if (unitQty <= 0 && subUnitQty <= 0) {
      setIsValid(false);
      setValidationMessage('Please enter a valid quantity');
      return;
    }
    
    // Calculate total units for comparison
    let totalUnits = unitQty;
    if (item.unitContains && subUnitQty > 0) {
      totalUnits += subUnitQty / item.unitContains.value;
    }
    
    // Check if we have enough in stock
    if (totalUnits > maxAvailable) {
      setIsValid(false);
      setValidationMessage(`Not enough in stock. Max available: ${maxAvailable}`);
      return;
    }
    
    // If we have subunits, check that they're less than the unit contains
    if (item.unitContains && subUnitQty >= item.unitContains.value) {
      setIsValid(false);
      setValidationMessage(`Sub-unit quantity should be less than ${item.unitContains.value}`);
      return;
    }
    
    // All checks passed
    setIsValid(true);
    setValidationMessage('');
  };
  
  const handleUnitQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setUnitQty(value >= 0 ? value : 0);
  };
  
  const handleSubUnitQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setSubUnitQty(value >= 0 ? value : 0);
  };
  
  // Increment and decrement handlers
  const incrementUnitQty = () => {
    if (unitQty < maxAvailable) {
      setUnitQty(prev => prev + 1);
    }
  };
  
  const decrementUnitQty = () => {
    if (unitQty > 0) {
      setUnitQty(prev => prev - 1);
    }
  };
  
  const incrementSubUnitQty = () => {
    if (item.unitContains && subUnitQty < item.unitContains.value - 1) {
      setSubUnitQty(prev => prev + 1);
    }
  };
  
  const decrementSubUnitQty = () => {
    if (subUnitQty > 0) {
      setSubUnitQty(prev => prev - 1);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Package2 className="h-4 w-4 mr-2 text-primary" />
          <span className="font-medium">Quantity</span>
        </div>
        <div className="text-sm text-gray-500 flex items-center">
          <span>Available: </span>
          <Badge variant="outline" className="ml-1 font-normal">
            {batch.quantity} {batch.quantity === 1 ? unitName : unitName}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="unitQty" className="text-sm font-medium flex items-center justify-between">
            <span>Units</span>
            <Badge variant="secondary" className="font-normal text-xs">
              Price: Rs{batch.unitPrice?.toFixed(2)}/unit
            </Badge>
          </label>
          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-r-none border-r-0"
              onClick={decrementUnitQty}
              disabled={unitQty <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="unitQty"
              type="number"
              min="0"
              step="1"
              value={unitQty || ''}
              onChange={handleUnitQtyChange}
              placeholder="0"
              ref={unitQtyRef}
              className="h-9 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-l-none border-l-0"
              onClick={incrementUnitQty}
              disabled={unitQty >= maxAvailable}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {item.unitContains && (
          <div className="space-y-2">
            <label htmlFor="subUnitQty" className="text-sm font-medium flex items-center justify-between">
              <span>{unitName}</span>
              <Badge variant="secondary" className="font-normal text-xs">
                Max: {item.unitContains.value - 1}
              </Badge>
            </label>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-r-none border-r-0"
                onClick={decrementSubUnitQty}
                disabled={subUnitQty <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="subUnitQty"
                type="number"
                min="0"
                max={item.unitContains.value - 1}
                step="1"
                value={subUnitQty || ''}
                onChange={handleSubUnitQtyChange}
                placeholder="0"
                ref={subUnitQtyRef}
                className="h-9 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-l-none border-l-0"
                onClick={incrementSubUnitQty}
                disabled={item.unitContains && subUnitQty >= item.unitContains.value - 1}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Total calculation */}
      {isValid && unitQty + subUnitQty > 0 && (
        <div className="bg-gray-50 p-3 rounded-md border">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Calculated Total:</span>
            <span className="font-semibold text-primary">
              Rs{((unitQty * (batch.unitPrice || 0)) + 
                (subUnitQty * (item.unitContains ? (batch.unitPrice || 0) / item.unitContains.value : 0))).toFixed(2)}
            </span>
          </div>
        </div>
      )}
      
      {validationMessage && (
        <div className={`flex items-center ${isValid ? 'text-green-600' : 'text-red-500'}`}>
          {!isValid && <AlertCircle className="h-4 w-4 mr-1.5" />}
          <span className="text-sm">{validationMessage}</span>
        </div>
      )}
      
      <div className="pt-2">
        <Button
          className="w-full py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all hover:shadow-md"
          disabled={!isValid}
          onClick={() => onQuantityChange(unitQty, subUnitQty)}
        >
          <div className="flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            <span className="font-medium">Add to Cart</span>
            <span className="ml-2 bg-white/20 px-2 py-1 rounded text-xs font-bold">Enter</span>
          </div>
        </Button>
      </div>
    </div>
  );
}