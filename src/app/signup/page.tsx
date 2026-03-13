'use client';

import { useActionState } from 'react';
import { signup } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, null);

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-sm border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">Create an account</CardTitle>
          <CardDescription>Enter a username and password below to create your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" name="password" required className="bg-background/50" />
            </div>
            {state?.error && (
              <div className="text-sm text-destructive font-medium">{state.error}</div>
            )}
            <Button type="submit" className="w-full">
              Sign up
            </Button>
            <div className="text-center text-sm mt-4">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
