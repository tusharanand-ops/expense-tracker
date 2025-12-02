"use client";

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {DollarSign, Banknote, Wallet} from 'lucide-react';
import {useSettings} from '@/context/settings-provider';
import {formatCurrency} from '@/lib/utils';

interface OverviewProps {
  totalExpenses: number;
  totalBudget: number;
}

export function Overview({totalExpenses, totalBudget}: OverviewProps) {
  const {currency, t} = useSettings();
  const remainingBudget = totalBudget - totalExpenses;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('totalSpent')}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalExpenses, currency)}
          </div>
          <p className="text-xs text-muted-foreground">{t('inTheCurrentMonth')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('totalBudget')}</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalBudget, currency)}
          </div>
          <p className="text-xs text-muted-foreground">{t('forThisMonth')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('remainingBudget')}</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-destructive' : ''}`}
          >
            {formatCurrency(remainingBudget, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            {remainingBudget < 0
              ? t('youAreOverBudget')
              : t('remainingForThisMonth')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
