import { pgTable, text, jsonb, char } from "drizzle-orm/pg-core";
import { desc, sql, count, eq } from "drizzle-orm";

import db from "../database";

import { threatIntelligence } from "./threat_intelligence";

export const contentDetail = pgTable("content_detail", {
  url: char("url", { length: 500 }).notNull(),
  content: text("content"),
  contentHash: text("content_hash").notNull().unique(),
  sourceType: char("source_type", { length: 255 }),
  source: char("source", { length: 255 }),
  detail: jsonb("detail"),
  date: text("date").default(sql`(CURRENT_DATE)`),
});

export interface DetailFilters {
  date?: string;
}

export const getPaginatedData = async (
  filters: DetailFilters,
  pn = 1,
  ps = 20,
) => {
  const offset = (pn - 1) * ps;
  let query = db
    .select({
      url: contentDetail.url,
      content: contentDetail.content,
      contentHash: contentDetail.contentHash,
      sourceType: contentDetail.sourceType,
      source: contentDetail.source,
      detail: contentDetail.detail,
      date: contentDetail.date,
      extractionResult: threatIntelligence.extractionResult,
    })
    .from(contentDetail)
    .leftJoin(
      threatIntelligence,
      eq(contentDetail.contentHash, threatIntelligence.url),
    )
    .orderBy(desc(contentDetail.date))
    .offset(offset)
    .limit(ps);

  // 构建总记录数查询
  let countQuery = db.select({ value: count() }).from(contentDetail);

  if (filters.date) {
    query = query.where(sql`${contentDetail.date} = ${filters.date}`) as any;
    countQuery = countQuery.where(
      sql`${contentDetail.date} = ${filters.date}`,
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
