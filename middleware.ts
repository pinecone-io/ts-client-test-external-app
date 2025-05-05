// Notes:
// - Middleware can only be run in NextJS when using the Edge runtime
// - Headers() is an Edge-runtime-specific interface: https://developer.mozilla.org/en-US/docs/Web/API/Headers
// - Edge runtime supported APIs: https://vercel.com/docs/functions/edge-middleware/edge-runtime

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Prevent access to root or non-API routes
  const pathname = request.nextUrl.pathname;
  if (pathname === '/' || !pathname.startsWith('/api')) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Set new headers
  const newHeaders = new Headers(request.headers);
  newHeaders.append('x-call-from', 'ts-client-e2e-tests');

  // Set new request headers
  return NextResponse.next({
    request: {
      headers: newHeaders,
    },
  });
}
