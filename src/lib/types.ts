import type {LucideIcon} from 'lucide-react';

export type Category = {
  id: string;
  userId: string;
  name: string;
  icon: string;
};

export type Expense = {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  date: string;
  description: string;
};

export type Budget = {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  startDate?: string;
  endDate?: string;
};

export type CategorySpending = {
  name: string;
  spent: number;
};

export type CategoryWithDetails = Category & {
  spent: number;
  budget: number;
};
