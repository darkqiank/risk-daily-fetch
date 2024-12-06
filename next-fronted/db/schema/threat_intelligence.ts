import {
  pgTable,
  text,
  jsonb,
  serial,
  char,
  timestamp,
} from "drizzle-orm/pg-core";
import { desc, sql, count } from "drizzle-orm";

import db from "../database";

export const threatIntelligence = pgTable("threat_intelligence", {
  id: serial("id").primaryKey(),
  url: char("url", { length: 255 }).notNull(),
  content: text("content"),
  insertedAt: timestamp("inserted_at", { precision: 6 }).notNull(),
  source: char("source", { length: 255 }),
  extractionResult: jsonb("extraction_result"),
});

export interface threatFilters {
  date?: string;
}

export const getPaginatedData = async (
  filters: threatFilters,
  pn = 1,
  ps = 20,
) => {
  const offset = (pn - 1) * ps;
  let query = db
    .select()
    .from(threatIntelligence)
    .orderBy(desc(threatIntelligence.insertedAt))
    .offset(offset)
    .limit(ps);

  // 构建总记录数查询
  let countQuery = db.select({ value: count() }).from(threatIntelligence);

  if (filters.date) {
    query = query.where(
      sql`DATE(${threatIntelligence.insertedAt}) = ${filters.date}::date
      and jsonb_array_length(${threatIntelligence.extractionResult}->'data'->'iocs') > 0`,
    ) as any;
    countQuery = countQuery.where(
      sql`DATE(${threatIntelligence.insertedAt}) = ${filters.date}::date
      and jsonb_array_length(${threatIntelligence.extractionResult}->'data'->'iocs') > 0`,
    ) as any;
  } else {
    query = query.where(
      sql`jsonb_array_length(${threatIntelligence.extractionResult}->'data'->'iocs') > 0`,
    ) as any;
    countQuery = countQuery.where(
      sql`jsonb_array_length(${threatIntelligence.extractionResult}->'data'->'iocs') > 0`,
    ) as any;
  }

  // 执行查询
  const [data, countResult] = await Promise.all([query, countQuery]);

  // 计算总页数
  const totalRecords = countResult[0].value;
  const totalPages = Math.ceil(totalRecords / ps);

  return {
    data,
    totalPages,
    totalRecords,
    pageNumber: pn,
    pageSize: ps,
  };
};
