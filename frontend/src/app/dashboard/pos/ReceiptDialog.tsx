import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, FileCheck, Download, CheckCircle2, CreditCard, Wallet, Building2 } from "lucide-react";
import { Sale } from '@/types/sale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Receipt, { BusinessInfo } from '@/components/Receipt';
import ThermalReceipt from '@/components/ThermalReceipt';
import { receiptPrinterService } from '@/services/receiptPrinterService';
import { Badge } from "@/components/ui/badge";

// Business info should come from your application settings
const BUSINESS_INFO: BusinessInfo = {
  name: 'Isira Pharmacy & Grocery',
  address: 'No. 371, M.D.H. Jayawardhena Road, Abhayapura, Athuruginya.',
  phone: '0777 846 480',
  footer: 'Get well soon!'
};

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onClose: () => void;
}

export const ReceiptDialog: React.FC<ReceiptDialogProps> = ({
  open,
  onOpenChange,
  sale,
  onClose
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [openCashDrawerSuccess, setOpenCashDrawerSuccess] = useState(false);
  
  // Reset states when dialog opens
  useEffect(() => {
    if (open) {
      setIsPrinting(false);
      setPrintSuccess(false);
      setOpenCashDrawerSuccess(false);
    }
  }, [open]);
  
  // Method to handle printing
  const handlePrint = async () => {
    if (!sale) return;
    
    setIsPrinting(true);
    try {
      const success = await receiptPrinterService.printSaleReceipt(sale, BUSINESS_INFO);
      setPrintSuccess(success);
      
      // Add a small delay to show success state
      if (success) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      setPrintSuccess(false);
    } finally {
      setIsPrinting(false);
    }
  };
  
  // Print automatically when dialog opens (optional)
  useEffect(() => {
    if (open && sale) {
      handlePrint();
    }
    
    // Clean up function
    return () => {
      // Reset states when component unmounts
      setIsPrinting(false);
      setPrintSuccess(false);
      setOpenCashDrawerSuccess(false);
    };
  }, [open, sale]);
  
  // Open cash drawer without printing (for cash sales)
  const openCashDrawer = async () => {
    if (!sale || sale.paymentMethod !== 'cash') return;
    
    try {
      await receiptPrinterService.openCashDrawer();
      setOpenCashDrawerSuccess(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setOpenCashDrawerSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error opening cash drawer:', error);
    }
  };
  
  // Custom close handler to ensure cleanup
  const handleClose = () => {
    // Reset states
    setIsPrinting(false);
    setPrintSuccess(false);
    setOpenCashDrawerSuccess(false);
    
    // Call the provided onClose
    onClose();
  };
  
  // Get payment method icon
  const getPaymentMethodIcon = () => {
    if (!sale) return <CreditCard />;
    
    switch (sale.paymentMethod) {
      case 'cash':
        return <Wallet className="h-5 w-5 text-green-500" />;
      case 'card':
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'bank_deposit':
        return <Building2 className="h-5 w-5 text-violet-500" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };
  
  // Format payment method text
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Cash Payment';
      case 'card':
        return 'Card Payment';
      case 'bank_deposit':
        return 'Bank Deposit';
      default:
        return method;
    }
  };
  
  if (!sale) return null;
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-lg">
        <DialogHeader className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white sticky top-0 z-10">
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <div className="flex items-center">
              <FileCheck className="h-6 w-6 mr-2" />
              <span>Sale Complete</span>
            </div>
            <Badge variant="success" className="bg-white/20 text-white">
              Receipt #{sale.id?.substring(0, 8)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-100 mb-6 flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">Transaction Successful</h3>
              <p className="text-green-700 text-sm mt-1">
                Your sale has been processed successfully. You can print a receipt or continue.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Payment Information</h3>
            <div className="flex items-center">
              {getPaymentMethodIcon()}
              <span className="ml-2 font-medium">{formatPaymentMethod(sale.paymentMethod)}</span>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden mb-6">
            <Receipt 
              sale={sale} 
              businessInfo={BUSINESS_INFO}
            />
          </div>
          
          {/* Hidden thermal receipt template for actual printing */}
          <div className="hidden">
            <ThermalReceipt
              sale={sale}
              businessInfo={BUSINESS_INFO}
            />
          </div>
        </div>
        
        <DialogFooter className="p-6 flex justify-between border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPrinting}
            className="gap-2"
          >
            Done
          </Button>
          
          <div className="flex space-x-3">
            {sale.paymentMethod === 'cash' && (
              <Button
                variant="outline"
                onClick={openCashDrawer}
                disabled={isPrinting || openCashDrawerSuccess}
                className={cn(
                  "relative overflow-hidden gap-2",
                  openCashDrawerSuccess && "bg-green-50 text-green-600 border-green-200"
                )}
              >
                {openCashDrawerSuccess ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-green-50"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>Drawer Opened</span>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Open Cash Drawer
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Save PDF
            </Button>
            
            <Button
              onClick={handlePrint}
              disabled={isPrinting || printSuccess}
              className={cn(
                "gap-2 relative overflow-hidden",
                printSuccess && "bg-green-600 hover:bg-green-700"
              )}
            >
              {isPrinting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Printing...
                </>
              ) : printSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Printed Successfully
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;