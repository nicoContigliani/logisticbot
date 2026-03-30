import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, redirectToSignIn } = await auth();
  
  const isPublicRoute = req.nextUrl.pathname.startsWith('/sign-in') || 
                        req.nextUrl.pathname.startsWith('/sign-up') ||
                        req.nextUrl.pathname === '/' ||
                        req.nextUrl.pathname.startsWith('/api/webhooks') ||
                        req.nextUrl.pathname.startsWith('/api/docs') ||
                        req.nextUrl.pathname.startsWith('/dashboard/onboarding');
  
  if (!userId && !isPublicRoute) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\.[\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
