'use client';

import { useState } from 'react';
import { customerService } from '@/services/customerService';
import { Customer } from '@/types/customer';
import { X, User, Phone, MapPin, Loader2, CheckCircle, ClipboardEdit, Percent } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';

interface EditCustomerModalProps {
  customer: Customer;
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  mobile: string;
  address: string;
  discountPercentage: string; // Added discount percentage field
};

export default function EditCustomerModal({ customer, onClose, onSuccess }: EditCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      name: customer.name,
      mobile: customer.mobile,
      address: customer.address || '',
      discountPercentage: customer.discountPercentage !== undefined && customer.discountPercentage !== null 
        ? String(customer.discountPercentage) 
        : '',
    },
  });

  const onSubmit = async (data: FormData) => {
    // Change from:
    if (!customer.id) return;
    
    // To:
    if (!customer.id && !customer._id) return;
    
    try {
      setIsSubmitting(true);
      
      const customerId = customer.id || customer._id;
      
      // Convert discountPercentage from string to number or null
      const customerData = {
        ...data,
        discountPercentage: data.discountPercentage === '' ? null : parseFloat(data.discountPercentage)
      };
      
      await customerService.update(customerId, customerData);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const formatDate = (date: any) => {
  //   try {
  //     if (date && typeof date.toDate === 'function') {
  //       // Handle Firestore Timestamp
  //       return date.toDate().toLocaleDateString('en-US', {
  //         year: 'numeric',
  //         month: 'short',
  //         day: 'numeric'
  //       });
  //     } else {
  //       // Handle regular Date object or date string
  //       return new Date(date).toLocaleDateString('en-US', {
  //         year: 'numeric',
  //         month: 'short',
  //         day: 'numeric'
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error formatting date:', error);
  //     return 'Unknown date';
  //   }
  // };

  const formatDate = (date: any) => {
    try {
      if (!date) return 'Unknown date';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl overflow-hidden p-0">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-6 px-6">
          <DialogHeader className="text-left">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white text-xl">Edit Customer</DialogTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-indigo-200 mt-1">
              Update customer information below.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {submitted ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Changes Saved Successfully!</h3>
            <p className="text-gray-500 mt-1">Customer information has been updated.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 px-6 pt-6 pb-2">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{customer.name}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500 flex items-center">
                    <ClipboardEdit className="h-3 w-3 mr-1" />
                    Customer since {formatDate(customer.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="px-6">
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    Customer Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter customer name"
                    {...register('name', { required: 'Name is required' })}
                    className={`rounded-lg ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <span className="bg-red-50 p-1 rounded-full mr-1">
                        <X className="h-3 w-3" />
                      </span>
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mobile" className="text-sm font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    Mobile Number <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter mobile number"
                    {...register('mobile', { 
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[0-9+\s-]{7,15}$/,
                        message: 'Please enter a valid mobile number'
                      }
                    })}
                    className={`rounded-lg ${errors.mobile ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`}
                  />
                  {errors.mobile && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <span className="bg-red-50 p-1 rounded-full mr-1">
                        <X className="h-3 w-3" />
                      </span>
                      {errors.mobile.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address" className="text-sm font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Enter customer address (optional)"
                    rows={3}
                    className="rounded-lg resize-none border-gray-200 focus:ring-blue-500"
                    {...register('address')}
                  />
                </div>
                
                {/* Added discount percentage field */}
                <div className="grid gap-2">
                  <Label htmlFor="discountPercentage" className="text-sm font-medium flex items-center">
                    <Percent className="h-4 w-4 mr-2 text-gray-400" />
                    Discount Percentage
                  </Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Enter discount percentage (optional)"
                    {...register('discountPercentage', {
                      min: { value: 0, message: 'Discount cannot be negative' },
                      max: { value: 100, message: 'Discount cannot exceed 100%' },
                      validate: value => !value || !isNaN(parseFloat(value)) || 'Please enter a valid number'
                    })}
                    className={`rounded-lg ${errors.discountPercentage ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`}
                  />
                  {errors.discountPercentage && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <span className="bg-red-50 p-1 rounded-full mr-1">
                        <X className="h-3 w-3" />
                      </span>
                      {errors.discountPercentage.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    If applicable, enter the discount percentage this customer should receive on purchases. Leave empty for no discount.
                  </p>
                </div>
              </div>
              <DialogFooter className="px-0 pb-6 mt-2">
                <div className="flex gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg border-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !isDirty}
                    className={`flex-1 rounded-lg ${!isDirty ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}