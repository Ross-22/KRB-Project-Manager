import { NextRequest, NextResponse } from 'next/server';
import { updateSession, decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

const protectedRoutes = ['/'];
const publicRoutes = ['/login', '/signup'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get('session')?.value;
  const session = await decrypt(sessionValue);

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (
    isPublicRoute &&
    session?.userId &&
    !req.nextUrl.pathname.startsWith('/')
  ) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // Handle root redirect correctly if logging in / trying to go to login while logged in
  if (isPublicRoute && session?.userId) {
     return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return await updateSession().then(() => NextResponse.next()).catch(() => NextResponse.next());
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
