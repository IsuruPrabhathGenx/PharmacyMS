// src/services/receiptPrinterService.ts
import { Sale } from '@/types/sale';
import { businessSettingsService } from './businessSettingsService';

export interface PrinterConfig {
  paperWidth: number; // width in mm
  charactersPerLine: number;
  openCashDrawer: boolean;
  paperCutAtEnd: boolean;
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  footer?: string;
  logoUrl?: string;
  receiptWidth?: number;
  charactersPerLine?: number;
  openCashDrawer?: boolean;
  paperCutAtEnd?: boolean;
}

// Constants for 57mm thermal printer
const PRINTER_80MM = {
  paperWidth: 80,
  charactersPerLine: 48, // Standard for 80mm paper with default font
  openCashDrawer: true,
  paperCutAtEnd: true
};
export const receiptPrinterService = {
  // Get printer config from business settings or use defaults for 57mm printer
  getPrinterConfig(businessInfo?: BusinessInfo): PrinterConfig {
    // If businessInfo is passed, extract printer settings from it
    if (businessInfo && businessInfo.receiptWidth && businessInfo.charactersPerLine) {
      return {
        paperWidth: businessInfo.receiptWidth,
        charactersPerLine: businessInfo.charactersPerLine,
        openCashDrawer: businessInfo.openCashDrawer !== undefined ? businessInfo.openCashDrawer : true,
        paperCutAtEnd: businessInfo.paperCutAtEnd !== undefined ? businessInfo.paperCutAtEnd : true
      };
    }
     // Otherwise try to get from business settings service
  try {
    const settings = businessSettingsService.getSettings();
    return {
      paperWidth: settings.receiptWidth || PRINTER_80MM.paperWidth,
      charactersPerLine: settings.charactersPerLine || PRINTER_80MM.charactersPerLine,
      openCashDrawer: settings.openCashDrawer !== undefined ? settings.openCashDrawer : PRINTER_80MM.openCashDrawer,
      paperCutAtEnd: settings.paperCutAtEnd !== undefined ? settings.paperCutAtEnd : PRINTER_80MM.paperCutAtEnd
    };
  } catch (error) {
    // If settings service fails, use defaults for 80mm printer
    console.warn('Could not load printer settings, using defaults for 80mm printer', error);
    return PRINTER_80MM;
  }
},
  
  /**
   * Formats a sale receipt for printing on a 57mm thermal printer
   */
  formatReceipt(sale: Sale, businessInfo: BusinessInfo): string {
    const date = new Date(sale.saleDate).toLocaleDateString();
    const time = new Date(sale.saleDate).toLocaleTimeString();
    const config = this.getPrinterConfig(businessInfo);
    
    // Helper function to center text
    const center = (text: string) => {
      const spaces = Math.max(0, Math.floor((config.charactersPerLine - text.length) / 2));
      return ' '.repeat(spaces) + text;
    };
    
    // Helper function for right-aligned prices - simplified for narrow receipts
    const alignPrice = (label: string, price: string) => {
      // Ensure label is not too long for narrow paper
      const maxLabelLength = config.charactersPerLine - price.length - 1;
      const truncatedLabel = label.length > maxLabelLength 
        ? label.substring(0, maxLabelLength - 2) + '..'
        : label;
      const spaces = Math.max(0, config.charactersPerLine - truncatedLabel.length - price.length);
      return truncatedLabel + ' '.repeat(spaces) + price;
    };
    
    // Divider line - adjusted for narrower paper
    const divider = '-'.repeat(config.charactersPerLine);
    
    // Build receipt content with minimalistic design for 57mm paper
    let receipt = [
      '\n',  // Start with a blank line for better printing
      center(businessInfo.name.toUpperCase()),
      center(businessInfo.address),
      center(`Tel: ${businessInfo.phone}`),
      divider,
      `Date: ${date}`,
      `Time: ${time}`,
      divider,
      center('RECEIPT'),
    ];
    
    // Add receipt ID if available - shortened for narrow paper
    if (sale.id) {
      receipt.push(`Rec#: ${sale.id.substring(0, 8)}`);
    }
    
    receipt.push(divider);
    
    // Add customer info if available - minimal version
    if (sale.customer) {
      receipt.push(`Customer: ${sale.customer.name}`);
      if (sale.customer.mobile) {
        receipt.push(`Tel: ${sale.customer.mobile}`);
      }
      receipt.push(divider);
    }
    
    // Add items with simplified format
    receipt.push('Items:');
    
    sale.items.forEach(item => {
      // Truncate item name if too long for narrow paper
      const maxItemNameLength = config.charactersPerLine - 6; // Leave space for price
      const itemName = item.item.name.length > maxItemNameLength 
        ? item.item.name.substring(0, maxItemNameLength - 2) + '..'
        : item.item.name;
      
      // Format quantity more compactly
      let quantityStr = '';
      if (item.unitQuantity > 0) {
        quantityStr += `${item.unitQuantity}u`;
      }
      if (item.subUnitQuantity > 0 && item.item.unitContains) {
        if (quantityStr) quantityStr += '+';
        quantityStr += `${item.subUnitQuantity}${item.item.unitContains.unit}`;
      }
      
      // Add item and price on separate lines for clarity
      receipt.push(`${itemName}`);
      
      // Very simplified batch info if available
      if (item.batch && item.batch.batchNumber) {
        receipt.push(`  B#${item.batch.batchNumber}`);
      }
      
      // Quantity and price format optimized for narrow receipt
      const priceStr = `Rs${item.totalPrice.toFixed(2)}`;
      receipt.push(alignPrice(`  ${quantityStr}`, priceStr));
    });
    
    // Add doctor fees if present - simplified version
    if (sale.doctorFees && sale.doctorFees.length > 0) {
      receipt.push(divider);
      receipt.push('Doc Services:');
      
      sale.doctorFees.forEach(fee => {
        const feeName = fee.fee.name?.substring(0, 18) || 'Doc Fee';
        const priceStr = `Rs${fee.totalPrice.toFixed(2)}`;
        receipt.push(alignPrice(feeName, priceStr));
      });
    }
    
    // Add lab tests if present - simplified version
    if (sale.laboratoryTests && sale.laboratoryTests.length > 0) {
      receipt.push(divider);
      receipt.push('Lab Tests:');
      
      sale.laboratoryTests.forEach(test => {
        const testName = test.test.name?.substring(0, 18) || 'Lab Test';
        const priceStr = `Rs${test.totalPrice.toFixed(2)}`;
        receipt.push(alignPrice(testName, priceStr));
      });
    }
    
    // Add total with clear formatting
    receipt.push(divider);
    receipt.push(alignPrice('TOTAL:', `Rs${sale.totalAmount.toFixed(2)}`));
    
    // Add payment method
    receipt.push(`Pay: ${this.formatPaymentMethod(sale.paymentMethod)}`);
    receipt.push(divider);
    
    // Add footer
    receipt.push(center('Thank you!'));
    if (businessInfo.footer) {
      receipt.push(center(businessInfo.footer));
    }
    
    // Add some blank lines at the end to ensure paper feed
    receipt.push('\n\n\n\n');
    
    // Return the formatted receipt
    return receipt.join('\n');
  },
  
  /**
   * Format payment method for display
   */
  formatPaymentMethod(method: string): string {
    switch (method) {
      case 'cash': return 'Cash';
      case 'card': return 'Card';
      case 'bank_deposit': return 'Bank';
      default: return method;
    }
  },
  
  /**
   * Get ESC/POS commands as base64 encoded image 
   * This is a workaround to send commands through the browser
   */
  getESCPOSCommandAsImage(command: string): string {
    // Create a minimal 1x1 transparent GIF with command embedded as alt text
    return `<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" 
             alt="${command}" 
             style="display:none">`;
  },
  
  /**
   * Get the command to open the cash drawer
   */
  getCashDrawerCommand(): string {
    return this.getESCPOSCommandAsImage('\\x1B\\x70\\x00\\x19\\x19');
  },
  
  /**
   * Get the command to cut the paper
   */
  getPaperCutCommand(): string {
    return this.getESCPOSCommandAsImage('\\x1D\\x56\\x41');
  },
  
  /**
   * Get the command to initialize the printer
   */
  getInitPrinterCommand(): string {
    return this.getESCPOSCommandAsImage('\\x1B\\x40');
  },
  
  /**
   * Print receipt using browser print functionality
   * Optimized for narrow 57mm thermal printers
   */
  async printReceipt(receipt: string, businessInfo?: BusinessInfo): Promise<boolean> {
    try {
      // Get printer config
      const config = this.getPrinterConfig(businessInfo);
      
      // Create a hidden iframe to host the print content
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      
      document.body.appendChild(iframe);
      
      // Wait for iframe to load
      await new Promise(resolve => {
        iframe.onload = resolve;
      });
      
      // Style the document for thermal receipt printing
      const contentWindow = iframe.contentWindow;
      if (!contentWindow) throw new Error('Failed to access iframe content window');
      
      const doc = contentWindow.document;
      if (!doc) throw new Error('Failed to access iframe document');
      
      // Commands for thermal printer
      const printerCommands = [];
      
      // Initialize printer
      printerCommands.push(this.getInitPrinterCommand());
      
      // Add cash drawer command if needed
      if (config.openCashDrawer) {
        printerCommands.push(this.getCashDrawerCommand());
      }
      
      // Add paper cut command if needed
      const paperCutCommand = config.paperCutAtEnd ? this.getPaperCutCommand() : '';
      
      // Create the receipt content with proper styling for 57mm thermal printers
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Receipt</title>
          <meta charset="utf-8">
          <style>
            @page {
              margin: 0;
              padding: 0;
              size: ${config.paperWidth}mm auto;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 9pt;
              line-height: 1.2;
              width: ${config.paperWidth - 2}mm;
              margin: 0;
              padding: 0 1mm;
              color: black;
              background: white;
            }
            pre {
              margin: 0;
              white-space: pre-wrap;
              font-family: 'Courier New', monospace;
              font-size: 9pt;
            }
            .hidden-commands {
              display: none;
              visibility: hidden;
            }
            .thermal-receipt { display: block !important; }
            /* Simplify for 57mm printing */
            @media print {
              body {
                width: ${config.paperWidth}mm;
              }
              pre {
                overflow: hidden;
              }
            }
          </style>
        </head>
        <body>
          <div class="hidden-commands">
            ${printerCommands.join('')}
          </div>
          <pre>${receipt}</pre>
          <div class="hidden-commands">
            ${paperCutCommand}
          </div>
        </body>
        </html>
      `);
      doc.close();
      
      // Print the document
      const printPromise = new Promise<boolean>((resolve) => {
        // Set up listener for before print
        const beforePrintHandler = () => {
          if (contentWindow.document) {
            contentWindow.document.title = "Receipt";
          }
        };
        
        // Set up listener for after print
        const afterPrintHandler = () => {
          contentWindow.removeEventListener('beforeprint', beforePrintHandler);
          contentWindow.removeEventListener('afterprint', afterPrintHandler);
          
          // Resolve success
          resolve(true);
          
          // Remove the iframe after a short delay
          setTimeout(() => {
            try {
              document.body.removeChild(iframe);
            } catch (e) {
              console.warn('Could not remove print iframe:', e);
            }
          }, 500);
        };
        
        // Add event listeners
        contentWindow.addEventListener('beforeprint', beforePrintHandler);
        contentWindow.addEventListener('afterprint', afterPrintHandler);
        
         // Some browsers don't trigger afterprint reliably, so add a fallback
        setTimeout(() => {
          try {
            contentWindow.removeEventListener('beforeprint', beforePrintHandler);
            contentWindow.removeEventListener('afterprint', afterPrintHandler);
            document.body.removeChild(iframe);
            resolve(true);
          } catch (e) {
            console.warn('Print operation timed out, but may have completed:', e);
            resolve(true);
          }
        }, 10000); // 10 seconds timeout for print operation 
        // Initiate the print
        contentWindow.focus();
        contentWindow.print();
      });
      
      return await printPromise;
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Error printing receipt. Please check printer connection and try again.');
      return false;
    }
  },
  
  /**
   * Print receipt directly from a Sale object
   */
  async printSaleReceipt(sale: Sale, businessInfo: BusinessInfo): Promise<boolean> {
    try {
      const receiptContent = this.formatReceipt(sale, businessInfo);
      return await this.printReceipt(receiptContent, businessInfo);
    } catch (error) {
      console.error('Error formatting or printing sale receipt:', error);
      return false;
    }
  },
  
  /**
   * Directly test the printer with a simple receipt
   * Use this to test if the printer is connected and working
   */
  async testPrinter(): Promise<boolean> {
    try {
      const testReceipt = [
        center('PRINTER TEST'),
        '-'.repeat(32),
        'Test receipt for 57mm printer',
        'If you can read this, printing',
        'is working correctly!',
        '-'.repeat(32),
        center('TEST COMPLETE'),
        '\n\n\n'
      ].join('\n');
      
      return await this.printReceipt(testReceipt, {
        name: 'TEST PRINTER',
        address: 'Printer Test',
        phone: '123-456-7890',
        receiptWidth: 57,
        charactersPerLine: 32,
        openCashDrawer: false,
        paperCutAtEnd: true
      });
    } catch (error) {
      console.error('Printer test failed:', error);
      return false;
    }
  },
  
  /**
   * Open cash drawer without printing
   */
  async openCashDrawer(): Promise<boolean> {
    try {
      // Create a minimal receipt with just the cash drawer command
      const receipt = center('Opening Cash Drawer') + '\n';
      
      return await this.printReceipt(receipt, {
        ...businessSettingsService.getBusinessInfoForReceipt(),
        openCashDrawer: true,
        paperCutAtEnd: false
      });
    } catch (error) {
      console.error('Error opening cash drawer:', error);
      return false;
    }
  },
  
  // Helper for center text (used within the service)
  center(text: string, width: number = 48): string {
    const spaces = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(spaces) + text;
  }
};

// Helper function
function center(text: string, width: number = 48): string {
  const spaces = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(spaces) + text;
}