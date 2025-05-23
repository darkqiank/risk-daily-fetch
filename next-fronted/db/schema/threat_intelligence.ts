import {
  pgTable,
  text,
  jsonb,
  serial,
  char,
  timestamp,
} from "drizzle-orm/pg-core";
import { desc, sql, count, eq } from "drizzle-orm";

import db from "../database";
import { contentDetail } from "./content_detail";

export const threatIntelligence = pgTable("threat_intelligence", {
  id: serial("id").primaryKey(),
  url: char("url", { length: 255 }).notNull().unique(),
  content: text("content"),
  insertedAt: timestamp("inserted_at", { precision: 6 }).notNull(),
  source: char("source", { length: 255 }),
  extractionResult: jsonb("extraction_result"),
});

export interface threatFilters {
  date?: string;
  sourceType?: string;
  source?: string;
  apt?: string;
  eu?: string;
}

export const getPaginatedData = async (
  filters: threatFilters,
  pn = 1,
  ps = 20,
) => {
  const offset = (pn - 1) * ps;
  let query = db
    .select({
      id: threatIntelligence.id,
      url: threatIntelligence.url,
      content: threatIntelligence.content,
      // 关键修改：将无时区字段声明为北京时间
      insertedAt: sql<string>`${threatIntelligence.insertedAt}::timestamp AT TIME ZONE 'Asia/Shanghai'`,
      source: threatIntelligence.source,
      extractionResult: threatIntelligence.extractionResult,
      link: contentDetail.url,
    })
    .from(threatIntelligence)
    .leftJoin(
      contentDetail,
      eq(threatIntelligence.url, contentDetail.contentHash),
    );

  // 构建总记录数查询
  let countQuery = db.select({ value: count() }).from(threatIntelligence);

  let sql_list = [
    sql`jsonb_array_length(${threatIntelligence.extractionResult}->'data'->'iocs') > 0`,
  ];

  if (filters.date) {
    sql_list.push(
      sql`DATE(${threatIntelligence.insertedAt}) = ${filters.date}::date`,
    );
  }

  if (filters.sourceType == "twitter") {
    sql_list.push(
      sql`(${threatIntelligence.source} like 'tweet%' or ${threatIntelligence.source} like 'profile-conversation%')`,
    );
  } else if (filters.sourceType == "biz") {
    sql_list.push(
      sql`${threatIntelligence.source} like 'https://mp.weixin.qq.com%'`,
    );
  } else if (filters.sourceType == "blog") {
    sql_list.push(
      sql`${threatIntelligence.source} not like 'tweet%' and ${threatIntelligence.source} not like 'profile-conversation%' 
      and ${threatIntelligence.source} not like 'https://mp.weixin.qq.com%'`,
    );
  }

  if (filters.apt !== undefined) {
    if (filters.apt == "true") {
      sql_list.push(
        sql`${threatIntelligence.extractionResult}->'data'->>'APT' = '是'`,
      );
    } else if (filters.apt == "false") {
      sql_list.push(
        sql`${threatIntelligence.extractionResult}->'data'->>'APT' = '否'`,
      );
    }
  }

  if (filters.eu !== undefined) {
    if (filters.eu) {
      sql_list.push(
        sql`${threatIntelligence.extractionResult}->'data'->>'欧美' = '是'`,
      );
    } else {
      sql_list.push(
        sql`${threatIntelligence.extractionResult}->'data'->>'欧美' = '否'`,
      );
    }
  }

  if (sql_list.length > 0) {
    let sql_condition = sql.join(sql_list, sql` and `);

    query = query.where(sql_condition) as any;
    countQuery = countQuery.where(sql_condition) as any;
  }

  query = query
    .orderBy(desc(threatIntelligence.insertedAt))
    .offset(offset)
    .limit(ps) as any;

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

// 获取ioc统计数据
export const getIOCCount = async () => {
  return await db
    .select({
      total: sql<number>`cast(COALESCE(SUM(jsonb_array_length(${threatIntelligence.extractionResult}->'data'->'iocs')), 0) as int)`,
      new: sql<number>`cast(
        COALESCE(SUM(
          CASE 
            WHEN CAST(${threatIntelligence.insertedAt} AS DATE) >= CURRENT_DATE - INTERVAL '3 days' 
            THEN jsonb_array_length(${threatIntelligence.extractionResult}->'data'->'iocs')
            ELSE 0 
          END
        ), 0) as int
      )`,
    })
    .from(threatIntelligence);
};
