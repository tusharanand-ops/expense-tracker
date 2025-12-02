'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import {Eye, EyeOff} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {useToast} from '@/hooks/use-toast';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {useFirestore, errorEmitter, FirestorePermissionError} from '@/firebase';
import {doc, setDoc, writeBatch, collection} from 'firebase/firestore';
import {categories, budgets} from '@/lib/data';

const formSchema = z.object({
  email: z.string().email({message: 'Please enter a valid email.'}),
  password: z
    .string()
    .min(6, {message: 'Password must be at least 6 characters.'}),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({mode}: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {toast} = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const seedInitialData = (userId: string) => {
    const batch = writeBatch(firestore);

    const userDocRef = doc(firestore, 'users', userId);
    batch.set(userDocRef, {
      id: userId,
      username: form.getValues('email').split('@')[0],
      email: form.getValues('email'),
    });

    categories.forEach(category => {
      const categoryRef = doc(
        collection(firestore, 'users', userId, 'categories')
      );
      batch.set(categoryRef, {
        ...category,
        id: categoryRef.id,
        userId: userId,
      });

      const budgetData = budgets.find(
        b => b.categoryId === category.name.toLowerCase()
      );
      if (budgetData) {
        const budgetRef = doc(
          collection(firestore, 'users', userId, 'budgets')
        );
        batch.set(budgetRef, {
          ...budgetData,
          id: budgetRef.id,
          userId: userId,
          categoryId: categoryRef.id,
        });
      }
    });

    batch.commit().catch(error => {
      const permissionError = new FirestorePermissionError({
        path: `/users/${userId}`,
        operation: 'write',
        requestResourceData: {
          note: 'Batch write for initial user data.',
        },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const auth = getAuth();
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        seedInitialData(userCredential.user.uid);
        toast({
          title: 'Account created!',
          description: 'You have been successfully signed up.',
        });
        router.push('/');
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({
          title: 'Logged in!',
          description: 'You have been successfully logged in.',
        });
        router.push('/');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            description = 'This email is already in use. Please log in.';
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = 'Invalid email or password. Please try again.';
            break;
          case 'auth/invalid-email':
            description = 'Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            description = 'The password must be at least 6 characters long.';
            break;
          default:
            description = error.message;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === 'login' ? 'Welcome' : 'Create an Account'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to {mode === 'login' ? 'access' : 'create'} your
          account
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({field}) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...field}
                      className="pr-10"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && '...'}
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </Button>
        </form>
      </Form>
      <p className="px-8 text-center text-sm text-muted-foreground">
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Login
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
