// src/app/dashboard/doctorFeeViewSales/DoctorFeeSalesSummary.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from '@/types/sale';
import { Receipt, Users, Stethoscope } from 'lucide-react';

interface DoctorFeeSalesSummaryProps {
  sales: Sale[];
}

const DoctorFeeSalesSummary = ({ sales }: DoctorFeeSalesSummaryProps) => {
  // Calculate totals from doctor fees only
  const totals = sales.reduce((acc, sale) => {
    const doctorFeesTotal = sale.doctorFees?.reduce((sum, fee) => sum + fee.amount, 0) || 0;
    
    return {
      sales: acc.sales + doctorFeesTotal,
      transactions: acc.transactions + (sale.doctorFees && sale.doctorFees.length > 0 ? 1 : 0),
      uniqueCustomers: new Set([...acc.uniqueCustomers, sale.customer?.id].filter(Boolean))
    };
  }, { 
    sales: 0, 
    transactions: 0, 
    uniqueCustomers: new Set<string>()
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Doctor Fees</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Rs{totals.sales.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Total fees collected
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totals.transactions}</div>
          <p className="text-xs text-muted-foreground">
            Number of consultations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totals.uniqueCustomers.size}</div>
          <p className="text-xs text-muted-foreground">
            Unique patients seen
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorFeeSalesSummary;