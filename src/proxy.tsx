// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-mssql';
import { eq } from 'drizzle-orm'
import { shortLinkTable } from "./db/schema"
import '../envConfig';

const db = drizzle(process.env.DATABASE_STRING!);

export async function proxy(request: NextRequest) {
  const pathName = request.nextUrl.pathname! ?? '';
  const slug = pathName.split('/').pop() ?? '';
  const shortLinks = await db
    .select()
    .from(shortLinkTable)
    .where(eq(shortLinkTable.slug, slug));

  if (shortLinks.length > 0) {
    return NextResponse.redirect(shortLinks[0].longLink);
  }

  return NextResponse.next();
}

// Configuration object to specify which paths the proxy should run on
export const config = {
  matcher: [
    '/ls/:path',
  ],
};