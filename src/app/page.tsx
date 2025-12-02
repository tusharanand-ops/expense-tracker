'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {
  useUser,
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import type {Category, Expense, Budget} from '@/lib/types';
import {collection, doc, setDoc} from 'firebase/firestore';
import {Overview} from '@/components/dashboard/overview';
import {SpendingChart} from '@/components/dashboard/spending-chart';
import {RecentExpenses} from '@/components/dashboard/recent-expenses';
import {BudgetGoals} from '@/components/dashboard/budget-goals';
import {AddExpense} from '@/components/dashboard/add-expense';
import {AIBudgetPlanner} from '@/components/dashboard/ai-budget-planner';
import {PiggyBank, LogOut} from 'lucide-react';
import {SettingsDialog} from '@/components/dashboard/settings-dialog';
import {SettingsProvider} from '@/context/settings-provider';
import {Button} from '@/components/ui/button';
import {getAuth, signOut} from 'firebase/auth';

export default function Home() {
  const {user, isUserLoading} = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const expensesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'expenses') : null),
    [firestore, user]
  );
  const {data: expenses, isLoading: expensesLoading} =
    useCollection<Expense>(expensesQuery);

  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'categories') : null),
    [firestore, user]
  );
  const {data: categories, isLoading: categoriesLoading} =
    useCollection<Category>(categoriesQuery);

  const budgetsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'budgets') : null),
    [firestore, user]
  );
  const {data: budgets, isLoading: budgetsLoading} =
    useCollection<Budget>(budgetsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  if (isUserLoading || !user || !expenses || !categories || !budgets) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);

  const spendingByCategory = categories.map(category => {
    const categoryExpenses = expenses.filter(e => e.categoryId === category.id);
    const spent = categoryExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    return {
      name: category.name,
      spent,
    };
  });

  const categoriesWithDetails = categories.map(category => {
    const categoryExpenses = expenses.filter(e => e.categoryId === category.id);
    const spent = categoryExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const budget = budgets.find(b => b.categoryId === category.id)?.amount || 0;
    return {
      ...category,
      spent,
      budget,
    };
  });

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <SettingsProvider>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-8">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Spend Wise</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <AddExpense categories={categories} />
            <SettingsDialog />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
          <Overview totalExpenses={totalExpenses} totalBudget={totalBudget} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <SpendingChart data={spendingByCategory} />
            </div>
            <div className="lg:col-span-3">
              <RecentExpenses expenses={sortedExpenses} categories={categories} />
            </div>
          </div>
          <AIBudgetPlanner categories={categories} />
          <BudgetGoals categoriesWithDetails={categoriesWithDetails} />
        </main>
      </div>
    </SettingsProvider>
  );
}
