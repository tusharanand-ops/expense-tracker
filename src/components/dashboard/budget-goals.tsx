"use client";

import * as React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Progress} from '@/components/ui/progress';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {
  Sparkles,
  Lightbulb,
  Loader2,
  Utensils,
  BusFront,
  Home,
  ShoppingCart,
  HeartPulse,
  Film,
  Pencil,
} from 'lucide-react';
import type {CategoryWithDetails} from '@/lib/types';
import {
  getAIBudgetSuggestions,
  type AIBudgetSuggestionsOutput,
} from '@/ai/flows/ai-budget-suggestions';
import {useSettings} from '@/context/settings-provider';
import {formatCurrency} from '@/lib/utils';
import {useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError} from '@/firebase';
import {doc, writeBatch, collection} from 'firebase/firestore';
import {useToast} from '@/hooks/use-toast';
import type {Budget} from '@/lib/types';

const icons: {[key: string]: React.ElementType} = {
  Utensils,
  BusFront,
  Home,
  ShoppingCart,
  HeartPulse,
  Film,
};

interface BudgetGoalsProps {
  categoriesWithDetails: CategoryWithDetails[];
}

export function BudgetGoals({categoriesWithDetails}: BudgetGoalsProps) {
  const [suggestions, setSuggestions] =
    React.useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedBudgets, setEditedBudgets] = React.useState<Record<string, string>>({});
  const {currency, t} = useSettings();
  const firestore = useFirestore();
  const {user} = useUser();
  const {toast} = useToast();

  const budgetsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'budgets') : null),
    [firestore, user]
  );
  const {data: budgets} = useCollection<Budget>(budgetsQuery);

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    const categories = categoriesWithDetails.map(category => ({
      name: category.name,
      spent: category.spent,
      budget: category.budget,
    }));

    try {
      const result = await getAIBudgetSuggestions({categories});
      const formattedSuggestions = result.suggestions.reduce(
        (acc, item) => {
          acc[item.categoryName] = item.suggestion;
          return acc;
        },
        {} as Record<string, string>
      );
      setSuggestions(formattedSuggestions);
    } catch (e) {
      setError('Failed to get AI suggestions. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      setEditedBudgets({});
    } else {
      const initialBudgets = categoriesWithDetails.reduce((acc, category) => {
        acc[category.id] = category.budget.toString();
        return acc;
      }, {} as Record<string, string>);
      setEditedBudgets(initialBudgets);
    }
    setIsEditing(!isEditing);
  };
  
  const handleBudgetChange = (categoryId: string, value: string) => {
    setEditedBudgets(prev => ({...prev, [categoryId]: value}));
  };

  const handleSaveChanges = async () => {
    if (!user || !budgets) return;
    setIsLoading(true);
    const batch = writeBatch(firestore);

    const categoryToBudgetMap = new Map(budgets.map(b => [b.categoryId, b]));

    categoriesWithDetails.forEach(category => {
      const budgetDoc = categoryToBudgetMap.get(category.id);
      if (!budgetDoc) return;

      const newAmount = parseFloat(editedBudgets[category.id]);
      if (!isNaN(newAmount) && newAmount !== category.budget) {
        const budgetDocRef = doc(firestore, 'users', user.uid, 'budgets', budgetDoc.id);
        batch.update(budgetDocRef, {amount: newAmount});
      }
    });

    try {
      await batch.commit();
      toast({title: 'Success', description: 'Budgets updated successfully!'});
      setIsEditing(false);
    } catch (error) {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `/users/${user.uid}/budgets`,
        operation: 'write',
        requestResourceData: editedBudgets
       }));
       toast({variant: 'destructive', title: 'Error', description: 'Failed to update budgets.'});
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>{t('budgetGoals')}</CardTitle>
            <CardDescription>{t('monthlyBudgetStatus')}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleEditToggle} variant="outline" size="sm" disabled={isLoading}>
              <Pencil className="mr-2 h-4 w-4" />
              {isEditing ? t('cancel') : 'Edit Budgets'}
            </Button>
            <Button onClick={handleGetSuggestions} disabled={isLoading || isEditing} size="sm">
              {isLoading && !isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('generating')}...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('getAISuggestions')}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {categoriesWithDetails.map(category => {
          const percentage =
            category.budget > 0 ? (category.spent / category.budget) * 100 : 0;
          const Icon = icons[category.icon as keyof typeof icons];
          return (
            <div key={category.id}>
              <div className="mb-1 flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm font-medium">
                  {Icon && <Icon className="h-4 w-4" />}
                  {t(category.name.toLowerCase())}
                </span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                     <span className="text-sm text-muted-foreground">{formatCurrency(category.spent, currency, 0)} / </span>
                    <Input
                      type="number"
                      value={editedBudgets[category.id] || ''}
                      onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                      className="h-8 w-24"
                      placeholder="Budget"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(category.spent, currency, 0)} /{' '}
                    {formatCurrency(category.budget, currency, 0)}
                  </span>
                )}
              </div>
              <Progress
                value={percentage > 100 ? 100 : percentage}
                aria-label={`${category.name} budget progress`}
              />
              {suggestions && suggestions[category.name] && !isEditing && (
                <Alert className="mt-2 border-accent bg-accent/20">
                  <Lightbulb className="h-4 w-4 text-accent-foreground" />
                  <AlertTitle className="text-accent-foreground">
                    {t('suggestion')}
                  </AlertTitle>
                  <AlertDescription>
                    {suggestions[category.name]}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          );
        })}

        {isEditing && (
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
