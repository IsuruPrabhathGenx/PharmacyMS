// src/services/laboratoryTestService.ts

import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp } from 'firebase/firestore';
import { LaboratoryTest } from '@/types/laboratoryTest';

const COLLECTION = 'laboratoryTests';

export const laboratoryTestService = {
  async create(test: Omit<LaboratoryTest, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Timestamp.now();
    const docData = {
      name: test.name,
      description: test.description,
      price: test.price,
      createdAt: now,
      updatedAt: now
    };

    return addDoc(collection(db, COLLECTION), docData);
  },

  async update(id: string, test: Partial<Omit<LaboratoryTest, 'id' | 'createdAt' | 'updatedAt'>>) {
    const ref = doc(db, COLLECTION, id);
    const updateData = {
      ...(test.name && { name: test.name }),
      ...(test.description && { description: test.description }),
      ...(typeof test.price === 'number' && { price: test.price }),
      updatedAt: Timestamp.now()
    };

    return updateDoc(ref, updateData);
  },

  async delete(id: string) {
    return deleteDoc(doc(db, COLLECTION, id));
  },

  async getAll() {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      price: doc.data().price || 0,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as LaboratoryTest[];
  }
};