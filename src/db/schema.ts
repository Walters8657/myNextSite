import { mssqlTable, varchar, text } from 'drizzle-orm/mssql-core';

export const shortLinkTable = mssqlTable("shortLink", {
    shortLink: varchar({length: 6}).notNull().unique()
    ,longLink: text().notNull()
});