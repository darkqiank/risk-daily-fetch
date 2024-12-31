import { pgTable, text, jsonb, char } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const contentDetail = pgTable("content_detail", {
  url: char("url", { length: 500 }).notNull(),
  content: text("content"),
  contentHash: text("content_hash").notNull().unique(),
  sourceType: char("source_type", { length: 255 }),
  source: char("source", { length: 255 }),
  detail: jsonb("detail"),
  date: text("date").default(sql`(CURRENT_DATE)`),
});
