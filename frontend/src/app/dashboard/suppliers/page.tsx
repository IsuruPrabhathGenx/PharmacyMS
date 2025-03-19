'use client';

import { useState, useEffect } from 'react';
import { supplierService } from '@/services/supplierService';
import { Supplier } from '@/types/supplier';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Search, 
  PhoneCall, 
  Mail, 
  User, 
  MapPin, 
  FileText, 
  Building2, 
  RefreshCw,
  Briefcase, 
  LayoutGrid, 
  LayoutList,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import AddSupplierModal from './AddSupplierModal';
import EditSupplierModal from './EditSupplierModal';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filterAndSortSuppliers = () => {
    const query = searchQuery.toLowerCase();
    let filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(query) ||
      supplier.phone.toLowerCase().includes(query) ||
      supplier.email?.toLowerCase().includes(query) ||
      supplier.contactPerson?.toLowerCase().includes(query)
    );
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.status === statusFilter);
    }
    
    // Sort suppliers
    const sorted = [...filtered].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'updatedAt':
          // valueA = a.updatedAt?.getTime() || 0;
          // valueB = b.updatedAt?.getTime() || 0;

          valueA = new Date(a.updatedAt).getTime() || 0;
          valueB = new Date(b.updatedAt).getTime() || 0;

          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredSuppliers(sorted);
  };

  // const loadSuppliers = async (showRefreshAnimation = false) => {
  //   try {
  //     if (!loading) setRefreshing(showRefreshAnimation);
  //     setLoading(true);
  //     const data = await supplierService.getAll();
  //     setSuppliers(data);
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  const loadSuppliers = async (showRefreshAnimation = false) => {
    try {
      if (!loading) setRefreshing(showRefreshAnimation);
      setLoading(true);
      
      const data = await supplierService.getAll();
      // The supplierService.getAll() now handles mapping _id to id for compatibility
      setSuppliers(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    filterAndSortSuppliers();
  }, [searchQuery, statusFilter, sortField, sortDirection, suppliers]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // const handleDeleteConfirm = async () => {
  //   if (selectedSupplier?.id) {
  //     await supplierService.delete(selectedSupplier.id);
  //     await loadSuppliers();
  //   }
  // };


  const handleDeleteConfirm = async () => {
    if (selectedSupplier) {
      const supplierId = selectedSupplier.id || selectedSupplier._id;
      if (supplierId) {
        await supplierService.delete(supplierId);
        await loadSuppliers();
      }
    }
  };


  const generateInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-violet-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-indigo-500',
      'bg-cyan-500',
      'bg-fuchsia-500',
      'bg-teal-500',
    ];
    
    // Simple hash to get a consistent color for a supplier name
    const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const renderTableView = () => (
    <Card className="flex-1 overflow-hidden border bg-white rounded-xl shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Supplier Directory</CardTitle>
            <CardDescription>
              Showing {filteredSuppliers.length} of {suppliers.length} suppliers
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-slate-200"
                  onClick={() => loadSuppliers(true)}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh suppliers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden border-t border-slate-200">
          <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100" style={{ maxHeight: "calc(100vh - 320px)", height: "500px" }}>
            <div className="overflow-x-auto" style={{ minWidth: "100%" }}>
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr>
                    <th 
                      className="py-3 px-4 text-left font-medium text-slate-700 cursor-pointer hover:bg-slate-100 whitespace-nowrap border-b border-slate-200" 
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        {sortField === 'name' && (
                          <ArrowUpDown className={`ml-1 h-3.5 w-3.5 text-slate-500 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-slate-700 whitespace-nowrap border-b border-slate-200">Phone</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-700 whitespace-nowrap border-b border-slate-200">Email</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-700 whitespace-nowrap border-b border-slate-200">Contact Person</th>
                    <th 
                      className="py-3 px-4 text-left font-medium text-slate-700 cursor-pointer hover:bg-slate-100 whitespace-nowrap border-b border-slate-200" 
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortField === 'status' && (
                          <ArrowUpDown className={`ml-1 h-3.5 w-3.5 text-slate-500 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right font-medium text-slate-700 whitespace-nowrap border-b border-slate-200 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-slate-50 group">
                      <td className="py-3 px-4 font-medium whitespace-nowrap border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <Avatar className={`h-8 w-8 ${getRandomColor(supplier.name)}`}>
                            <AvatarFallback className="text-white text-xs font-medium">
                              {generateInitials(supplier.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{supplier.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap border-b border-slate-100">
                        <div className="flex items-center gap-1">
                          <PhoneCall className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-slate-700">{supplier.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[200px] border-b border-slate-100">
                        {supplier.email ? (
                          <div className="flex items-center gap-1 overflow-hidden">
                            <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-slate-700 truncate">{supplier.email}</span>
                          </div>
                        ) : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap border-b border-slate-100">
                        {supplier.contactPerson ? (
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-slate-700">{supplier.contactPerson}</span>
                          </div>
                        ) : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap border-b border-slate-100">
                        <Badge 
                          variant="outline"
                          className={`
                            ${supplier.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}
                          `}
                        >
                          {supplier.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap border-b border-slate-100">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-full h-8 w-8"
                                  onClick={() => {
                                    setSelectedSupplier(supplier);
                                    setShowEditModal(true);
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit supplier</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-full h-8 w-8"
                                  onClick={() => {
                                    setSelectedSupplier(supplier);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete supplier</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSuppliers.map((supplier) => (
        <Card 
          key={supplier.id} 
          className="overflow-hidden border bg-white hover:shadow-md transition-all duration-200 group"
        >
          <div className={`h-1.5 ${supplier.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
          <CardHeader className="p-6 pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className={`h-12 w-12 ${getRandomColor(supplier.name)}`}>
                  <AvatarFallback className="text-white font-medium">
                    {generateInitials(supplier.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-semibold">{supplier.name}</CardTitle>
                  {supplier.contactPerson && (
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {supplier.contactPerson}
                    </CardDescription>
                  )}
                </div>
              </div>
              <Badge 
                variant="outline"
                className={`
                  ${supplier.status === 'active' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-slate-50 text-slate-700 border-slate-200'}
                `}
              >
                {supplier.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-2 space-y-3">
            <div className="text-sm flex items-center gap-2 text-slate-700">
              <PhoneCall className="h-4 w-4 text-slate-400" />
              <span>{supplier.phone}</span>
            </div>
            {supplier.email && (
              <div className="text-sm flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="truncate">{supplier.email}</span>
              </div>
            )}
            {supplier.address && (
              <div className="text-sm flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <span className="text-slate-600 line-clamp-2">{supplier.address}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 flex justify-end gap-2 border-t bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
              onClick={() => {
                setSelectedSupplier(supplier);
                setShowEditModal(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
              onClick={() => {
                setSelectedSupplier(supplier);
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <Card className="flex-1 border-dashed border-2 bg-slate-50">
      <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
        <div className="bg-blue-100 p-4 rounded-full mb-4">
          <Building2 className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-medium text-slate-800">No suppliers found</h3>
        <p className="text-slate-500 mt-2">Try adjusting your search or filter criteria</p>
        <Button 
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('all');
          }}
          variant="link" 
          className="mt-2 text-blue-600"
        >
          Clear filters
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-6">
        {/* Header with modern gradient background */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Briefcase className="h-8 w-8" />
                Supplier Management
              </h1>
              <p className="text-indigo-100 mt-2 text-lg max-w-xl">
                Organize your business partners and keep track of all supplier details in one place
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-indigo-600 hover:bg-indigo-50 gap-2 font-medium shadow-md rounded-full px-5 transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Add New Supplier
            </Button>
          </div>
        </div>

        {/* Search and filter controls */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            <div className="relative col-span-3">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="Search by name, email, phone or contact person..."
                className="pl-10 bg-white border-slate-200 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="col-span-2">
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="bg-white border-slate-200 w-full">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2 md:col-span-2 flex justify-between md:justify-end gap-2 items-center">
              <div className="bg-slate-100 rounded-lg p-1 flex">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={viewMode === 'table' ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => setViewMode('table')}
                        className={`rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`}
                      >
                        <LayoutList className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Table view</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={viewMode === 'cards' ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => setViewMode('cards')}
                        className={`rounded-md ${viewMode === 'cards' ? 'bg-white shadow-sm' : ''}`}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Card view</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-slate-200">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setSortField('name'); setSortDirection('asc'); }}>
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField('name'); setSortDirection('desc'); }}>
                    Name (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField('status'); setSortDirection('asc'); }}>
                    Status (Active first)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField('updatedAt'); setSortDirection('desc'); }}>
                    Recently Updated
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
              <p className="mt-4 text-slate-600">Loading suppliers...</p>
            </div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          renderEmptyState()
        ) : (
          viewMode === 'table' ? renderTableView() : renderCardView()
        )}
      </div>

      {/* Add Supplier Modal */}
      <AddSupplierModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => {
          setShowAddModal(false);
          loadSuppliers();
        }}
      />

      {/* Edit Supplier Modal */}
      {selectedSupplier && (
        <EditSupplierModal
          supplier={selectedSupplier}
          open={showEditModal}
          onOpenChange={(open) => {
            setShowEditModal(open);
            if (!open) setSelectedSupplier(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedSupplier(null);
            loadSuppliers();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        description={`Are you sure you want to delete ${selectedSupplier?.name}? This action cannot be undone.`}
      />
    </DashboardLayout>
  );
}