// src/components/expenses/ExpenseModal.tsx

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Expense, ExpenseCategory } from '@/types/expense';
import { expenseService } from '@/services/expenseService';
import { useToast } from '@/hooks/use-toast';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense;
  onSuccess: () => void;
}

export default function ExpenseModal({ isOpen, onClose, expense, onSuccess }: ExpenseModalProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    details: ''
  });

  useEffect(() => {
    loadCategories();
    if (expense) {
      // Convert date string to Date object if needed
      const expenseDate = expense.date instanceof Date 
        ? expense.date 
        : new Date(expense.date);
      
      setDate(expenseDate);
      setFormData({
        categoryId: expense.categoryId,
        amount: expense.amount.toString(),
        details: expense.details || ''
      });
    } else {
      setDate(new Date());
      setFormData({
        categoryId: '',
        amount: '',
        details: ''
      });
    }
  }, [expense, isOpen]);

  const loadCategories = async () => {
    try {
      const data = await expenseService.getAllCategories();
      setCategories(data);
      
      // If there are categories but no categoryId selected yet, select the first one
      if (data.length > 0 && !expense && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: data[0].id || data[0]._id || '' }));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading categories",
        description: "There was a problem loading expense categories.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      toast({
        variant: "destructive",
        title: "Missing category",
        description: "Please select a category for this expense.",
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero.",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get category name for the selected category
      const selectedCategory = categories.find(c => 
        c.id === formData.categoryId || c._id === formData.categoryId
      );
      
      if (!selectedCategory) {
        toast({
          variant: "destructive",
          title: "Invalid category",
          description: "The selected category does not exist.",
        });
        return;
      }

      const expenseData = {
        date: date,
        categoryId: formData.categoryId,
        categoryName: selectedCategory.name,
        amount: parseFloat(formData.amount),
        details: formData.details
      };

      if (expense?.id || expense?._id) {
        const expenseId = expense.id || expense._id;
        await expenseService.updateExpense(expenseId as string, expenseData);
        toast({
          title: "Expense updated",
          description: "Your expense has been updated successfully.",
        });
      } else {
        await expenseService.createExpense(expenseData);
        toast({
          title: "Expense added",
          description: "Your expense has been added successfully.",
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving expense",
        description: error.message || "There was a problem saving your expense.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
          <DialogDescription>
            {expense 
              ? 'Update the details of your expense.' 
              : 'Fill in the details to add a new expense.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expense-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="expense-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-category">Category</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger id="expense-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      No categories available
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id || category._id} value={category.id || category._id || ''}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  Rs
                </span>
                <Input
                  id="expense-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-details">Details</Label>
              <Textarea
                id="expense-details"
                placeholder="Enter additional details about this expense"
                className="min-h-[100px]"
                value={formData.details}
                onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {expense ? 'Update' : 'Add'} Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}