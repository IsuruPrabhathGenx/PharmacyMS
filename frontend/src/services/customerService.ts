// import { db } from '@/lib/firebase';
// import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, Timestamp } from 'firebase/firestore';
// import { Customer } from '@/types/customer';

// const COLLECTION = 'customers';

// interface DocumentData {
//   documentText: string;
//   documentName: string;
//   uploadedAt: Date;
// }

// export const customerService = {

//   async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) {
//     const now = Timestamp.now();
//     return addDoc(collection(db, COLLECTION), {
//       name: customer.name,
//       mobile: customer.mobile,
//       address: customer.address || '',
//       discountPercentage: customer.discountPercentage !== undefined ? customer.discountPercentage : null,
//       createdAt: now,
//       updatedAt: now
//     });
//   },


//   async update(id: string, customer: Partial<Omit<Customer, 'id' | 'createdAt'>>) {
//     const ref = doc(db, COLLECTION, id);
//     return updateDoc(ref, {
//       ...(customer.name && { name: customer.name }),
//       ...(customer.mobile && { mobile: customer.mobile }),
//       ...(customer.address !== undefined && { address: customer.address }),
//       ...(customer.discountPercentage !== undefined && { discountPercentage: customer.discountPercentage }),
//       updatedAt: Timestamp.now()
//     });
//   },

//   async updateDocumentData(id: string, documentData: DocumentData) {
//     const ref = doc(db, COLLECTION, id);
//     return updateDoc(ref, {
//       documentText: documentData.documentText,
//       documentName: documentData.documentName,
//       documentUploadedAt: Timestamp.fromDate(documentData.uploadedAt),
//       updatedAt: Timestamp.now()
//     });
//   },

//   async delete(id: string) {
//     return deleteDoc(doc(db, COLLECTION, id));
//   },

//   async getAll() {
//     const snapshot = await getDocs(collection(db, COLLECTION));
//     return snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     })) as Customer[];
//   },

//   async getById(id: string) {
//     const docRef = doc(db, COLLECTION, id);
//     const docSnap = await getDoc(docRef);
    
//     if (docSnap.exists()) {
//       return {
//         id: docSnap.id,
//         ...docSnap.data()
//       } as Customer;
//     }
    
//     return null;
//   }
// };


// Frontend: services/customerService.ts
import { Customer } from '@/types/customer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const response = await fetch(`${API_URL}/customers`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    
    const data = await response.json();
    return data;
  },

  async getById(id: string): Promise<Customer | null> {
    const response = await fetch(`${API_URL}/customers/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch customer');
    }
    
    const data = await response.json();
    return data;
  },

  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create customer');
    }
    
    const data = await response.json();
    return data;
  },

  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update customer');
    }
    
    const data = await response.json();
    return data;
  },

  async updateDocumentData(id: string, documentData: {
    documentText: string;
    documentName: string;
    uploadedAt: Date;
  }): Promise<Customer> {
    const response = await fetch(`${API_URL}/customers/${id}/document`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update customer document');
    }
    
    const data = await response.json();
    return data;
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete customer');
    }
  },
};