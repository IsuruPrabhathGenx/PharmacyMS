// // src/services/inventoryService.ts

// import { db } from '@/lib/firebase';
// import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp } from 'firebase/firestore';
// import { InventoryItem } from '@/types/inventory';

// const COLLECTION = 'inventory';

// export const inventoryService = {
//   async create(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) {
//     const now = Timestamp.now();
//     const docData = {
//       code: item.code,
//       name: item.name,
//       type: item.type,
//       minQuantity: item.minQuantity,
//       createdAt: now,
//       updatedAt: now
//     };

//     // Only include unitContains if it exists
//     if (item.hasUnitContains && item.unitContains) {
//       Object.assign(docData, { unitContains: item.unitContains });
//     }

//     return addDoc(collection(db, COLLECTION), docData);
//   },

//   async update(id: string, item: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>) {
//     const ref = doc(db, COLLECTION, id);
//     const updateData: any = {
//       ...(item.code && { code: item.code }),
//       ...(item.name && { name: item.name }),
//       ...(item.type && { type: item.type }),
//       ...(item.minQuantity !== undefined && { minQuantity: item.minQuantity }),
//       updatedAt: Timestamp.now()
//     };

//     // Handle unitContains updates
//     if (item.hasUnitContains && item.unitContains) {
//       updateData.unitContains = item.unitContains;
//     } else if (item.hasUnitContains === false) {
//       // Remove unitContains field if hasUnitContains is false
//       updateData.unitContains = null;
//     }

//     return updateDoc(ref, updateData);
//   },

//   async delete(id: string) {
//     return deleteDoc(doc(db, COLLECTION, id));
//   },

//   async getAll() {
//     const snapshot = await getDocs(collection(db, COLLECTION));
//     return snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     })) as InventoryItem[];
//   }
// };


// src/services/inventoryService.ts
import { InventoryItem } from '@/types/inventory';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const inventoryService = {
  async create(item: Omit<InventoryItem, 'id' | '_id' | 'createdAt' | 'updatedAt'>) {
    const response = await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create inventory item');
    }
    
    const data = await response.json();
    return data;
  },

  async update(id: string, item: Partial<Omit<InventoryItem, 'id' | '_id' | 'createdAt' | 'updatedAt'>>) {
    const response = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update inventory item');
    }
    
    const data = await response.json();
    return data;
  },

  async delete(id: string) {
    const response = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete inventory item');
    }
  },

  async getAll() {
    const response = await fetch(`${API_URL}/inventory`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch inventory items');
    }
    
    const data = await response.json();
    
    // Map MongoDB _id to id for compatibility with existing code
    return data.map((item: any) => ({
      ...item,
      id: item._id,
      // Convert any string dates to Date objects
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    }));
  }
};