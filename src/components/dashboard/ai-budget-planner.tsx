"use client";

import * as React from 'react';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Sparkles, Loader2} from 'lucide-react';
import type {Category} from '@/lib/types';
import {
  generateBudgetPlan,
  type GenerateBudgetPlanOutput,
} from '@/ai/flows/generate-budget-plan';
import {useSettings} from '@/context/settings-provider';
import {formatCurrency} from '@/lib/utils';

interface AIBudgetPlannerProps {
  categories: Category[];
}

const budgetPlannerSchema = z.object({
  totalBudget: z.coerce
    .number()
    .positive('Please enter a budget greater than 0.'),
});

type BudgetPlannerFormValues = z.infer<typeof budgetPlannerSchema>;

export function AIBudgetPlanner({categories}: AIBudgetPlannerProps) {
  const [plan, setPlan] = React.useState<GenerateBudgetPlanOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const {currency, t} = useSettings();

  const form = useForm<BudgetPlannerFormValues>({
    resolver: zodResolver(budgetPlannerSchema),
    defaultValues: {
      totalBudget: undefined,
    },
  });

  const onSubmit = async (data: BudgetPlannerFormValues) => {
    setIsLoading(true);
    setError(null);
    setPlan(null);

    try {
      const result = await generateBudgetPlan({
        totalBudget: data.totalBudget,
        categories: categories.map(c => ({name: t(c.name.toLowerCase())})),
      });
      setPlan(result);
    } catch (e) {
      setError('Failed to generate budget plan. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('aiBudgetPlanner')}</CardTitle>
        <CardDescription>
          {t('enterTotalBudgetSuggestion')}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="totalBudget"
              render={({field}) => (
                <FormItem>
                  <FormLabel>{t('totalMonthlyBudget')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 3000"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('generatingPlan')}...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('generatePlan')}
                </>
              )}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {plan && (
              <div className="w-full">
                <h3 className="mb-2 text-lg font-semibold">
                  {t('suggestedBudgetPlan')}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('category')}</TableHead>
                      <TableHead className="text-right">
                        {t('suggestedBudget')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plan.plan.map(item => (
                      <TableRow key={item.categoryName}>
                        <TableCell>{item.categoryName}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.amount, currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
