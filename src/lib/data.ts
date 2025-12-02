import type {Category, Expense, Budget} from './types';

// NOTE: This is mock data. In a real application, this would come from a database.
// This data is now used to seed a new user's account.

export const categories: Omit<Category, 'id' | 'userId'>[] = [
  {name: 'Food', icon: 'Utensils'},
  {
    name: 'Transportation',
    icon: 'BusFront',
  },
  {name: 'Housing', icon: 'Home'},
  {name: 'Shopping', icon: 'ShoppingCart'},
  {name: 'Health', icon: 'HeartPulse'},
  {
    name: 'Entertainment',
    icon: 'Film',
  },
];

export const budgets: Omit<Budget, 'id' | 'userId' | 'startDate' | 'endDate'>[] = [
  {categoryId: 'food', amount: 500},
  {categoryId: 'transportation', amount: 100},
  {categoryId: 'housing', amount: 1200},
  {categoryId: 'shopping', amount: 250},
  {categoryId: 'health', amount: 100},
  {categoryId: 'entertainment', amount: 80},
];
