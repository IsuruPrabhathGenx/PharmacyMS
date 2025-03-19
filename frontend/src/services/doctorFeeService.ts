// src/services/doctorFeeService.ts

import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp } from 'firebase/firestore';
import { DoctorFee } from '@/types/doctorFee';

const COLLECTION = 'doctorFees';

export const doctorFeeService = {
  async create(fee: Omit<DoctorFee, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Timestamp.now();
    const docData = {
      name: fee.name,
      description: fee.description,
      defaultPrice: fee.defaultPrice || 0,
      createdAt: now,
      updatedAt: now
    };

    return addDoc(collection(db, COLLECTION), docData);
  },

  async update(id: string, fee: Partial<Omit<DoctorFee, 'id' | 'createdAt' | 'updatedAt'>>) {
    const ref = doc(db, COLLECTION, id);
    const updateData = {
      ...(fee.name && { name: fee.name }),
      ...(fee.description && { description: fee.description }),
      ...(typeof fee.defaultPrice === 'number' && { defaultPrice: fee.defaultPrice }),
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
      defaultPrice: doc.data().defaultPrice || 0,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as DoctorFee[];
  }
};