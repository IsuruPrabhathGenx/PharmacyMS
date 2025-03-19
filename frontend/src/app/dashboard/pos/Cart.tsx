import React, { useEffect } from 'react';
import { SaleItem } from '@/types/sale';
import { Button } from "@/components/ui/button";
import { X, Clock, Package, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Customer } from '@/types/customer';

interface CartProps {
  items: SaleItem[];
  onRemoveItem: (index: number) => void;
  selectedCustomer?: Customer;
  applyDiscount: boolean;
  onToggleDiscount: (apply: boolean) => void;
  discountAmount: number;
}

export const Cart: React.FC<CartProps> = ({ 
  items, 
  onRemoveItem, 
  selectedCustomer, 
  applyDiscount,
  onToggleDiscount,
  discountAmount
}) => {
  // Set up keyboard shortcuts for removing items
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + 1-9 to remove items 1-9
      if (e.altKey && !isNaN(parseInt(e.key)) && parseInt(e.key) > 0) {
        const index = parseInt(e.key) - 1;
        if (index < items.length) {
          e.preventDefault();
          onRemoveItem(index);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, onRemoveItem]);
  
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="bg-secondary/10 rounded-full p-6 mb-4">
          <Package className="w-10 h-10 text-secondary" />
        </div>
        <p className="text-xl font-medium mb-2">Cart is empty</p>
        <p className="text-sm text-gray-500 max-w-md">
          Search and add items to get started. Use F1 to quickly access the search.
        </p>
      </div>
    );
  }
  
  // Calculate subtotal (before discount)
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate total (after discount)
  const totalAmount = applyDiscount ? subtotal - discountAmount : subtotal;
  
  // Function to check if a batch is expiring soon
  const isExpiringSoon = (expiryDate: Date): boolean => {
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 90; // 3 months
  };
  
  return (
    <div className="flex flex-col h-full">
      <AnimatePresence>
        <div className="flex-1 overflow-y-auto px-4">
          <ul>
            {items.map((item, index) => {
              const keyboardShortcut = index < 9 ? `Alt+${index + 1}` : null;
              const expiringSoon = isExpiringSoon(item.batch.expiryDate);
              
              return (
                <motion.li 
                  key={index} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="py-3 border-b last:border-b-0"
                >
                  <div className="flex justify-between group">
                    <div className="flex-1">
                      <div className="font-medium flex items-center">
                        {item.item.name}
                        {expiringSoon && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="ml-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">This batch will expire soon</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Batch #{item.batch.batchNumber}</span>
                        <span className="mx-1 text-gray-400">•</span>
                        <span>Exp: {item.batch.expiryDate.toLocaleDateString()}</span>
                      </div>
                      
                      <div className="text-sm mt-1 flex flex-wrap items-center gap-2">
                        {item.unitQuantity > 0 && (
                          <Badge variant="outline" className="font-normal">
                            {item.unitQuantity} units
                          </Badge>
                        )}
                        {item.unitQuantity > 0 && item.subUnitQuantity > 0 && (
                          <span className="text-gray-400">+</span>
                        )}
                        {item.subUnitQuantity > 0 && item.item.unitContains && (
                          <Badge variant="outline" className="font-normal">
                            {item.subUnitQuantity} {item.item.unitContains.unit}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-medium text-lg text-primary">
                        Rs{item.totalPrice.toFixed(2)}
                      </div>
                      <div className="mt-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                                onClick={() => onRemoveItem(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>{keyboardShortcut ? `Remove (${keyboardShortcut})` : "Remove"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </AnimatePresence>
      
      <div className="border-t pt-4 mt-auto p-4 bg-white">
        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-gray-600">
            <span className="text-sm">Subtotal:</span>
            <span className="font-medium">Rs{subtotal.toFixed(2)}</span>
          </div>
          
          {selectedCustomer?.discountPercentage && selectedCustomer.discountPercentage > 0 && (
            <div className="flex justify-between items-center text-gray-600">
              <div className="flex items-center text-sm">
                <input
                  type="checkbox"
                  id="applyDiscount"
                  checked={applyDiscount}
                  onChange={(e) => onToggleDiscount(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-2"
                />
                <label htmlFor="applyDiscount">
                  Apply {selectedCustomer.discountPercentage}% Discount
                </label>
              </div>
              {applyDiscount && (
                <span className="text-green-600">-Rs{discountAmount.toFixed(2)}</span>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-baseline text-gray-600">
            <span className="text-sm">Items:</span>
            <span>{items.length}</span>
          </div>
          
          <div className="h-px bg-gray-200 my-2"></div>
          
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">Rs{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};