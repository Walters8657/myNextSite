// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  console.log(request.nextUrl);
  // if (request.nextUrl.pathname.startsWith('/ls')) {
  //   return NextResponse.redirect(new URL('https:www.google.com'));
  // }

  return NextResponse.next();
}

// Configuration object to specify which paths the proxy should run on
export const config = {
  matcher: [
    '/ls/:path',
  ],
};
