"use client";

import * as React from 'react';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {format} from 'date-fns';
import {doc} from 'firebase/firestore';
import {
  useFirestore,
  useUser,
  addDocumentNonBlocking,
} from '@/firebase';

import {Button} from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {Calendar} from '@/components/ui/calendar';
import {useToast} from '@/hooks/use-toast';
import {cn, formatCurrency} from '@/lib/utils';
import type {Category} from '@/lib/types';
import {
  PlusCircle,
  CalendarIcon,
  Loader2,
  Utensils,
  BusFront,
  Home,
  ShoppingCart,
  HeartPulse,
  Film,
} from 'lucide-react';
import {useSettings} from '@/context/settings-provider';
import {collection} from 'firebase/firestore';

const icons: {[key: string]: React.ElementType} = {
  Utensils,
  BusFront,
  Home,
  ShoppingCart,
  HeartPulse,
  Film,
};

const expenseSchema = z.object({
  description: z
    .string()
    .min(2, 'Description must be at least 2 characters.')
    .max(100),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
  categoryId: z.string().min(1, 'Please select a category.'),
  date: z.date(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseProps {
  categories: Category[];
}

export function AddExpense({categories}: AddExpenseProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const {toast} = useToast();
  const {t} = useSettings();
  const firestore = useFirestore();
  const {user} = useUser();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: undefined,
      categoryId: '',
      date: new Date(),
    },
  });

  async function onSubmit(data: ExpenseFormValues) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'You must be logged in to add an expense.',
      });
      return;
    }

    setIsSubmitting(true);
    const expenseData = {
      ...data,
      date: data.date.toISOString(),
      userId: user.uid,
    };

    const expensesRef = collection(firestore, 'users', user.uid, 'expenses');
    await addDocumentNonBlocking(expensesRef, expenseData);

    setIsSubmitting(false);
    toast({
      title: t('success'),
      description: 'Expense added successfully!',
    });
    setOpen(false);
    form.reset();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('addExpense')}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('addNewExpense')}</SheetTitle>
          <SheetDescription>{t('enterTransactionDetails')}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({field}) => (
                <FormItem>
                  <FormLabel>{t('description')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('egCoffeeWithFriend')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({field}) => (
                <FormItem>
                  <FormLabel>{t('amount')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({field}) => (
                <FormItem>
                  <FormLabel>{t('category')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectACategory')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => {
                        const Icon = icons[category.icon];
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              {Icon && <Icon className="h-4 w-4" />}
                              {t(category.name.toLowerCase())}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({field}) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('date')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>{t('pickADate')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  {t('cancel')}
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('addExpense')}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
