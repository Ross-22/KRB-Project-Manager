import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { getSession } from '@/lib/session';
import { Button } from './ui/button';
import { logout } from '@/lib/auth';

export async function Navbar() {
  const session = await getSession();

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto max-w-7xl px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg tracking-tight">
           KRB Project Manager
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {session.username}
              </span>
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit" className="text-sm">
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
