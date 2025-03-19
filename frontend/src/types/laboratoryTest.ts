// src/types/laboratoryTest.ts

export interface LaboratoryTest {
    id?: string;
    name: string;
    description: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

// This type is used when adding laboratory test to cart
export interface LaboratoryTestSaleItem {
    type: 'laboratoryTest';
    testId: string;
    test: LaboratoryTest;
    price: number;
    totalPrice: number;
}