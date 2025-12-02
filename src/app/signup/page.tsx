'use client';

import {AuthForm} from '@/components/auth/auth-form';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md p-8">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
