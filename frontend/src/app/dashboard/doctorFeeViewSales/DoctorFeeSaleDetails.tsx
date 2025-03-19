//src/app/dashboard/doctorFeeViewSales/DoctorFeeSaleDetails.tsx
import React, { useState } from 'react';
import { Sale } from '@/types/sale';
import { CustomerSelector } from '@/app/dashboard/viewSales/CustomerSelector';
import { Customer } from '@/types/customer';
import { saleService } from '@/services/saleService';
import { format } from 'date-fns';
import { Calendar, User, Stethoscope, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DoctorFeeSaleDetailsProps {
  sale: Sale;
  onClose: () => void;
  onUpdate: () => void;
}

export function DoctorFeeSaleDetails({ sale, onClose, onUpdate }: DoctorFeeSaleDetailsProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(
    sale.customer
  );

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    
    setLoading(true);
    try {
      await saleService.updateSaleCustomer(sale.id!, selectedCustomer);
      onUpdate();
      setEditing(false);
    } catch (error) {
      console.error('Error updating sale:', error);
      alert('Error updating sale customer');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total for doctor fees
  const doctorFeesTotal = sale.doctorFees?.reduce((sum, fee) => sum + fee.amount, 0) || 0;

  return (
    <div className="flex flex-col h-[85vh]">
      {/* Header */}
      <div className="shrink-0 flex justify-between items-start border-b p-4 bg-background">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Doctor Fee Sale #{sale.id?.slice(-6)}</h2>
          <div className="flex items-center text-muted-foreground gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(sale.saleDate, 'PPpp')}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">Rs{doctorFeesTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Patient Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <CustomerSelector
                    selectedCustomer={selectedCustomer}
                    onSelectCustomer={setSelectedCustomer}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setSelectedCustomer(sale.customer);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateCustomer}
                      disabled={loading || !selectedCustomer}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Patient'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    {sale.customer ? (
                      <>
                        <p className="font-medium">{sale.customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {sale.customer.mobile}
                        </p>
                        {sale.customer.address && (
                          <p className="text-sm text-muted-foreground">
                            {sale.customer.address}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground">Walk-in Patient</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(true)}
                  >
                    Edit Patient
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctor Fees */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                <CardTitle>Services & Fees</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sale.doctorFees?.map((fee, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start p-4 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{fee.fee.name}</p>
                      {fee.fee.description && (
                        <p className="text-sm text-muted-foreground">
                          {fee.fee.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rs{fee.amount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between pt-2">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold">
                  Rs{doctorFeesTotal.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t p-4 bg-background">
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}