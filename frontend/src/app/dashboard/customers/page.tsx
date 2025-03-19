// 'use client';

// import { useState, useEffect } from 'react';
// import { customerService } from '@/services/customerService';
// import { Customer } from '@/types/customer';
// import DashboardLayout from '@/components/DashboardLayout';
// import { Plus, Search, X, Loader2, Edit, Trash2, Download, Filter, MoreHorizontal, User, Phone, MapPin, Percent } from 'lucide-react';
// import AddCustomerModal from './AddCustomerModal';
// import EditCustomerModal from './EditCustomerModal';
// import ImportCustomers from './ImportCustomers';
// import DeleteCustomerDialog from './DeleteCustomerDialog';
// import { 
//   Table, 
//   TableBody, 
//   TableCell, 
//   TableHead, 
//   TableHeader, 
//   TableRow 
// } from '@/components/ui/table';
// import { 
//   Card, 
//   CardContent, 
//   CardHeader,
//   CardTitle,
//   CardDescription
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
//   DropdownMenuLabel
// } from '@/components/ui/dropdown-menu';
// import { Badge } from '@/components/ui/badge';
// import ExportCustomers from './ExportCustomers';

// export default function CustomersPage() {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [showImportModal, setShowImportModal] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortBy, setSortBy] = useState<'name' | 'recent'>('recent');

//   const loadCustomers = async () => {
//     try {
//       setLoading(true);
//       const data = await customerService.getAll();
//       setCustomers(data);
//       setFilteredCustomers(data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCustomers();
//   }, []);

//   useEffect(() => {
//     if (searchQuery.trim() === '') {
//       setFilteredCustomers(customers);
//     } else {
//       const query = searchQuery.toLowerCase();
//       const filtered = customers.filter(customer => 
//         customer.name.toLowerCase().includes(query) || 
//         customer.mobile.toLowerCase().includes(query) ||
//         (customer.address && customer.address.toLowerCase().includes(query))
//       );
//       setFilteredCustomers(filtered);
//     }

//     // Apply sorting
//     if (sortBy === 'name') {
//       setFilteredCustomers(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
//     } else if (sortBy === 'recent') {
//       setFilteredCustomers(prev => [...prev].sort((a, b) => 
//         new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
//       ));
//     }
//   }, [searchQuery, customers, sortBy]);

//   const handleDelete = async (id: string) => {
//     await customerService.delete(id);
//     await loadCustomers();
//   };

//   const openDeleteDialog = (customer: Customer) => {
//     setSelectedCustomer(customer);
//     setShowDeleteDialog(true);
//   };

//   const clearSearch = () => {
//     setSearchQuery('');
//   };

//   return (
//     <DashboardLayout>
//       <div className="space-y-6 h-full px-4 py-6 max-w-7xl mx-auto">
//         {/* Header with gradient background */}
//         <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-lg">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-white">Customer Management</h1>
//               <p className="text-blue-100 mt-1">Manage and organize your customer database</p>
//             </div>
//             <div className="flex flex-wrap gap-3">
//               <Button 
//                 onClick={() => setShowAddModal(true)}
//                 className="bg-white text-blue-600 hover:bg-blue-50"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Customer
//               </Button>
              
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" className="bg-blue-500 text-white border-blue-400 hover:bg-blue-400">
//                     <MoreHorizontal className="h-4 w-4 mr-2" />
//                     Actions
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-48">
//                   <DropdownMenuLabel>Customer Options</DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={() => setShowImportModal(true)}>
//                     <Download className="h-4 w-4 mr-2" />
//                     Import CSV
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     <ExportCustomers customers={customers} />
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         </div>
        
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-md hover:shadow-lg transition-shadow">
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 font-medium">Total Customers</p>
//                   <p className="text-3xl font-bold text-emerald-600">{customers.length}</p>
//                 </div>
//                 <div className="rounded-full bg-emerald-100 p-3">
//                   <User className="h-6 w-6 text-emerald-500" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
          
//           <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-0 shadow-md hover:shadow-lg transition-shadow">
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 font-medium">Recent Activity</p>
//                   <p className="text-3xl font-bold text-violet-600">
//                     {customers.filter(c => {
//                       const date = new Date(c.updatedAt);
//                       const now = new Date();
//                       const diffTime = Math.abs(now.getTime() - date.getTime());
//                       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//                       return diffDays <= 30;
//                     }).length}
//                   </p>
//                 </div>
//                 <div className="rounded-full bg-violet-100 p-3">
//                   <Loader2 className="h-6 w-6 text-violet-500" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
          
//           <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-0 shadow-md hover:shadow-lg transition-shadow">
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 font-medium">With Documents</p>
//                   <p className="text-3xl font-bold text-amber-600">
//                     {customers.filter(c => c.documentName).length}
//                   </p>
//                 </div>
//                 <div className="rounded-full bg-amber-100 p-3">
//                   <File className="h-6 w-6 text-amber-500" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
        
//         {/* Main Customer Table Card */}
//         <Card className="overflow-hidden border-0 shadow-xl">
//           <CardHeader className="bg-gray-50 border-b pb-3">
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//               <div>
//                 <CardTitle>Customer Database</CardTitle>
//                 <CardDescription>Manage all your customers in one place</CardDescription>
//               </div>
              
//               <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     type="text"
//                     placeholder="Search customers..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="pl-9 pr-9 py-2 border-gray-200 focus:ring-blue-500 w-full"
//                   />
//                   {searchQuery && (
//                     <button
//                       onClick={clearSearch}
//                       className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                     >
//                       <X className="h-4 w-4" />
//                     </button>
//                   )}
//                 </div>
                
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="outline" className="w-full sm:w-auto">
//                       <Filter className="h-4 w-4 mr-1" />
//                       {sortBy === 'name' ? 'Sort by Name' : 'Latest Updated'}
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end">
//                     <DropdownMenuItem onClick={() => setSortBy('name')}>
//                       Sort by Name
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={() => setSortBy('recent')}>
//                       Latest Updated
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>
//           </CardHeader>
          
//           <CardContent className="p-0">
//             <div className="relative">
//               {loading ? (
//                 <div className="flex justify-center items-center h-48">
//                   <div className="text-center">
//                     <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
//                     <p className="mt-2 text-sm text-gray-500">Loading customers...</p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="overflow-auto max-h-[calc(100vh-20rem)]">
//                   <Table>
//                     <TableHeader className="sticky top-0 bg-white z-10">
//                       <TableRow className="bg-gray-50">
//                         <TableHead className="w-[250px]">Name</TableHead>
//                         <TableHead className="w-[180px]">Contact</TableHead>
//                         <TableHead className="w-[120px]">Discount</TableHead>
//                         <TableHead>Address</TableHead>
//                         <TableHead className="w-[120px]">Added On</TableHead>
//                         <TableHead className="text-right w-[100px]">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {filteredCustomers.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
//                             <div className="flex flex-col items-center">
//                               <div className="rounded-full bg-gray-100 p-4 mb-3">
//                                 <User className="h-8 w-8 text-gray-400" />
//                               </div>
//                               <p className="text-lg text-gray-500">
//                                 {searchQuery ? 'No customers match your search criteria' : 'No customers found'}
//                               </p>
//                               <p className="text-sm text-gray-400 mt-1">
//                                 {searchQuery ? 'Try adjusting your search terms' : 'Add your first customer to get started'}
//                               </p>
//                               {!searchQuery && (
//                                 <Button 
//                                   onClick={() => setShowAddModal(true)}
//                                   className="mt-4"
//                                   variant="outline"
//                                 >
//                                   <Plus className="h-4 w-4 mr-2" />
//                                   Add Customer
//                                 </Button>
//                               )}
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         filteredCustomers.map((customer) => (
//                           <TableRow 
//                             key={customer.id} 
//                             className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
//                             onClick={() => {
//                               setSelectedCustomer(customer);
//                               setShowEditModal(true);
//                             }}
//                           >
//                             <TableCell>
//                               <div className="flex items-center gap-3">
//                                 <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
//                                   {customer.name.charAt(0).toUpperCase()}
//                                 </div>
//                                 <div>
//                                   <p className="font-medium">{customer.name}</p>
//                                   {customer.documentName && (
//                                     <Badge variant="outline" className="bg-blue-50 text-blue-600 text-xs mt-1">
//                                       Has Document
//                                     </Badge>
//                                   )}
//                                 </div>
//                               </div>
//                             </TableCell>
//                             <TableCell>
//                               <div className="flex flex-col">
//                                 <div className="flex items-center text-sm">
//                                   <Phone className="h-3 w-3 mr-1 text-gray-400" />
//                                   {customer.mobile}
//                                 </div>
//                               </div>
//                             </TableCell>
//                             <TableCell>
//                               <div className="flex items-center">
//                                 <Percent className="h-3 w-3 mr-1 text-gray-400" />
//                                 {customer.discountPercentage !== undefined && customer.discountPercentage !== null ? (
//                                   <span className="text-sm font-medium">
//                                     {customer.discountPercentage}%
//                                   </span>
//                                 ) : (
//                                   <span className="text-gray-400 italic text-xs">None</span>
//                                 )}
//                               </div>
//                             </TableCell>
//                             <TableCell className="max-w-xs truncate">
//                               {customer.address ? (
//                                 <div className="flex items-center text-sm">
//                                   <MapPin className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
//                                   <span className="truncate">{customer.address}</span>
//                                 </div>
//                               ) : (
//                                 <span className="text-gray-400 italic text-sm">No address provided</span>
//                               )}
//                             </TableCell>
//                             <TableCell>
//                               <span className="text-xs text-gray-500">
//                                 {customer.createdAt && typeof customer.createdAt.toDate === 'function' 
//                                   ? customer.createdAt.toDate().toLocaleDateString()
//                                   : new Date(customer.createdAt).toLocaleDateString()}
//                               </span>
//                             </TableCell>
//                             <TableCell className="text-right">
//                               <div 
//                                 className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
//                                 onClick={(e) => e.stopPropagation()}
//                               >
//                                 <Button
//                                   variant="ghost"
//                                   size="icon"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setSelectedCustomer(customer);
//                                     setShowEditModal(true);
//                                   }}
//                                   className="h-8 w-8 text-blue-600"
//                                 >
//                                   <Edit className="h-4 w-4" />
//                                 </Button>
//                                 <Button
//                                   variant="ghost"
//                                   size="icon"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     openDeleteDialog(customer);
//                                   }}
//                                   className="h-8 w-8 text-red-600"
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               </div>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {showAddModal && (
//         <AddCustomerModal
//           onClose={() => setShowAddModal(false)}
//           onSuccess={() => {
//             setShowAddModal(false);
//             loadCustomers();
//           }}
//         />
//       )}

//       {showEditModal && selectedCustomer && (
//         <EditCustomerModal
//           customer={selectedCustomer}
//           onClose={() => {
//             setShowEditModal(false);
//             setSelectedCustomer(null);
//           }}
//           onSuccess={() => {
//             setShowEditModal(false);
//             setSelectedCustomer(null);
//             loadCustomers();
//           }}
//         />
//       )}

//       {showDeleteDialog && selectedCustomer && (
//         <DeleteCustomerDialog
//           isOpen={showDeleteDialog}
//           customer={selectedCustomer}
//           onDelete={handleDelete}
//           onClose={() => {
//             setShowDeleteDialog(false);
//             setSelectedCustomer(null);
//           }}
//         />
//       )}

//       {showImportModal && (
//         <ImportCustomers
//           onClose={() => setShowImportModal(false)}
//           onSuccess={() => {
//             setShowImportModal(false);
//             loadCustomers();
//           }}
//         />
//       )}
//     </DashboardLayout>
//   );
// }

// // Add this component for the File icon
// const File = (props) => {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
//       <polyline points="14 2 14 8 20 8" />
//     </svg>
//   );
// };

'use client';

import { useState, useEffect } from 'react';
import { customerService } from '@/services/customerService';
import { Customer } from '@/types/customer';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Search, X, Loader2, Edit, Trash2, Download, Filter, MoreHorizontal, User, Phone, MapPin, Percent } from 'lucide-react';
import AddCustomerModal from './AddCustomerModal';
import EditCustomerModal from './EditCustomerModal';
import ImportCustomers from './ImportCustomers';
import DeleteCustomerDialog from './DeleteCustomerDialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import ExportCustomers from './ExportCustomers';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent'>('recent');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      
      // Map MongoDB _id to id for compatibility with existing code
      const formattedData = data.map(customer => ({
        ...customer,
        id: customer._id || customer.id, // Use _id from MongoDB but fallback to id for compatibility
      }));
      
      setCustomers(formattedData);
      setFilteredCustomers(formattedData);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(query) || 
        customer.mobile.toLowerCase().includes(query) ||
        (customer.address && customer.address.toLowerCase().includes(query))
      );
      setFilteredCustomers(filtered);
    }

    // Apply sorting
    if (sortBy === 'name') {
      setFilteredCustomers(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
    } else if (sortBy === 'recent') {
      setFilteredCustomers(prev => [...prev].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    }
  }, [searchQuery, customers, sortBy]);

  const handleDelete = async (id: string) => {
    await customerService.delete(id);
    await loadCustomers();
  };

  const openDeleteDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteDialog(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };
  
  // Helper function to format dates consistently
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Unknown date';
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid date';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 h-full px-4 py-6 max-w-7xl mx-auto">
        {/* Header with gradient background */}
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Customer Management</h1>
              <p className="text-blue-100 mt-1">Manage and organize your customer database</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-blue-500 text-white border-blue-400 hover:bg-blue-400">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Customer Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowImportModal(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Import CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExportCustomers customers={customers} />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Customers</p>
                  <p className="text-3xl font-bold text-emerald-600">{customers.length}</p>
                </div>
                <div className="rounded-full bg-emerald-100 p-3">
                  <User className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Recent Activity</p>
                  <p className="text-3xl font-bold text-violet-600">
                    {customers.filter(c => {
                      const date = new Date(c.updatedAt);
                      const now = new Date();
                      const diffTime = Math.abs(now.getTime() - date.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 30;
                    }).length}
                  </p>
                </div>
                <div className="rounded-full bg-violet-100 p-3">
                  <Loader2 className="h-6 w-6 text-violet-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">With Documents</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {customers.filter(c => c.documentName).length}
                  </p>
                </div>
                <div className="rounded-full bg-amber-100 p-3">
                  <File className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Customer Table Card */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="bg-gray-50 border-b pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Customer Database</CardTitle>
                <CardDescription>Manage all your customers in one place</CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 py-2 border-gray-200 focus:ring-blue-500 w-full"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Filter className="h-4 w-4 mr-1" />
                      {sortBy === 'name' ? 'Sort by Name' : 'Latest Updated'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy('name')}>
                      Sort by Name
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('recent')}>
                      Latest Updated
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="relative">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Loading customers...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-auto max-h-[calc(100vh-20rem)]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[250px]">Name</TableHead>
                        <TableHead className="w-[180px]">Contact</TableHead>
                        <TableHead className="w-[120px]">Discount</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead className="w-[120px]">Added On</TableHead>
                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                            <div className="flex flex-col items-center">
                              <div className="rounded-full bg-gray-100 p-4 mb-3">
                                <User className="h-8 w-8 text-gray-400" />
                              </div>
                              <p className="text-lg text-gray-500">
                                {searchQuery ? 'No customers match your search criteria' : 'No customers found'}
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                {searchQuery ? 'Try adjusting your search terms' : 'Add your first customer to get started'}
                              </p>
                              {!searchQuery && (
                                <Button 
                                  onClick={() => setShowAddModal(true)}
                                  className="mt-4"
                                  variant="outline"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Customer
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <TableRow 
                            key={customer.id || customer._id} 
                            className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowEditModal(true);
                            }}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                                  {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium">{customer.name}</p>
                                  {customer.documentName && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-600 text-xs mt-1">
                                      Has Document
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center text-sm">
                                  <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                  {customer.mobile}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Percent className="h-3 w-3 mr-1 text-gray-400" />
                                {customer.discountPercentage !== undefined && customer.discountPercentage !== null ? (
                                  <span className="text-sm font-medium">
                                    {customer.discountPercentage}%
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic text-xs">None</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {customer.address ? (
                                <div className="flex items-center text-sm">
                                  <MapPin className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{customer.address}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic text-sm">No address provided</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-gray-500">
                                {formatDate(customer.createdAt)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div 
                                className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCustomer(customer);
                                    setShowEditModal(true);
                                  }}
                                  className="h-8 w-8 text-blue-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteDialog(customer);
                                  }}
                                  className="h-8 w-8 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadCustomers();
          }}
        />
      )}

      {showEditModal && selectedCustomer && (
        <EditCustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCustomer(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedCustomer(null);
            loadCustomers();
          }}
        />
      )}

      {showDeleteDialog && selectedCustomer && (
        <DeleteCustomerDialog
          isOpen={showDeleteDialog}
          customer={selectedCustomer}
          onDelete={handleDelete}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {showImportModal && (
        <ImportCustomers
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            loadCustomers();
          }}
        />
      )}
    </DashboardLayout>
  );
}

// Add this component for the File icon
const File = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
};