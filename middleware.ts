import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/(.*)']);

export default clerkMiddleware((auth, req) => {
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  const isConfigured = clerkSecret && !clerkSecret.includes('placeholder');

  if (isConfigured && !isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|webmanifest|fontawesome|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
