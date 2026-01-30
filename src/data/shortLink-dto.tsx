import 'server-only'

import { drizzle } from 'drizzle-orm/node-mssql';
import { eq } from 'drizzle-orm'
import { shortLinkTable } from "../db/schema"

import '../../envConfig';
    
const db = drizzle(process.env.DATABASE_STRING!);

/** Inserts a short link pair and returns the result of the db operation */
export async function insertShortLinkPair(slPair: {
    slug: string
    ,longLink: string
}) {
    const result = await db.insert(shortLinkTable).values({
        slug: slPair.slug,
        longLink: slPair.longLink
    });

    return result;
}

/** Gets the specified short link pair, returning a null longLink if none is found. */
export async function getShortLinkPair(slug: string) {
    const shortLinks = await db
        .select()
        .from(shortLinkTable)
        .where(eq(shortLinkTable.slug, slug));

    return {
        slug: slug
        ,longLink: shortLinks[0]?.longLink ?? null
    }
}