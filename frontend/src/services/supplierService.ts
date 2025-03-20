// // services/supplierService.ts

// import { db } from '@/lib/firebase';
// import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, where } from 'firebase/firestore';
// import { Supplier } from '@/types/supplier';

// const COLLECTION = 'suppliers';

// export const supplierService = {
//   async create(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) {
//     const now = Timestamp.now();
//     return addDoc(collection(db, COLLECTION), {
//       ...supplier,
//       createdAt: now,
//       updatedAt: now
//     });
//   },

//   async update(id: string, supplier: Partial<Omit<Supplier, 'id' | 'createdAt'>>) {
//     const ref = doc(db, COLLECTION, id);
//     const updateData = {
//       ...supplier,
//       updatedAt: Timestamp.now()
//     };

//     return updateDoc(ref, updateData);
//   },

//   async delete(id: string) {
//     return deleteDoc(doc(db, COLLECTION, id));
//   },

//   async getAll() {
//     const snapshot = await getDocs(collection(db, COLLECTION));
//     return snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//       createdAt: doc.data().createdAt?.toDate(),
//       updatedAt: doc.data().updatedAt?.toDate()
//     })) as Supplier[];
//   },

//   async getActive() {
//     const q = query(
//       collection(db, COLLECTION),
//       where('status', '==', 'active')
//     );
//     const snapshot = await getDocs(q);
//     return snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//       createdAt: doc.data().createdAt?.toDate(),
//       updatedAt: doc.data().updatedAt?.toDate()
//     })) as Supplier[];
//   }
// };


// Frontend: services/supplierService.ts
import { Supplier } from '@/types/supplier';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const supplierService = {
  async create(supplier: Omit<Supplier, 'id' | '_id' | 'createdAt' | 'updatedAt'>) {
    const response = await fetch(`${API_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplier),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create supplier');
    }
    
    const data = await response.json();
    return data;
  },

  async update(id: string, supplier: Partial<Omit<Supplier, 'id' | '_id' | 'createdAt' | 'updatedAt'>>) {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplier),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update supplier');
    }
    
    const data = await response.json();
    return data;
  },

  async delete(id: string) {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete supplier');
    }
  },

  async getAll() {
    const response = await fetch(`${API_URL}/suppliers`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch suppliers');
    }
    
    const data = await response.json();
    
    // Map MongoDB _id to id for compatibility with existing code
    return data.map((supplier: any) => ({
      ...supplier,
      id: supplier._id,
    }));
  },

  async getActive() {
    const response = await fetch(`${API_URL}/suppliers/active`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch active suppliers');
    }
    
    const data = await response.json();
    
    // Map MongoDB _id to id for compatibility with existing code
    return data.map((supplier: any) => ({
      ...supplier,
      id: supplier._id,
    }));
  }
};