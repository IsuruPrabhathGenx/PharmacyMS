// src/app/dashboard/pos/page.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { purchaseService } from '@/services/purchaseService';
import { saleService } from '@/services/saleService';
import { InventoryItem } from '@/types/inventory';
import { BatchWithDetails } from '@/types/purchase';
import { Sale, SaleItem } from '@/types/sale';
import DashboardLayout from '@/components/DashboardLayout';
import { BatchSelector } from './BatchSelector';
import { QuantityInput } from './QuantityInput';
import { Cart } from './Cart';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Loader2, 
  User, 
  Printer, 
  X, 
  Store, 
  CreditCard, 
  ArrowDown, 
  ArrowUp, 
  Keyboard
} from 'lucide-react';
import { Customer } from '@/types/customer';
import { CustomerSelector } from './CustomerSelector';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast} from "@/hooks/use-toast";
import { Toaster } from "sonner";
import { useToast } from "@/hooks/use-toast";

import PaymentMethod from './PaymentMethod';
import ReceiptDialog from './ReceiptDialog';
import { receiptPrinterService } from '@/services/receiptPrinterService';

export default function POSPage() {
  const { toast } = useToast();
  
  // State management
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemBatches, setItemBatches] = useState<BatchWithDetails[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchWithDetails | null>(null);
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [confirmDialogFocused, setConfirmDialogFocused] = useState<boolean>(false);
  
  // Customer selection is now optional
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();

  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
  
  // New state for receipt handling
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  
  // Batch loading cache
  const batchLoadingCache = useRef<{ [key: string]: Promise<BatchWithDetails[]> }>({});

  // Search input references
  const searchInputRef = useRef<HTMLInputElement>(null);
  const unitQtyInputRef = useRef<HTMLInputElement>(null);
  const subUnitQtyInputRef = useRef<HTMLInputElement>(null);

  // Add autocomplete state for search results
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [focusedResultIndex, setFocusedResultIndex] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [applyDiscount, setApplyDiscount] = useState<boolean>(true);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const inventoryData = await inventoryService.getAll();
        setInventory(inventoryData);
        
        // Prefetch batch data
        if (inventoryData.length > 0) {
          prefetchBatchData(inventoryData);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Auto-focus on search field when page loads
  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [loading]);
  
  // Set up global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when dialogs are open or when processing
      if (showConfirmDialog || showCustomerDialog || showReceiptDialog || processing) {
        return;
      }
      
      // F1 - Focus on search
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
        
        // Show toast notification to indicate keyboard shortcut used
        toast({
          title: "Search Activated",
          description: "Start typing to search for products",
          duration: 1500,
        });
      }
      
      // F2 - Finalize sale
      if (e.key === 'F2' && cartItems.length > 0 && !processing) {
        e.preventDefault();
        setShowConfirmDialog(true);
        setConfirmDialogFocused(true); // Set focus to dialog
        
        // Show toast notification
        toast({
          title: "Finalizing Sale",
          description: "Review and confirm your transaction",
          duration: 1500,
        });
      }
      
      // F5 - Open customer search dialog
      if (e.key === 'F5') {
        e.preventDefault();
        setShowCustomerDialog(true);
        
        // Show toast notification
        toast({
          title: "Customer Search",
          description: "Select or add a customer",
          duration: 1500,
        });
      }
      
      // Escape - Clear search or selection
      if (e.key === 'Escape') {
        if (selectedItem) {
          // Clear selected item first
          setSelectedItem(null);
          setSelectedBatch(null);
          setItemBatches([]);
          searchInputRef.current?.focus();
        } else {
          // Clear search
          setSearchTerm('');
          setSearchResults([]);
          setFocusedResultIndex(-1);
        }
      }
      
      // Arrow keys for navigating search results
      if (searchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedResultIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
        }
        
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedResultIndex(prev => prev > 0 ? prev - 1 : 0);
        }
        
        // Enter to select focused result
        if (e.key === 'Enter' && focusedResultIndex >= 0) {
          e.preventDefault();
          handleItemSelect(searchResults[focusedResultIndex]);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showConfirmDialog, 
    showCustomerDialog, 
    showReceiptDialog,
    searchResults, 
    focusedResultIndex, 
    selectedItem, 
    selectedBatch, 
    cartItems, 
    processing,
    confirmDialogFocused,
  ]);
  
  // Listen for search term changes to filter results
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 10)); // Limit to 10 results
      setFocusedResultIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setSearchResults([]);
      setFocusedResultIndex(-1);
    }
  }, [searchTerm, inventory]);

  // Prefetch batch data for all inventory items
  const prefetchBatchData = async (items: InventoryItem[]) => {
    for (const item of items) {
      if (item.id && !batchLoadingCache.current[item.id]) {
        batchLoadingCache.current[item.id] = purchaseService.getBatchesByItem(item.id);
      }
    }
  };

  useEffect(() => {
    if (selectedCustomer?.discountPercentage && applyDiscount) {
      const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const discount = subtotal * (selectedCustomer.discountPercentage / 100);
      setDiscountAmount(discount);
    } else {
      setDiscountAmount(0);
    }
  }, [selectedCustomer, cartItems, applyDiscount]);

  useEffect(() => {
    if (selectedCustomer?.discountPercentage) {
      setApplyDiscount(true); // Enable discount by default when a customer with discount is selected
    } else {
      setApplyDiscount(false); // Disable when no customer or no discount
      setDiscountAmount(0);
    }
  }, [selectedCustomer]);

  // Handle payment method changes
  const handlePaymentMethodChange = (method: string, bankAccountId?: string) => {
    setPaymentMethod(method);
    setSelectedBankAccount(bankAccountId || '');
  };

  const handleItemSelect = async (item: InventoryItem) => {
    setSelectedItem(item);
    setSelectedBatch(null);
    setIsLoadingBatches(true);
    setSearchTerm(''); // Clear search term
    setSearchResults([]); // Clear search results

    try {
      if (!batchLoadingCache.current[item.id!]) {
        batchLoadingCache.current[item.id!] = purchaseService.getBatchesByItem(item.id!);
      }

      const batches = await batchLoadingCache.current[item.id!];
      const today = new Date();
      
      // Filter out expired and sold out batches
      const validBatches = batches.filter(batch => 
        batch.quantity > 0 && batch.expiryDate > today
      );

      setItemBatches(validBatches);
      
      if (validBatches.length > 0) {
        // Sort by expiry date and select the oldest non-expired batch
        const sortedBatches = validBatches.sort((a, b) => 
          a.expiryDate.getTime() - b.expiryDate.getTime()
        );
        const oldestBatch = sortedBatches[0];
        
        // Check if the batch is expiring soon
        const monthsUntilExpiry = Math.floor(
          (oldestBatch.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        
        if (monthsUntilExpiry <= 3) {
          // Use toast for expiry warning instead of alert
          toast({
            title: "Batch Expiring Soon",
            description: `Batch #${oldestBatch.batchNumber} will expire in ${monthsUntilExpiry} months. Would you like to select this batch?`,
            variant: "warning",
            action: (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedBatch(oldestBatch);
                    // Focus on quantity input after batch selection
                    setTimeout(() => {
                      if (unitQtyInputRef.current) {
                        unitQtyInputRef.current.focus();
                      }
                    }, 100);
                  }}
                >
                  Yes
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    // Do nothing, let them select a different batch
                  }}
                >
                  No
                </Button>
              </div>
            ),
          });
        } else {
          setSelectedBatch(oldestBatch);
          // Focus on quantity input after batch selection
          setTimeout(() => {
            if (unitQtyInputRef.current) {
              unitQtyInputRef.current.focus();
            }
          }, 100);
        }
      } else {
        // No valid batches found
        toast({
          title: "No Valid Batches",
          description: "No valid batches available for this item.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      toast({
        title: "Error",
        description: "Could not load batch information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBatches(false);
    }
  };

  // Handle quantity changes and add to cart for inventory items
  const handleQuantityChange = (unitQty: number, subUnitQty: number) => {
    if (!selectedItem || !selectedBatch) return;

    const unitPrice = selectedBatch.unitPrice || 0;
    const costPrice = selectedBatch.costPrice || 0;
    
    let totalPrice = 0;
    let totalCost = 0;
    
    if (selectedItem.unitContains) {
      const subUnitPrice = unitPrice / selectedItem.unitContains.value;
      const subUnitCost = costPrice / selectedItem.unitContains.value;
      
      totalPrice = (unitPrice * unitQty) + (subUnitPrice * subUnitQty);
      totalCost = (costPrice * unitQty) + (subUnitCost * subUnitQty);
    } else {
      totalPrice = unitPrice * unitQty;
      totalCost = costPrice * unitQty;
    }

    const newItem: SaleItem = {
      itemId: selectedItem.id!,
      item: selectedItem,
      batchId: selectedBatch.id!,
      batch: selectedBatch,
      unitQuantity: unitQty,
      subUnitQuantity: subUnitQty,
      unitPrice,
      subUnitPrice: selectedItem.unitContains ? unitPrice / selectedItem.unitContains.value : 0,
      totalPrice,
      totalCost
    };

    setCartItems(prev => [...prev, newItem]);
    setSelectedItem(null);
    setSelectedBatch(null);
    setItemBatches([]);
    
    // Show success toast notification
    toast({
      title: "Item Added",
      description: `${selectedItem.name} added to cart`,
      variant: "success",
    });
    
    // Focus back on search input after adding to cart
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const removeCartItem = (index: number) => {
    const removedItem = cartItems[index];
    setCartItems(prev => prev.filter((_, i) => i !== index));
    
    // Show removal toast notification
    toast({
      title: "Item Removed",
      description: `${removedItem.item.name} removed from cart`,
      variant: "default",
    });
    
    // Focus back on search input after removing item
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  
  const handleFinalizeSale = async () => {
    if (cartItems.length === 0) return;
    
    // Bank deposit still requires an account
    if (paymentMethod === 'bank_deposit' && !selectedBankAccount) {
      toast({
        title: "Bank Account Required",
        description: "Please select a bank account for deposit",
        variant: "destructive",
      });
      return;
    }
    
    // Validate cart items before proceeding
    for (const item of cartItems) {
      if (!item.itemId || !item.batchId) {
        toast({
          title: "Invalid Item Data",
          description: "One or more items in your cart has missing information. Please remove and re-add the items.",
          variant: "destructive",
        });
        console.error("Invalid cart item:", item);
        return;
      }
    }
    
    setProcessing(true);
    try {
      // Calculate discount if applicable
      let discountAmount = 0;
      let discountPercentage = 0;
      
      if (selectedCustomer?.discountPercentage && applyDiscount) {
        discountPercentage = selectedCustomer.discountPercentage;
        discountAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0) * (discountPercentage / 100);
      }
  
      // Log the cart items for debugging
      console.log("Cart items before API mapping:", JSON.stringify(cartItems.map(item => ({
        itemId: item.itemId,
        batchId: item.batchId
      })), null, 2));
      
      // Create base sale data with careful validation
      const saleData = {
        items: cartItems.map(item => {
          // Make sure we always have valid IDs
          const inventoryItem = item.itemId || (item.item && (item.item._id || item.item.id));
          const batch = item.batchId || (item.batch && (item.batch._id || item.batch.id));
          
          if (!inventoryItem || !batch) {
            console.error("Missing required IDs:", { item, inventoryItem, batch });
          }
          
          return {
            inventoryItem, // Backend expects 'inventoryItem', not 'itemId'
            batch,         // Backend expects 'batch', not 'batchId'
            unitQuantity: item.unitQuantity,
            subUnitQuantity: item.subUnitQuantity || 0,
            unitPrice: item.unitPrice,
            subUnitPrice: item.subUnitPrice || 0,
            totalPrice: item.totalPrice,
            totalCost: item.totalCost
          };
        }),
        totalAmount: applyDiscount ? 
          cartItems.reduce((sum, item) => sum + item.totalPrice, 0) - discountAmount : 
          cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
        totalCost: cartItems.reduce((sum, item) => sum + item.totalCost, 0),
        saleDate: new Date(),
        paymentMethod,
        appliedDiscount: applyDiscount,
        discountAmount,
        discountPercentage
      };
  
      // Log the data being sent to API for debugging
      console.log("Sale data being sent to API:", JSON.stringify({
        items: saleData.items.map(item => ({
          inventoryItem: item.inventoryItem,
          batch: item.batch
        }))
      }, null, 2));
  
      // Only add customer info if a customer is selected
      if (selectedCustomer && selectedCustomer.id) {
        saleData.customerId = selectedCustomer.id;
      }
  
      // Only add bankAccountId if payment method is bank_deposit
      if (paymentMethod === 'bank_deposit' && selectedBankAccount) {
        saleData.bankAccountId = selectedBankAccount;
      }
  
      // Call the API to create the sale
      const result = await saleService.create(saleData);
      
      // Create a copy of the sale data with everything needed for the receipt
      const completedSaleData = {
        ...saleData,
        id: result._id || result.id || 'temp-' + Date.now(),
        customer: selectedCustomer,
        items: cartItems,
        paymentMethod: paymentMethod,
        createdAt: new Date(),
        updatedAt: new Date(),
        appliedDiscount: applyDiscount
      };
      
      // Store the completed sale for receipt printing
      setCompletedSale(completedSaleData);
      
      // Close the confirmation dialog
      setShowConfirmDialog(false);
      
      // Reset the confirmation dialog focus state
      setConfirmDialogFocused(false);
      
      // Show success notification
      toast({
        title: "Sale Complete",
        description: "Transaction processed successfully",
        variant: "success",
      });
      
      // // Print receipt directly instead of showing dialog
      // try {
      //   await receiptPrinterService.printSaleReceipt(completedSaleData, {
      //     name: 'Isira Pharmacy & Grocery',
      //     address: 'No. 371, M.D.H. Jayawardhena Road, Abhayapura, Athuruginya.',
      //     phone: '0777 846 480',
      //     footer: 'Get well soon!'
      //   });
        
      //   // Open cash drawer if it's a cash payment
      //   if (paymentMethod === 'cash') {
      //     await receiptPrinterService.openCashDrawer();
      //   }
      // } catch (error) {
      //   console.error('Error printing receipt:', error);
      //   toast({
      //     title: "Printing Error",
      //     description: "Could not print receipt. Please try again manually.",
      //     variant: "destructive",
      //   });
      // }

      

      // Clear cart and reset all state variables
      setCartItems([]);
      setSelectedItem(null);
      setSelectedBatch(null);
      setItemBatches([]);
      setSelectedCustomer(undefined);
      setPaymentMethod('cash');
      setSelectedBankAccount('');
      setApplyDiscount(false);
      setDiscountAmount(0);
      setSearchResults([]);
      setFocusedResultIndex(-1);
      setSearchTerm('');
      setIsLoadingBatches(false);
      
      // Reset the batch loading cache reference
      batchLoadingCache.current = {};
      
      // Clear batch cache after successful sale
      purchaseService.clearBatchCache();
    } catch (error) {
      console.error('Error processing sale:', error);
      toast({
        title: "Error",
        description: error.message || "Error processing sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      // Make sure confirmDialogFocused is reset even if there's an error
      setConfirmDialogFocused(false);
    }
  };


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading POS System...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster />
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header with improved styling */}
        <div className="p-4 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Store className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
                Point of Sale
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Keyboard shortcuts card with badge */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="py-2 cursor-help">
                      <Keyboard className="w-4 h-4 mr-1" />
                      <span className="font-medium">Shortcuts</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="p-4 w-64">
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Keyboard Shortcuts:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="flex items-center"><Badge variant="secondary" className="mr-1">F1</Badge> Search</div>
                        <div className="flex items-center"><Badge variant="secondary" className="mr-1">F2</Badge> Finalize Sale</div>
                        <div className="flex items-center"><Badge variant="secondary" className="mr-1">F5</Badge> Customer</div>
                        <div className="flex items-center"><Badge variant="secondary" className="mr-1">Esc</Badge> Clear</div>
                        <div className="flex items-center"><Badge variant="secondary" className="mr-1">↑↓</Badge> Navigate</div>
                        <div className="flex items-center"><Badge variant="secondary" className="mr-1">Enter</Badge> Select</div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Customer Button with improved styling */}
              <Button
                variant={selectedCustomer ? "default" : "outline"}
                onClick={() => setShowCustomerDialog(true)}
                className="group transition-all duration-300"
              >
                <User className={`mr-2 h-4 w-4 ${selectedCustomer ? 'text-primary-foreground' : 'text-primary'}`} />
                {selectedCustomer ? (
                  <span className="max-w-[150px] truncate">{selectedCustomer.name}</span>
                ) : (
                  <span>Add Customer (F5)</span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Items */}
          <div className="w-2/3 flex flex-col">
            {/* Enhanced Search Bar */}
            <div className="p-4 bg-white">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search items by name or code... (F1)"
                  className="pl-10 py-6 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-8 w-8"
                    onClick={() => {
                      setSearchTerm('');
                      searchInputRef.current?.focus();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Animated Search Results Dropdown */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[400px] overflow-y-auto"
                    >
                      {searchResults.map((item, index) => (
                        <motion.div
                          key={item.id}
                          className={`p-3 cursor-pointer border-l-4 transition-all ${
                            index === focusedResultIndex 
                              ? 'bg-primary/10 border-l-primary' 
                              : 'hover:bg-gray-50 border-l-transparent'
                          }`}
                          onClick={() => handleItemSelect(item)}
                          onMouseEnter={() => setFocusedResultIndex(index)}
                          whileHover={{ x: 4 }}
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500 flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline" className="font-normal">
                              Code: {item.code}
                            </Badge>
                            <Badge variant="secondary" className="font-normal">
                              Type: {item.type}
                            </Badge>
                            {item.hasUnitContains && item.unitContains && (
                              <Badge variant="outline" className="font-normal text-primary">
                                {item.unitContains.value} {item.unitContains.unit} per unit
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* No Results Found Message */}
                <AnimatePresence>
                  {searchTerm && searchResults.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-6 text-center"
                    >
                      <div className="text-gray-400 flex flex-col items-center">
                        <Search className="h-10 w-10 mb-2 opacity-50" />
                        <p className="text-lg font-medium">No items found</p>
                        <p className="text-sm">
                          Try a different search term or check the inventory
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              <AnimatePresence mode="wait">
                {isLoadingBatches ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center items-center h-full"
                  >
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-gray-600">Loading batch information...</p>
                    </div>
                  </motion.div>
                ) : selectedItem ? (
                  <motion.div
                    key="selectedItem"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <Card className="shadow-md border-t-4 border-t-primary">
                      <CardHeader className="bg-gray-50 rounded-t-lg">
                        <CardTitle className="text-xl flex items-center justify-between">
                          <span>{selectedItem.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {selectedItem.type}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 p-6">
                        <BatchSelector
                          batches={itemBatches}
                          onSelectBatch={setSelectedBatch}
                        />
                        {selectedBatch && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                          >
                            <QuantityInput
                              item={selectedItem}
                              batch={selectedBatch}
                              onQuantityChange={handleQuantityChange}
                              unitQtyInputRef={unitQtyInputRef}
                              subUnitQtyInputRef={subUnitQtyInputRef}
                              onEnterKeyPress={handleQuantityChange}
                            />
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center py-10"
                  >
                    <div className="bg-primary/10 rounded-full p-6 mb-4">
                      <Search className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Search for items</h3>
                    <p className="text-gray-500 max-w-md">
                      Use the search bar above to find products by name or code. 
                      You can also use the F1 key for quick access.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel - Cart */}
          <div className="w-1/3 flex flex-col p-4 bg-gray-100">


          {selectedCustomer && selectedCustomer.discountPercentage > 0 && (
            <div className="p-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="applyDiscount"
                    checked={applyDiscount}
                    onChange={(e) => setApplyDiscount(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="applyDiscount" className="ml-2 text-sm font-medium text-gray-700">
                    Apply Customer Discount ({selectedCustomer.discountPercentage}%)
                  </label>
                </div>
                {applyDiscount && (
                  <span className="text-green-600 font-medium text-sm">
                    -Rs{discountAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}
            


            <Card className="flex-1 shadow-md border-t-4 border-t-secondary rounded-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gray-50 rounded-t-md">
                <CardTitle className="text-xl flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-secondary" />
                  Cart
                  {cartItems.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {cartItems.length}
                    </Badge>
                  )}
                </CardTitle>
                
                <Button
                  size="lg"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={cartItems.length === 0 || processing}
                  className="text-base py-5 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:shadow-lg transition-all duration-300"
                >
                  {cartItems.length > 0 ? (
                    <div className="flex items-center">
                      <span>Finalize Sale (F2)</span>
                      <ArrowDown className="ml-2 h-4 w-4" />
                    </div>
                  ) : (
                    <span>Cart Empty</span>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)] overflow-y-auto p-0">
              <Cart
                items={cartItems}
                onRemoveItem={removeCartItem}
                selectedCustomer={selectedCustomer}
                applyDiscount={applyDiscount}
                onToggleDiscount={setApplyDiscount}
                discountAmount={discountAmount}
              />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sale Confirmation Dialog */}
        <Dialog 
          open={showConfirmDialog} 
          onOpenChange={(open) => {
            setShowConfirmDialog(open);
            // Make sure to reset the focus state when the dialog is closed
            if (!open) {
              setConfirmDialogFocused(false);
              
              // Focus back on search input when dialog closes
              setTimeout(() => {
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }, 100);
            }
          }}
        >
          <DialogContent className="sm:max-w-[600px] rounded-lg p-0 overflow-hidden">
            <DialogHeader className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
              <DialogTitle className="text-2xl font-bold">Confirm Sale</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-6">
              <div className="text-lg space-y-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Sale Summary</p>
                  <p className="text-xl font-semibold text-primary">
                    Rs{cartItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Items:</span>
                    <span>{cartItems.length}</span>
                  </div>
                  
                  {selectedCustomer && (
                    <div className="flex justify-between text-sm text-gray-600 items-center">
                      <span>Customer:</span>
                      <Badge variant="outline" className="font-normal">
                        {selectedCustomer.name}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <PaymentMethod
                  totalAmount={cartItems.reduce((sum, item) => sum + item.totalPrice, 0)}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onPressEnter={() => {
                    // Only proceed if all conditions are met
                    if (!processing && 
                        (paymentMethod !== 'bank_deposit' || 
                        (paymentMethod === 'bank_deposit' && selectedBankAccount))) {
                      handleFinalizeSale();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter className="p-6 border-t bg-gray-50">
              <div className="flex space-x-3 w-full">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={processing}
                  className="flex-1 py-6"
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={handleFinalizeSale}
                  disabled={processing || (paymentMethod === 'bank_deposit' && !selectedBankAccount)}
                  className="flex-1 py-6 bg-gradient-to-r from-primary to-primary/80"
                >
                  {processing ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      <span>Complete Payment</span>
                    </div>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Customer Selection Dialog */}
        <Dialog 
          open={showCustomerDialog} 
          onOpenChange={(open) => {
            setShowCustomerDialog(open);
            // Focus back on search input when dialog closes
            if (!open) {
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 100);
            }
          }}
        >
          <DialogContent className="max-w-2xl p-0 rounded-lg overflow-hidden">
            <DialogHeader className="bg-gradient-to-r from-secondary to-secondary/80 p-6 text-white">
              <DialogTitle className="text-xl font-bold">Select Customer (F5)</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <CustomerSelector
                selectedCustomer={selectedCustomer}
                onSelectCustomer={(customer) => {
                  setSelectedCustomer(customer);
                  setShowCustomerDialog(false);
                  
                  if (customer) {
                    toast({
                      title: "Customer Selected",
                      description: `${customer.name} added to sale`,
                      variant: "success",
                    });
                  }
                  
                  // Focus back on search input after selection
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 100);
                }}
                autoFocusSearch={true}
              />
            </div>
            <div className="bg-gray-50 p-4 border-t">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Keyboard shortcuts:</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center"><Badge variant="secondary" className="mr-1">↑↓</Badge> Navigate</div>
                  <div className="flex items-center"><Badge variant="secondary" className="mr-1">Enter</Badge> Select</div>
                  <div className="flex items-center"><Badge variant="secondary" className="mr-1">Esc</Badge> Cancel</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Receipt Dialog */}
        {/* <ReceiptDialog
          open={showReceiptDialog}
          onOpenChange={setShowReceiptDialog}
          sale={completedSale}
          onClose={() => {
            setShowReceiptDialog(false);
            // Focus back on search input after closing receipt
            setTimeout(() => {
              if (searchInputRef.current) {
                searchInputRef.current.focus();
              }
            }, 100);
          }}
        /> */}
      </div>
    </DashboardLayout>
  );
}