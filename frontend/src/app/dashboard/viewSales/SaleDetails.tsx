// // src/app/dashboard/viewSales/SaleDetails.tsx
// import React, { useState } from 'react';
// import { Sale } from '@/types/sale';
// import { CustomerSelector } from './CustomerSelector';
// import { Customer } from '@/types/customer';
// import { saleService } from '@/services/saleService';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableFooter,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Loader2,
//   Calendar,
//   User,
//   Package,
//   Stethoscope,
//   TestTube,
//   DollarSign
// } from 'lucide-react';
// import { format } from 'date-fns';

// interface SaleDetailsProps {
//   sale: Sale;
//   onClose: () => void;
//   onUpdate: () => void;
// }

// export function SaleDetails({ sale, onClose, onUpdate }: SaleDetailsProps) {
//   const [editing, setEditing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(
//     sale.customer
//   );

//   const handleUpdateCustomer = async () => {
//     if (!selectedCustomer) return;
    
//     setLoading(true);
//     try {
//       await saleService.updateSaleCustomer(sale.id!, selectedCustomer);
//       onUpdate();
//       setEditing(false);
//     } catch (error) {
//       console.error('Error updating sale:', error);
//       alert('Error updating sale customer');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusBadge = () => {
//     const now = new Date();
//     const saleDate = new Date(sale.saleDate);
//     const diffHours = Math.abs(now.getTime() - saleDate.getTime()) / 36e5;

//     if (diffHours <= 24) {
//       return <Badge variant="success">Recent</Badge>;
//     }
//     return null;
//   };

//   return (
//     <div className="flex flex-col h-[85vh]">
//       {/* Fixed Header */}
//       <div className="shrink-0 flex justify-between items-start border-b p-4 bg-background">
//         <div className="space-y-1">
//           <div className="flex items-center gap-2">
//             <h2 className="text-xl font-semibold">Sale #{sale.id?.slice(-6)}</h2>
//             {getStatusBadge()}
//           </div>
//           <div className="flex items-center text-muted-foreground gap-2">
//             <Calendar className="h-4 w-4" />
//             <span>{format(sale.saleDate, 'PPpp')}</span>
//           </div>
//         </div>
//         <div className="text-right">
//           <p className="text-2xl font-bold">${sale.totalAmount.toFixed(2)}</p>
//           <p className="text-sm text-muted-foreground">
//             Profit: ${(sale.totalAmount - sale.totalCost).toFixed(2)}
//           </p>
//         </div>
//       </div>

//       {/* Scrollable Content */}
//       <div className="flex-1 overflow-y-auto ">
//         <div className="space-y-6 py-4">
//           {/* Customer Information */}
//           <div className="space-y-2">
//             <div className="flex items-center gap-2">
//               <User className="h-5 w-5" />
//               <h3 className="text-lg font-medium">Customer Information</h3>
//             </div>
            
//             {editing ? (
//               <div className="space-y-4">
//                 <CustomerSelector
//                   selectedCustomer={selectedCustomer}
//                   onSelectCustomer={setSelectedCustomer}
//                 />
//                 <div className="flex justify-end gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setEditing(false);
//                       setSelectedCustomer(sale.customer);
//                     }}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={handleUpdateCustomer}
//                     disabled={loading || !selectedCustomer}
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Updating...
//                       </>
//                     ) : (
//                       'Update Customer'
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex justify-between items-start bg-muted/50 p-4 rounded-lg">
//                 <div>
//                   {sale.customer ? (
//                     <>
//                       <p className="font-medium">{sale.customer.name}</p>
//                       <p className="text-sm text-muted-foreground">
//                         {sale.customer.mobile}
//                       </p>
//                       {sale.customer.address && (
//                         <p className="text-sm text-muted-foreground">
//                           {sale.customer.address}
//                         </p>
//                       )}
//                     </>
//                   ) : (
//                     <p className="text-muted-foreground">Walk-in Customer</p>
//                   )}
//                 </div>
//                 <Button
//                   variant="outline"
//                   onClick={() => setEditing(true)}
//                 >
//                   Edit Customer
//                 </Button>
//               </div>
//             )}
//           </div>

//           {/* Sale Items */}
//           {sale.items && sale.items.length > 0 && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <Package className="h-5 w-5" />
//                 <h3 className="text-lg font-medium">Inventory Items</h3>
//               </div>
//               <div className="rounded-lg border">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Item</TableHead>
//                       <TableHead>Batch</TableHead>
//                       <TableHead>Quantity</TableHead>
//                       <TableHead className="text-right">Amount</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {sale.items.map((item, index) => (
//                       <TableRow key={index}>
//                         <TableCell>
//                           <div>
//                             <p className="font-medium">{item.item.name}</p>
//                             <p className="text-sm text-muted-foreground">
//                               {item.item.code}
//                             </p>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant="secondary">
//                             Batch #{item.batch.batchNumber}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <div className="space-y-1">
//                             {item.unitQuantity > 0 && (
//                               <p>{item.unitQuantity} units</p>
//                             )}
//                             {item.subUnitQuantity > 0 && item.item.unitContains && (
//                               <p className="text-sm text-muted-foreground">
//                                 {item.subUnitQuantity} {item.item.unitContains.unit}
//                               </p>
//                             )}
//                           </div>
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ${item.totalPrice.toFixed(2)}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                   <TableFooter>
//                     <TableRow>
//                       <TableCell colSpan={3}>Subtotal</TableCell>
//                       <TableCell className="text-right">
//                         ${sale.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
//                       </TableCell>
//                     </TableRow>
//                   </TableFooter>
//                 </Table>
//               </div>
//             </div>
//           )}

//           {/* Doctor Fees */}
//           {sale.doctorFees && sale.doctorFees.length > 0 && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <Stethoscope className="h-5 w-5" />
//                 <h3 className="text-lg font-medium">Doctor Fees</h3>
//               </div>
//               <div className="rounded-lg border">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Service</TableHead>
//                       <TableHead>Description</TableHead>
//                       <TableHead className="text-right">Amount</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {sale.doctorFees.map((fee, index) => (
//                       <TableRow key={index}>
//                         <TableCell>
//                           <p className="font-medium">{fee.fee.name}</p>
//                         </TableCell>
//                         <TableCell>
//                           <p className="text-sm text-muted-foreground">
//                             {fee.fee.description}
//                           </p>
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ${fee.amount.toFixed(2)}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                   <TableFooter>
//                     <TableRow>
//                       <TableCell colSpan={2}>Subtotal</TableCell>
//                       <TableCell className="text-right">
//                         ${sale.doctorFees.reduce((sum, fee) => sum + fee.amount, 0).toFixed(2)}
//                       </TableCell>
//                     </TableRow>
//                   </TableFooter>
//                 </Table>
//               </div>
//             </div>
//           )}

//           {/* Laboratory Tests */}
//           {sale.laboratoryTests && sale.laboratoryTests.length > 0 && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <TestTube className="h-5 w-5" />
//                 <h3 className="text-lg font-medium">Laboratory Tests</h3>
//               </div>
//               <div className="rounded-lg border">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Test</TableHead>
//                       <TableHead>Description</TableHead>
//                       <TableHead className="text-right">Amount</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {sale.laboratoryTests.map((test, index) => (
//                       <TableRow key={index}>
//                         <TableCell>
//                           <p className="font-medium">{test.test.name}</p>
//                         </TableCell>
//                         <TableCell>
//                           <p className="text-sm text-muted-foreground">
//                             {test.test.description}
//                           </p>
//                         </TableCell>
//                         <TableCell className="text-right">
//                           ${test.price.toFixed(2)}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                   <TableFooter>
//                     <TableRow>
//                       <TableCell colSpan={2}>Subtotal</TableCell>
//                       <TableCell className="text-right">
//                         ${sale.laboratoryTests.reduce((sum, test) => sum + test.price, 0).toFixed(2)}
//                       </TableCell>
//                     </TableRow>
//                   </TableFooter>
//                 </Table>
//               </div>
//             </div>
//           )}

//           {/* Final Summary */}
//           <div className="space-y-2">
//             <div className="flex items-center gap-2">
//               <DollarSign className="h-5 w-5" />
//               <h3 className="text-lg font-medium">Summary</h3>
//             </div>
//             <div className="bg-muted/50 p-4 rounded-lg space-y-2">
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Total Amount</span>
//                 <span className="font-medium">${sale.totalAmount.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Total Cost</span>
//                 <span className="font-medium">${sale.totalCost.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between pt-2 border-t">
//                 <span className="font-medium">Profit</span>
//                 <span className="font-bold text-green-600">
//                   ${(sale.totalAmount - sale.totalCost).toFixed(2)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

      
//       {/* Fixed Footer */}
//       <div className="shrink-0 border-t p-4 bg-background">
//         <div className="flex justify-end">
//           <Button variant="outline" onClick={onClose}>
//             Close
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from 'react';
import { Sale } from '@/types/sale';
import { CustomerSelector } from './CustomerSelector';
import { Customer } from '@/types/customer';
import { saleService } from '@/services/saleService';
import { format } from 'date-fns';
import { Calendar, User, Package, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SaleDetailsProps {
  sale: Sale;
  onClose: () => void;
  onUpdate: () => void;
}

export function SaleDetails({ sale, onClose, onUpdate }: SaleDetailsProps) {

    if (!sale.items || sale.items.length === 0) {
        return null;
      }

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

  // Calculate totals from inventory items only
  const inventoryTotal = sale.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const inventoryCost = sale.items.reduce((sum, item) => sum + item.totalCost, 0);
  const profit = inventoryTotal - inventoryCost;

  return (
    <div className="flex flex-col h-[85vh]">
      {/* Header */}
      <div className="shrink-0 flex justify-between items-start border-b p-4 bg-background">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Sale #{sale.id?.slice(-6)}</h2>
          <div className="flex items-center text-muted-foreground gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(sale.saleDate, 'PPpp')}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">Rs{inventoryTotal.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            Profit: Rs{profit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Customer Information</CardTitle>
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
                        'Update Customer'
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
                      <p className="text-muted-foreground">Walk-in Customer</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(true)}
                  >
                    Edit Customer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <CardTitle>Inventory Items</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sale.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start p-4 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{item.item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.item.code}
                      </p>
                      <div className="mt-2">
                        <Badge variant="secondary">
                          Batch #{item.batch.batchNumber}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rs{item.totalPrice.toFixed(2)}</p>
                      <div className="space-y-1 mt-2 text-sm text-muted-foreground">
                        {item.unitQuantity > 0 && (
                          <p>{item.unitQuantity} units</p>
                        )}
                        {item.subUnitQuantity > 0 && item.item.unitContains && (
                          <p>
                            {item.subUnitQuantity} {item.item.unitContains.unit}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <CardTitle>Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">Rs{inventoryTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-medium">Rs{inventoryCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Profit</span>
                  <span className="font-bold text-green-600">
                    Rs{profit.toFixed(2)}
                  </span>
                </div>
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