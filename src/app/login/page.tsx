'use client';

import { useActionState } from 'react';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null);

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-sm border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">Login</CardTitle>
          <CardDescription>Enter your username and password to login to your account.</CardDescription>
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
              Login
            </Button>
            <div className="text-center text-sm mt-4">
              Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
