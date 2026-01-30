// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { getShortLinkPair } from './data/shortLink-dto';

export async function proxy(request: NextRequest) {
  const pathName = request.nextUrl.pathname! ?? '';
  const slug = pathName.split('/').pop() ?? '';

  const shortLinkPair = await getShortLinkPair(slug);

  if (shortLinkPair.longLink) {
    return NextResponse.redirect(shortLinkPair.longLink);
  }

  return NextResponse.next();
}

// Configuration object to specify which paths the proxy should run on
export const config = {
  matcher: [
    '/ls/:path',
  ],
};