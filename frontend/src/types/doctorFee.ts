// src/types/doctorFee.ts

export interface DoctorFee {
    id?: string;
    name: string;
    description: string;
    defaultPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

// This type is used when adding doctor fee to cart
export interface DoctorFeeSaleItem {
    type: 'doctorFee';
    feeId: string;
    fee: DoctorFee;
    amount: number;
    totalPrice: number;
}   