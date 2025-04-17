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
  sourceType?: string;
  home?: string;
  op?: string;
  apt?: string;
  eu?: string;
  ioc?: string;
  ids?: any;
}

export const getPaginatedData = async (
  filters: DetailFilters,
  pn = 1,
  ps = 20,
) => {
  const offset = (pn - 1) * ps;

  let query = db
    .select({
      id: contentDetail.id,
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

  if (filters.ids && filters.ids.length > 0) {
    sql_list.push(sql`${contentDetail.id} IN ${filters.ids}`);
  }

  if (filters.date) {
    sql_list.push(sql`LEFT(${contentDetail.date}, 10) = ${filters.date}`);
  }

  if (filters.sourceType) {
    sql_list.push(sql`${contentDetail.sourceType} = ${filters.sourceType}`);
  }

  if (filters.home !== undefined) {
    if (filters.home == "true") {
      sql_list.push(sql`${contentDetail.detail} ->>'家庭事件' = '是'`);
    } else if (filters.home == "false") {
      sql_list.push(sql`${contentDetail.detail} ->>'家庭事件' != '是'`);
    }
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

  if (filters.ioc !== undefined) {
    if (filters.ioc == "true") {
      sql_list.push(
        sql`jsonb_array_length(${threatIntelligence.extractionResult} -> 'data' -> 'iocs') > 0`,
      );
    } else if (filters.ioc == "false") {
      sql_list.push(
        sql`jsonb_array_length(${threatIntelligence.extractionResult} -> 'data' -> 'iocs') = 0`,
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


export const batchInsertContentDetail = async (data: any) => {
  // 有值才更新
  await db.insert(contentDetail).values(data).onConflictDoUpdate({
    target: contentDetail.contentHash,
    set: {
      url: sql`CASE WHEN excluded.url IS NOT NULL AND excluded.url != '' THEN excluded.url ELSE ${contentDetail.url} END`,
      content: sql`CASE WHEN excluded.content IS NOT NULL THEN excluded.content ELSE ${contentDetail.content} END`,
      source: sql`CASE WHEN excluded.source IS NOT NULL AND excluded.source != '' THEN excluded.source ELSE ${contentDetail.source} END`,
      sourceType: sql`CASE WHEN excluded.source_type IS NOT NULL AND excluded.source_type != '' THEN excluded.source_type ELSE ${contentDetail.sourceType} END`,
      detail: sql`CASE 
        WHEN excluded.detail IS NOT NULL 
        THEN ${contentDetail.detail} || excluded.detail
        ELSE ${contentDetail.detail}
        END`,
    },
  });
};
