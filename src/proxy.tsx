// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-mssql';
import { shortLinkTable } from "./db/schema"
import '../envConfig';

const db = drizzle(process.env.DATABASE_STRING!);

export async function proxy(request: NextRequest) {
  const shortLinks = await db.select().from(shortLinkTable);

  console.log(shortLinks);

  return NextResponse.next();
}

// Configuration object to specify which paths the proxy should run on
export const config = {
  matcher: [
    '/ls/:path',
  ],
};