import { NextResponse, NextRequest } from "next/server";
import { drizzle } from 'drizzle-orm/node-mssql';
import { shortLinkTable } from "../../../db/schema"
import '../../../../envConfig';

const db = drizzle(process.env.DATABASE_STRING!);

// To handle a GET request to /api
export async function GET(request: any) {
  let shortLinks = await db.select().from(shortLinkTable);
  return NextResponse.json({ shortLinks: shortLinks }, { status: 200 });
}

// To handle a POST request to /api
export async function POST(request: Request) {
  const data = await request.json();

  if (data.slug && data.longLink) {
    const result = await db.insert(shortLinkTable).values({
      slug: data.slug,
      longLink: data.longLink
    });

    return NextResponse.json({ message: "Values Inserted" }, { status: 200 });
  } else {
    return NextResponse.json({ message: "Invalid values" }, { status: 200 });
  }

}