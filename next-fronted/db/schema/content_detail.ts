import { pgTable, text, jsonb, char, serial } from "drizzle-orm/pg-core";
import { desc, sql, count, eq } from "drizzle-orm";

import db from "../database";

import { threatIntelligence } from "./threat_intelligence";

export const contentDetail = pgTable("content_detail", {
  id: serial("id").primaryKey(),
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
  op?: string;
  apt?: string;
  eu?: string;
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
    );

  // 构建总记录数查询
  let countQuery = db
    .select({ value: count() })
    .from(contentDetail)
    .leftJoin(
      threatIntelligence,
      eq(contentDetail.contentHash, threatIntelligence.url),
    );

  let sql_list = [];

  if (filters.date) {
    sql_list.push(sql`${contentDetail.date} = ${filters.date}`);
  }

  if (filters.op !== undefined) {
    if (filters.op == "true") {
      sql_list.push(sql`${contentDetail.detail} ->>'运营商事件' = '是'`);
    } else if (filters.op == "false") {
      sql_list.push(sql`${contentDetail.detail} ->>'运营商事件' != '是'`);
    }
  }

  if (filters.apt !== undefined) {
    if (filters.apt == "true") {
      sql_list.push(
        sql`${threatIntelligence.extractionResult}->'data'->>'APT' = '是'`,
      );
    } else if (filters.apt == "false") {
      sql_list.push(
        sql`${threatIntelligence.extractionResult}->'data'->>'APT' != '是'`,
      );
    }
  }

  if (filters.eu !== undefined) {
    if (filters.eu == "true") {
      sql_list.push(
        sql`${threatIntelligence.extractionResult}->'data'->>'欧美' = '是'`,
      );
    } else if (filters.eu == "false") {
      sql_list.push(
        sql`${threatIntelligence.extractionResult}->'data'->>'欧美' != '是'`,
      );
    }
  }

  if (sql_list.length > 0) {
    let sql_condition = sql.join(sql_list, sql` and `);

    query = query.where(sql_condition) as any;
    countQuery = countQuery.where(sql_condition) as any;
  }

  query = query.orderBy(desc(contentDetail.id)).offset(offset).limit(ps) as any;

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
