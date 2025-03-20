// import { db } from '@/lib/firebase';
// import {
//   collection,
//   addDoc,
//   doc,
//   getDocs,
//   query,
//   where,
//   Timestamp,
//   getDoc,
//   runTransaction,
//   DocumentSnapshot,
//   DocumentReference
// } from 'firebase/firestore';
// import { Purchase, PurchaseWithDetails, BatchWithDetails } from '@/types/purchase';
// import { InventoryItem } from '@/types/inventory';
// import { Supplier } from '@/types/supplier';

// const PURCHASES_COLLECTION = 'purchases';
// const BATCHES_COLLECTION = 'batches';
// const SUPPLIERS_COLLECTION = 'suppliers';

// // Cache configuration
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// interface CacheEntry {
//   data: BatchWithDetails[] | PurchaseWithDetails[];
//   timestamp: number;
//   promise?: Promise<any>;
// }

// interface Cache {
//   [key: string]: CacheEntry;
// }

// let batchCache: Cache = {};
// let purchaseCache: Cache = {};

// // Helper function to check if cache is valid
// const isCacheValid = (cacheEntry: CacheEntry | undefined): boolean => {
//   if (!cacheEntry) return false;
//   return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
// };

// // Helper function to get supplier details with caching
// const getSupplierDetails = async (supplierId: string): Promise<Supplier | null> => {
//   const supplierRef = doc(db, SUPPLIERS_COLLECTION, supplierId);
//   const supplierSnap = await getDoc(supplierRef);
//   if (!supplierSnap.exists()) {
//     console.warn(`Supplier not found: ${supplierId}`);
//     return null;
//   }
//   return { id: supplierSnap.id, ...supplierSnap.data() } as Supplier;
// };

// // Helper function to get inventory item details with caching
// const getInventoryDetails = async (itemId: string): Promise<InventoryItem | null> => {
//   const itemRef = doc(db, 'inventory', itemId);
//   const itemSnap = await getDoc(itemRef);
//   if (!itemSnap.exists()) {
//     console.warn(`Item not found: ${itemId}`);
//     return null;
//   }
//   return { id: itemSnap.id, ...itemSnap.data() } as InventoryItem;
// };

// export const purchaseService = {
//   async getNextBatchNumber(itemId: string): Promise<string> {
//     try {
//       const batchesRef = collection(db, BATCHES_COLLECTION);
//       const q = query(
//         batchesRef,
//         where('itemId', '==', itemId)
//       );
//       const snapshot = await getDocs(q);
      
//       if (snapshot.empty) {
//         return '001';
//       }

//       const batchNumbers = snapshot.docs.map(doc => 
//         parseInt(doc.data().batchNumber)
//       );
//       const maxBatchNumber = Math.max(...batchNumbers);
//       return (maxBatchNumber + 1).toString().padStart(3, '0');
//     } catch (error) {
//       console.error('Error getting next batch number:', error);
//       throw error;
//     }
//   },

//   async create(purchase: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) {
//     try {
//       return await runTransaction(db, async (transaction) => {
//         const now = Timestamp.now();
        
//         // Create purchase document with cleaned data and price information
//         const purchaseData = {
//           supplierId: purchase.supplierId,
//           items: purchase.items.map(item => ({
//             itemId: item.itemId,
//             batchNumber: item.batchNumber,
//             quantity: item.quantity,
//             unitsPerPack: item.unitsPerPack || null,
//             totalQuantity: item.totalQuantity,
//             expiryDate: Timestamp.fromDate(item.expiryDate),
//             costPricePerUnit: item.costPricePerUnit,
//             sellingPricePerUnit: item.sellingPricePerUnit
//           })),
//           totalAmount: purchase.totalAmount,
//           purchaseDate: Timestamp.fromDate(purchase.purchaseDate),
//           invoiceNumber: purchase.invoiceNumber || null,
//           notes: purchase.notes || null,
//           createdAt: now,
//           updatedAt: now
//         };
        
//         const purchaseRef = await addDoc(collection(db, PURCHASES_COLLECTION), purchaseData);

//         // Create batch documents for each item with price information
//         for (const item of purchase.items) {
//           await addDoc(collection(db, BATCHES_COLLECTION), {
//             batchNumber: item.batchNumber,
//             itemId: item.itemId,
//             quantity: item.totalQuantity,
//             expiryDate: Timestamp.fromDate(item.expiryDate),
//             purchaseId: purchaseRef.id,
//             costPrice: item.costPricePerUnit,
//             unitPrice: item.sellingPricePerUnit,
//             supplierId: purchase.supplierId,
//             createdAt: now,
//             updatedAt: now
//           });
//         }

//         // Clear caches after successful purchase
//         this.clearBatchCache();
//         this.clearPurchaseCache();

//         return purchaseRef;
//       });
//     } catch (error) {
//       console.error('Error creating purchase:', error);
//       throw error;
//     }
//   },

//   async getAll(): Promise<PurchaseWithDetails[]> {
//     try {
//       // Check cache
//       if (isCacheValid(purchaseCache['all'])) {
//         return purchaseCache['all'].data as PurchaseWithDetails[];
//       }

//       // If there's an ongoing request, return its promise
//       if (purchaseCache['all']?.promise) {
//         return purchaseCache['all'].promise;
//       }

//       const promise = (async () => {
//         const purchases: PurchaseWithDetails[] = [];
//         const snapshot = await getDocs(collection(db, PURCHASES_COLLECTION));

//         for (const purchaseDoc of snapshot.docs) {
//           const data = purchaseDoc.data();
          
//           if (!data || !data.supplierId || !data.items) {
//             console.warn(`Invalid purchase data for document ${purchaseDoc.id}`);
//             continue;
//           }

//           // Get supplier data
//           const supplier = await getSupplierDetails(data.supplierId);
//           if (!supplier) continue;

//           // Get items data
//           const itemsWithDetails = [];
//           for (const item of data.items) {
//             if (!item || !item.itemId) {
//               console.warn('Invalid item data in purchase');
//               continue;
//             }

//             const inventoryItem = await getInventoryDetails(item.itemId);
//             if (inventoryItem) {
//               itemsWithDetails.push({
//                 ...item,
//                 item: inventoryItem,
//                 expiryDate: item.expiryDate instanceof Timestamp ? 
//                   item.expiryDate.toDate() : 
//                   new Date(item.expiryDate)
//               });
//             }
//           }

//           // Convert Timestamp fields to Date objects
//           const purchase: PurchaseWithDetails = {
//             id: purchaseDoc.id,
//             ...data,
//             supplier,
//             items: itemsWithDetails,
//             purchaseDate: data.purchaseDate instanceof Timestamp ? 
//               data.purchaseDate.toDate() : 
//               new Date(data.purchaseDate),
//             createdAt: data.createdAt instanceof Timestamp ? 
//               data.createdAt.toDate() : 
//               new Date(data.createdAt),
//             updatedAt: data.updatedAt instanceof Timestamp ? 
//               data.updatedAt.toDate() : 
//               new Date(data.updatedAt)
//           };

//           purchases.push(purchase);
//         }

//         return purchases;
//       })();

//       // Store the promise in cache
//       purchaseCache['all'] = {
//         promise,
//         data: [] as PurchaseWithDetails[],
//         timestamp: Date.now()
//       };

//       const result = await promise;
      
//       // Update cache with the result
//       purchaseCache['all'] = {
//         data: result,
//         timestamp: Date.now()
//       };

//       return result;
//     } catch (error) {
//       console.error('Error getting purchases:', error);
//       throw error;
//     }
//   },

//   async getBatchesByItem(itemId: string): Promise<BatchWithDetails[]> {
//     try {
//       // Check cache first
//       if (isCacheValid(batchCache[itemId])) {
//         return batchCache[itemId].data as BatchWithDetails[];
//       }

//       // If there's an ongoing request, return its promise
//       if (batchCache[itemId]?.promise) {
//         return batchCache[itemId].promise;
//       }

//       const promise = (async () => {
//         const q = query(
//           collection(db, BATCHES_COLLECTION),
//           where('itemId', '==', itemId)
//         );
        
//         const [snapshot, itemSnap] = await Promise.all([
//           getDocs(q),
//           getDoc(doc(db, 'inventory', itemId))
//         ]);
        
//         if (!itemSnap.exists()) {
//           throw new Error(`Item not found: ${itemId}`);
//         }

//         const item = { id: itemSnap.id, ...itemSnap.data() } as InventoryItem;

//         // Get all batches with their purchase and supplier details
//         const batchesWithDetails = await Promise.all(snapshot.docs.map(async batchDoc => {
//           const data = batchDoc.data();
          
//           // Get purchase and supplier data if available
//           let purchase = undefined;
//           let supplier = undefined;
          
//           if (data.purchaseId) {
//             const purchaseSnap = await getDoc(doc(db, PURCHASES_COLLECTION, data.purchaseId));
//             if (purchaseSnap.exists()) {
//               purchase = { id: purchaseSnap.id, ...purchaseSnap.data() } as Purchase;
              
//               if (purchase.supplierId) {
//                 supplier = await getSupplierDetails(purchase.supplierId);
//               }
//             }
//           }

//           return {
//             id: batchDoc.id,
//             ...data,
//             item,
//             purchase,
//             supplier,
//             unitPrice: data.unitPrice || purchase?.items.find(i => i.batchNumber === data.batchNumber)?.sellingPricePerUnit || 0,
//             costPrice: data.costPrice || purchase?.items.find(i => i.batchNumber === data.batchNumber)?.costPricePerUnit || 0,
//             expiryDate: data.expiryDate.toDate(),
//             createdAt: data.createdAt.toDate(),
//             updatedAt: data.updatedAt.toDate()
//           } as BatchWithDetails;
//         }));

//         // Sort by expiry date
//         return batchesWithDetails.sort((a, b) => 
//           a.expiryDate.getTime() - b.expiryDate.getTime()
//         );
//       })();

//       // Store the promise in cache
//       batchCache[itemId] = {
//         promise,
//         data: [] as BatchWithDetails[],
//         timestamp: Date.now()
//       };

//       const result = await promise;
      
//       // Update cache with the result
//       batchCache[itemId] = {
//         data: result,
//         timestamp: Date.now()
//       };

//       return result;
//     } catch (error) {
//       console.error('Error getting batches:', error);
//       throw error;
//     }
//   },

//   clearItemBatchCache(itemId: string) {
//     delete batchCache[itemId];
//   },

//   clearBatchCache() {
//     batchCache = {};
//   },

//   clearPurchaseCache() {
//     purchaseCache = {};
//   }
// };


// // src/services/purchaseService.ts
// import { Purchase, PurchaseWithDetails, BatchWithDetails, Batch } from '@/types/purchase';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// // Cache configuration
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// interface CacheEntry {
//   data: BatchWithDetails[] | PurchaseWithDetails[];
//   timestamp: number;
//   promise?: Promise<any>;
// }

// interface Cache {
//   [key: string]: CacheEntry;
// }

// let batchCache: Cache = {};
// let purchaseCache: Cache = {};

// // Helper function to check if cache is valid
// const isCacheValid = (cacheEntry: CacheEntry | undefined): boolean => {
//   if (!cacheEntry) return false;
//   return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
// };

// export const purchaseService = {
//   async getNextBatchNumber(itemId: string): Promise<string> {
//     try {
//       const response = await fetch(`${API_URL}/batches/next-batch-number/${itemId}`);
      
//       if (!response.ok) {
//         throw new Error('Failed to get next batch number');
//       }
      
//       const data = await response.json();
//       return data.batchNumber;
//     } catch (error) {
//       console.error('Error getting next batch number:', error);
//       throw error;
//     }
//   },

//   async create(purchase: Omit<Purchase, 'id' | '_id' | 'createdAt' | 'updatedAt'>) {
//     try {
//       // Prepare data for API - convert relationships to IDs if they are objects
//       const preparedPurchase = {
//         ...purchase,
//         supplier: typeof purchase.supplier === 'object' 
//           ? purchase.supplier._id || purchase.supplier.id 
//           : purchase.supplier,
//         items: purchase.items.map(item => ({
//           ...item,
//           inventoryItem: typeof item.inventoryItem === 'object'
//             ? item.inventoryItem._id || item.inventoryItem.id
//             : item.inventoryItem
//         }))
//       };

//       const response = await fetch(`${API_URL}/purchases`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(preparedPurchase),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to create purchase');
//       }
      
//       // Clear caches after successful purchase
//       this.clearBatchCache();
//       this.clearPurchaseCache();
      
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error('Error creating purchase:', error);
//       throw error;
//     }
//   },

//   async getAll(): Promise<PurchaseWithDetails[]> {
//     try {
//       // Check cache
//       if (isCacheValid(purchaseCache['all'])) {
//         return purchaseCache['all'].data as PurchaseWithDetails[];
//       }

//       // If there's an ongoing request, return its promise
//       if (purchaseCache['all']?.promise) {
//         return purchaseCache['all'].promise;
//       }

//       const promise = (async () => {
//         const response = await fetch(`${API_URL}/purchases`);
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch purchases');
//         }
        
//         const data = await response.json();
        
//         // Convert dates and map MongoDB _id to id for compatibility
//         const purchases = data.map((purchase: any) => ({
//           ...purchase,
//           id: purchase._id,
//           purchaseDate: new Date(purchase.purchaseDate),
//           createdAt: new Date(purchase.createdAt),
//           updatedAt: new Date(purchase.updatedAt),
//           items: purchase.items.map((item: any) => ({
//             ...item,
//             expiryDate: new Date(item.expiryDate),
//             // Map inventory item if it's populated
//             inventoryItem: item.inventoryItem ? {
//               ...item.inventoryItem,
//               id: item.inventoryItem._id,
//               createdAt: new Date(item.inventoryItem.createdAt),
//               updatedAt: new Date(item.inventoryItem.updatedAt)
//             } : item.inventoryItem
//           })),
//           // Map supplier if it's populated
//           supplier: purchase.supplier ? {
//             ...purchase.supplier,
//             id: purchase.supplier._id,
//             createdAt: new Date(purchase.supplier.createdAt),
//             updatedAt: new Date(purchase.supplier.updatedAt)
//           } : purchase.supplier
//         }));
        
//         return purchases;
//       })();

//       // Store the promise in cache
//       purchaseCache['all'] = {
//         promise,
//         data: [] as PurchaseWithDetails[],
//         timestamp: Date.now()
//       };

//       const result = await promise;
      
//       // Update cache with the result
//       purchaseCache['all'] = {
//         data: result,
//         timestamp: Date.now()
//       };

//       return result;
//     } catch (error) {
//       console.error('Error getting purchases:', error);
//       throw error;
//     }
//   },

//   async getBatchesByItem(itemId: string): Promise<BatchWithDetails[]> {
//     try {
//       // Check cache first
//       if (isCacheValid(batchCache[itemId])) {
//         return batchCache[itemId].data as BatchWithDetails[];
//       }

//       // If there's an ongoing request, return its promise
//       if (batchCache[itemId]?.promise) {
//         return batchCache[itemId].promise;
//       }

//       const promise = (async () => {
//         const response = await fetch(`${API_URL}/batches/by-item/${itemId}`);
        
//         if (!response.ok) {
//           throw new Error(`Failed to fetch batches for item ${itemId}`);
//         }
        
//         const data = await response.json();
        
//         // Map MongoDB _id to id for compatibility and convert dates
//         const batches = data.map((batch: any) => ({
//           ...batch,
//           id: batch._id,
//           expiryDate: new Date(batch.expiryDate),
//           createdAt: new Date(batch.createdAt),
//           updatedAt: new Date(batch.updatedAt),
//           // Map inventory item if it's populated
//           inventoryItem: batch.inventoryItem ? {
//             ...batch.inventoryItem,
//             id: batch.inventoryItem._id,
//             createdAt: new Date(batch.inventoryItem.createdAt),
//             updatedAt: new Date(batch.inventoryItem.updatedAt)
//           } : batch.inventoryItem,
//           // Map supplier if it's populated
//           supplier: batch.supplier ? {
//             ...batch.supplier,
//             id: batch.supplier._id,
//             createdAt: new Date(batch.supplier.createdAt),
//             updatedAt: new Date(batch.supplier.updatedAt)
//           } : batch.supplier,
//           // Map purchase if it's populated
//           purchase: batch.purchase ? {
//             ...batch.purchase,
//             id: batch.purchase._id,
//             purchaseDate: new Date(batch.purchase.purchaseDate),
//             createdAt: new Date(batch.purchase.createdAt),
//             updatedAt: new Date(batch.purchase.updatedAt)
//           } : batch.purchase
//         }));
        
//         // Sort by expiry date
//         return batches.sort((a: BatchWithDetails, b: BatchWithDetails) => 
//           new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
//         );
//       })();

//       // Store the promise in cache
//       batchCache[itemId] = {
//         promise,
//         data: [] as BatchWithDetails[],
//         timestamp: Date.now()
//       };

//       const result = await promise;
      
//       // Update cache with the result
//       batchCache[itemId] = {
//         data: result,
//         timestamp: Date.now()
//       };

//       return result;
//     } catch (error) {
//       console.error('Error getting batches:', error);
//       throw error;
//     }
//   },

//   clearItemBatchCache(itemId: string) {
//     delete batchCache[itemId];
//   },

//   clearBatchCache() {
//     batchCache = {};
//   },

//   clearPurchaseCache() {
//     purchaseCache = {};
//   }
// };

// src/services/purchaseService.ts
import { Purchase, PurchaseWithDetails, BatchWithDetails, Batch, PurchaseItem } from '@/types/purchase';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
interface CacheEntry {
  data: BatchWithDetails[] | PurchaseWithDetails[];
  timestamp: number;
  promise?: Promise<any>;
}

interface Cache {
  [key: string]: CacheEntry;
}

let batchCache: Cache = {};
let purchaseCache: Cache = {};

// Helper function to check if cache is valid
const isCacheValid = (cacheEntry: CacheEntry | undefined): boolean => {
  if (!cacheEntry) return false;
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
};

export const purchaseService = {
  async getNextBatchNumber(itemId: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/batches/next-batch-number/${itemId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get next batch number');
      }
      
      const data = await response.json();
      return data.batchNumber;
    } catch (error) {
      console.error('Error getting next batch number:', error);
      throw error;
    }
  },

  async create(purchase: any) {
    try {
      // Prepare data for API format
      const submitData = {
        supplier: purchase.supplierId || purchase.supplier,
        items: purchase.items.map((item: any) => ({
          inventoryItem: item.itemId || item.inventoryItem,
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          unitsPerPack: item.unitsPerPack,
          totalQuantity: item.totalQuantity,
          expiryDate: item.expiryDate,
          costPricePerUnit: item.costPricePerUnit,
          sellingPricePerUnit: item.sellingPricePerUnit
        })),
        totalAmount: purchase.totalAmount,
        purchaseDate: purchase.purchaseDate,
        invoiceNumber: purchase.invoiceNumber || '',
        notes: purchase.notes || ''
      };

      const response = await fetch(`${API_URL}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create purchase');
      }
      
      // Clear caches after successful purchase
      this.clearBatchCache();
      this.clearPurchaseCache();
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  },

  async getAll(): Promise<PurchaseWithDetails[]> {
    try {
      // Check cache
      if (isCacheValid(purchaseCache['all'])) {
        return purchaseCache['all'].data as PurchaseWithDetails[];
      }

      // If there's an ongoing request, return its promise
      if (purchaseCache['all']?.promise) {
        return purchaseCache['all'].promise;
      }

      const promise = (async () => {
        const response = await fetch(`${API_URL}/purchases`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch purchases');
        }
        
        const data = await response.json();
        
        // Transform the data to match the frontend expected format
        const purchases = data.map((purchase: any) => {
          // Map nested item data
          const items = purchase.items.map((item: any) => {
            // Inventory item mapping
            const inventoryItem = item.inventoryItem ? {
              id: item.inventoryItem._id,
              _id: item.inventoryItem._id,
              ...item.inventoryItem,
              createdAt: new Date(item.inventoryItem.createdAt),
              updatedAt: new Date(item.inventoryItem.updatedAt)
            } : null;

            return {
              ...item,
              item: inventoryItem, // For compatibility with current components
              inventoryItem,
              itemId: item.inventoryItem?._id,
              expiryDate: new Date(item.expiryDate)
            };
          });

          // Map supplier data
          const supplier = purchase.supplier ? {
            id: purchase.supplier._id,
            _id: purchase.supplier._id,
            ...purchase.supplier,
            createdAt: new Date(purchase.supplier.createdAt),
            updatedAt: new Date(purchase.supplier.updatedAt)
          } : null;

          return {
            id: purchase._id,
            _id: purchase._id,
            ...purchase,
            supplierId: purchase.supplier?._id,
            supplier,
            items,
            purchaseDate: new Date(purchase.purchaseDate),
            createdAt: new Date(purchase.createdAt),
            updatedAt: new Date(purchase.updatedAt)
          };
        });
        
        return purchases;
      })();

      // Store the promise in cache
      purchaseCache['all'] = {
        promise,
        data: [] as PurchaseWithDetails[],
        timestamp: Date.now()
      };

      const result = await promise;
      
      // Update cache with the result
      purchaseCache['all'] = {
        data: result,
        timestamp: Date.now()
      };

      return result;
    } catch (error) {
      console.error('Error getting purchases:', error);
      throw error;
    }
  },

  async getBatchesByItem(itemId: string): Promise<BatchWithDetails[]> {
    try {
      // Check cache first
      if (isCacheValid(batchCache[itemId])) {
        return batchCache[itemId].data as BatchWithDetails[];
      }

      // If there's an ongoing request, return its promise
      if (batchCache[itemId]?.promise) {
        return batchCache[itemId].promise;
      }

      const promise = (async () => {
        const response = await fetch(`${API_URL}/batches/by-item/${itemId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch batches for item ${itemId}`);
        }
        
        const data = await response.json();
        
        // Transform the data to match the frontend expected format
        const batches = data.map((batch: any) => {
          // Map inventoryItem to item for compatibility
          const inventoryItem = batch.inventoryItem ? {
            id: batch.inventoryItem._id,
            _id: batch.inventoryItem._id,
            ...batch.inventoryItem,
            createdAt: new Date(batch.inventoryItem.createdAt),
            updatedAt: new Date(batch.inventoryItem.updatedAt)
          } : null;

          // Map supplier
          const supplier = batch.supplier ? {
            id: batch.supplier._id,
            _id: batch.supplier._id,
            ...batch.supplier,
            createdAt: new Date(batch.supplier.createdAt),
            updatedAt: new Date(batch.supplier.updatedAt)
          } : null;

          // Map purchase
          const purchase = batch.purchase ? {
            id: batch.purchase._id,
            _id: batch.purchase._id,
            ...batch.purchase,
            purchaseDate: new Date(batch.purchase.purchaseDate),
            createdAt: new Date(batch.purchase.createdAt),
            updatedAt: new Date(batch.purchase.updatedAt)
          } : null;

          return {
            id: batch._id,
            _id: batch._id,
            ...batch,
            itemId: batch.inventoryItem?._id,
            supplierId: batch.supplier?._id,
            purchaseId: batch.purchase?._id,
            item: inventoryItem, // For compatibility with existing components
            inventoryItem,
            supplier,
            purchase,
            expiryDate: new Date(batch.expiryDate),
            createdAt: new Date(batch.createdAt),
            updatedAt: new Date(batch.updatedAt)
          };
        });
        
        // Sort by expiry date
        return batches.sort((a: BatchWithDetails, b: BatchWithDetails) => 
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        );
      })();

      // Store the promise in cache
      batchCache[itemId] = {
        promise,
        data: [] as BatchWithDetails[],
        timestamp: Date.now()
      };

      const result = await promise;
      
      // Update cache with the result
      batchCache[itemId] = {
        data: result,
        timestamp: Date.now()
      };

      return result;
    } catch (error) {
      console.error('Error getting batches:', error);
      throw error;
    }
  },

  clearItemBatchCache(itemId: string) {
    delete batchCache[itemId];
  },

  clearBatchCache() {
    batchCache = {};
  },

  clearPurchaseCache() {
    purchaseCache = {};
  }
};