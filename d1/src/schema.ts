// db/schema.ts
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const t_blogs = sqliteTable('t_blogs', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    link: text('link'),
	source: text('source'),
	date: text("date").default(sql`(CURRENT_DATE)`),
}
);
