// // src/services/saleService.ts
// import { db } from '@/lib/firebase';
// import { 
//   collection, 
//   addDoc, 
//   doc, 
//   getDocs, 
//   Timestamp,
//   runTransaction,
//   updateDoc,
//   getDoc
// } from 'firebase/firestore';
// import { Sale, SaleItem } from '@/types/sale';
// import { DoctorFeeSaleItem } from '@/types/doctorFee';
// import { purchaseService } from './purchaseService';
// import { Customer } from '@/types/customer';

// export const saleService = {

// async create(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'> & {
//   paymentMethod: string;
//   bankAccountId?: string;
// }) {
//   const now = Timestamp.now();
  
//   try {
//     await runTransaction(db, async (transaction) => {
//       // First, read all batch documents and verify quantities
//       const batchReads = await Promise.all(sale.items.map(async (item) => {
//         const batchRef = doc(db, 'batches', item.batchId);
//         const batchDoc = await transaction.get(batchRef);
        
//         if (!batchDoc.exists()) {
//           throw new Error(`Batch ${item.batchId} not found`);
//         }

//         return {
//           ref: batchRef,
//           data: batchDoc.data(),
//           item
//         };
//       }));

//       // Verify quantities and calculate new values
//       const updates = batchReads.map(({ data, item }) => {
//         let newQuantity = data.quantity;

//         if (item.item.unitContains) {
//           const totalUnitsSold = (item.unitQuantity * item.item.unitContains.value) + item.subUnitQuantity;
//           newQuantity -= totalUnitsSold;
//         } else {
//           newQuantity -= item.unitQuantity;
//         }

//         if (newQuantity < 0) {
//           throw new Error(`Insufficient quantity in batch ${item.batch.batchNumber}`);
//         }

//         return {
//           ref: doc(db, 'batches', item.batchId),
//           newQuantity
//         };
//       });

//       // Update bank account balance if payment method is bank deposit
//       if (sale.paymentMethod === 'bank_deposit' && sale.bankAccountId) {
//         const bankAccountRef = doc(db, 'bankAccounts', sale.bankAccountId);
//         const bankAccountDoc = await transaction.get(bankAccountRef);
        
//         if (!bankAccountDoc.exists()) {
//           throw new Error('Bank account not found');
//         }

//         const currentBalance = bankAccountDoc.data().balance || 0;
//         const newBalance = currentBalance + sale.totalAmount;

//         transaction.update(bankAccountRef, {
//           balance: newBalance,
//           updatedAt: now
//         });
//       }

//       // Create the sale document
//       const saleRef = doc(collection(db, 'sales'));
      
//       // Build the base sale data, omitting undefined values
//       const saleData: any = {
//         items: sale.items.map(item => ({
//           itemId: item.itemId,
//           batchId: item.batchId,
//           unitQuantity: item.unitQuantity,
//           subUnitQuantity: item.subUnitQuantity,
//           unitPrice: item.unitPrice,
//           subUnitPrice: item.subUnitPrice,
//           totalPrice: item.totalPrice,
//           totalCost: item.totalCost
//         })),
//         doctorFees: sale.doctorFees?.map(fee => ({
//           type: 'doctorFee',
//           feeId: fee.feeId,
//           amount: fee.amount,
//           totalPrice: fee.totalPrice
//         })) || null,
//         laboratoryTests: sale.laboratoryTests?.map(test => ({
//           type: 'laboratoryTest',
//           testId: test.testId,
//           price: test.price,
//           totalPrice: test.totalPrice
//         })) || null,
//         totalAmount: sale.totalAmount,
//         totalCost: sale.totalCost,
//         saleDate: Timestamp.fromDate(sale.saleDate),
//         paymentMethod: sale.paymentMethod,
//         createdAt: now,
//         updatedAt: now
//       };

//       // Only add customer-related fields if customer exists
//       if (sale.customer && sale.customerId) {
//         saleData.customerId = sale.customerId;
//         saleData.customerInfo = {
//           id: sale.customer.id,
//           name: sale.customer.name,
//           mobile: sale.customer.mobile || null,
//           address: sale.customer.address || null
//         };
//       } else {
//         // Explicitly set to null to avoid undefined values
//         saleData.customerId = null;
//         saleData.customerInfo = null;
//       }

//       // Only add bankAccountId if it's a bank deposit payment
//       if (sale.paymentMethod === 'bank_deposit' && sale.bankAccountId) {
//         saleData.bankAccountId = sale.bankAccountId;
//       }

//       // Perform all writes
//       transaction.set(saleRef, saleData);

//       // Update all batch quantities
//       updates.forEach(({ ref, newQuantity }) => {
//         transaction.update(ref, {
//           quantity: newQuantity,
//           updatedAt: now
//         });
//       });

//       return saleRef;
//     });

//     // Clear the batch cache after successful sale
//     purchaseService.clearBatchCache();
    
//     return true;
//   } catch (error) {
//     console.error('Error creating sale:', error);
//     throw error;
//   }
// },



// async getAll() {
//     const snapshot = await getDocs(collection(db, 'sales'));
    
//     // Get all sales documents
//     const salesPromises = snapshot.docs.map(async (saleDoc) => {
//       const data = saleDoc.data();
      
//       // Fetch full item details for each sale item
//       const itemsPromises = data.items.map(async (item: any) => {
//         // Get item details
//         const itemDoc = await getDoc(doc(db, 'inventory', item.itemId));
//         const itemData = itemDoc.data();
        
//         // Get batch details
//         const batchDoc = await getDoc(doc(db, 'batches', item.batchId));
//         const batchData = batchDoc.data();
        
//         return {
//           ...item,
//           item: {
//             id: itemDoc.id,
//             ...itemData
//           },
//           batch: {
//             id: batchDoc.id,
//             ...batchData
//           }
//         };
//       });
      
//       // Wait for all item details to be fetched
//       const populatedItems = await Promise.all(itemsPromises);

//       // Fetch doctor fee details if they exist
//       const doctorFeesPromises = data.doctorFees?.map(async (fee: any) => {
//         const feeDoc = await getDoc(doc(db, 'doctorFees', fee.feeId));
//         const feeData = feeDoc.data();
        
//         return {
//           ...fee,
//           fee: {
//             id: feeDoc.id,
//             ...feeData
//           }
//         };
//       }) || [];

//       // Fetch laboratory test details if they exist
//       const laboratoryTestsPromises = data.laboratoryTests?.map(async (test: any) => {
//         const testDoc = await getDoc(doc(db, 'laboratoryTests', test.testId));
//         const testData = testDoc.data();
        
//         return {
//           ...test,
//           test: {
//             id: testDoc.id,
//             ...testData
//           }
//         };
//       }) || [];

//       // Wait for all details to be fetched
//       const [populatedDoctorFees, populatedLaboratoryTests] = await Promise.all([
//         Promise.all(doctorFeesPromises),
//         Promise.all(laboratoryTestsPromises)
//       ]);
      
//       return {
//         id: saleDoc.id,
//         ...data,
//         items: populatedItems,
//         doctorFees: populatedDoctorFees,
//         laboratoryTests: populatedLaboratoryTests,
//         saleDate: data.saleDate.toDate(),
//         createdAt: data.createdAt.toDate(),
//         updatedAt: data.updatedAt.toDate(),
//         customer: data.customerInfo ? {
//           id: data.customerInfo.id,
//           name: data.customerInfo.name,
//           mobile: data.customerInfo.mobile,
//           address: data.customerInfo.address
//         } : undefined
//       } as Sale;
//     });
    
//     // Wait for all sales to be processed
//     return Promise.all(salesPromises);
//   },

//   async updateSaleCustomer(saleId: string, customer: Customer) {
//     const saleRef = doc(db, 'sales', saleId);
    
//     try {
//       await updateDoc(saleRef, {
//         customerId: customer.id,
//         customerInfo: {
//           id: customer.id,
//           name: customer.name,
//           mobile: customer.mobile,
//           address: customer.address
//         },
//         updatedAt: Timestamp.now()
//       });
      
//       return true;
//     } catch (error) {
//       console.error('Error updating sale customer:', error);
//       throw error;
//     }
//   },


// // Helper method to format sale data
// formatSaleData(sale: any) {
//     return {
//       ...sale,
//       saleDate: sale.saleDate.toDate(),
//       createdAt: sale.createdAt.toDate(),
//       updatedAt: sale.updatedAt.toDate(),
//       customer: sale.customerInfo ? {
//         id: sale.customerInfo.id,
//         name: sale.customerInfo.name,
//         mobile: sale.customerInfo.mobile,
//         address: sale.customerInfo.address
//       } : undefined
//     };
//   }
// };




// src/services/saleService.ts
import { Sale, SaleItem } from '@/types/sale';
import { Customer } from '@/types/customer';
import { purchaseService } from './purchaseService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const saleService = {
  async create(sale: any) {
    try {
      // Validate required data before sending to API
      if (!sale.items || !Array.isArray(sale.items) || sale.items.length === 0) {
        throw new Error('Sale must contain at least one item');
      }
      
      // Check each item for required fields
      const invalidItems = sale.items.filter(
        item => !item.inventoryItem || !item.batch || item.unitQuantity === undefined
      );
      
      if (invalidItems.length > 0) {
        console.error('Invalid items found:', invalidItems);
        throw new Error('One or more items has missing required fields');
      }
  
      // Log data for debugging
      console.log('Sale data being sent to API:', JSON.stringify({
        itemCount: sale.items.length,
        totalAmount: sale.totalAmount,
        sampleItems: sale.items.slice(0, 2).map(item => ({
          inventoryItem: item.inventoryItem,
          batch: item.batch
        }))
      }, null, 2));
  
      const response = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sale),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || 'Failed to create sale');
      }
      
      // Clear the batch cache after successful sale
      purchaseService.clearBatchCache();
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  },

  async getAll() {
    try {
      const response = await fetch(`${API_URL}/sales`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }
      
      const data = await response.json();
      
      // Transform dates and nested relations for compatibility with previous Firebase implementation
      return data.map((sale: any) => ({
        ...sale,
        id: sale._id,
        saleDate: new Date(sale.saleDate),
        createdAt: new Date(sale.createdAt),
        updatedAt: new Date(sale.updatedAt),
        // Map nested relations if populated
        items: sale.items.map((item: any) => ({
          ...item,
          id: item._id,
          itemId: item.inventoryItem?._id || item.inventoryItem,
          batchId: item.batch?._id || item.batch,
          // Map inventory item if it's populated
          item: item.inventoryItem ? {
            ...item.inventoryItem,
            id: item.inventoryItem._id,
            createdAt: new Date(item.inventoryItem.createdAt),
            updatedAt: new Date(item.inventoryItem.updatedAt)
          } : null,
          // Map batch if it's populated
          batch: item.batch ? {
            ...item.batch,
            id: item.batch._id,
            expiryDate: new Date(item.batch.expiryDate),
            createdAt: new Date(item.batch.createdAt),
            updatedAt: new Date(item.batch.updatedAt)
          } : null
        })),
        // Map customer if it's populated
        customer: sale.customer ? {
          id: sale.customer._id,
          ...sale.customer
        } : undefined
      }));
    } catch (error) {
      console.error('Error getting sales:', error);
      throw error;
    }
  },

  async updateSaleCustomer(saleId: string, customer: Customer) {
    try {
      const response = await fetch(`${API_URL}/sales/${saleId}/customer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customer.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update sale customer');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating sale customer:', error);
      throw error;
    }
  },

  // Format sale data for consistent usage
  formatSaleData(sale: any) {
    return {
      ...sale,
      id: sale._id || sale.id,
      saleDate: new Date(sale.saleDate),
      createdAt: new Date(sale.createdAt),
      updatedAt: new Date(sale.updatedAt),
      customer: sale.customer ? {
        id: sale.customer._id || sale.customer.id,
        name: sale.customer.name,
        mobile: sale.customer.mobile,
        address: sale.customer.address
      } : undefined
    };
  }
};