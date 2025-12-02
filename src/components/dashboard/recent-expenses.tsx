"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import type {Expense, Category} from '@/lib/types';
import {
  Utensils,
  BusFront,
  Home,
  ShoppingCart,
  HeartPulse,
  Film,
} from 'lucide-react';
import React from 'react';
import {useSettings} from '@/context/settings-provider';
import {formatCurrency} from '@/lib/utils';

const icons: {[key: string]: React.ElementType} = {
  Utensils,
  BusFront,
  Home,
  ShoppingCart,
  HeartPulse,
  Film,
};

interface RecentExpensesProps {
  expenses: Expense[];
  categories: Category[];
}

export function RecentExpenses({expenses, categories}: RecentExpensesProps) {
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const {currency, t} = useSettings();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('recentExpenses')}</CardTitle>
        <CardDescription>{t('last5Transactions')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('description')}</TableHead>
              <TableHead>{t('category')}</TableHead>
              <TableHead className="text-right">{t('amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.slice(0, 5).map(expense => {
              const category = categoryMap.get(expense.categoryId);
              const Icon = category
                ? icons[category.icon as keyof typeof icons]
                : null;
              return (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-muted-foreground md:hidden">
                      {formatDate(expense.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {category && (
                      <Badge
                        variant="outline"
                        className="flex w-fit items-center gap-2"
                      >
                        {Icon && <Icon className="h-3 w-3" />}
                        {t(category.name.toLowerCase())}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(expense.amount, currency)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
