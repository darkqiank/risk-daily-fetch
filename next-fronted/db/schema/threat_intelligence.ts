import {
  pgTable,
  text,
  jsonb,
  serial,
  char,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { desc, sql, count, eq } from "drizzle-orm";

import db from "../database";
import { contentDetail } from "./content_detail";
import { t_x } from "./t_x";

export const threatIntelligence = pgTable("threat_intelligence", {
  id: serial("id").primaryKey(),
  url: char("url", { length: 255 }).notNull().unique(),
  content: text("content"),
  insertedAt: timestamp("inserted_at", { precision: 6 }).notNull(),
  source: char("source", { length: 255 }),
  extractionResult: jsonb("extraction_result"),
}, (table) => ({
  // GIN索引用于JSONB数据查询优化
  extractionResultIdx: index("idx_extraction_result_gin")
    .using("gin", table.extractionResult),
  // 专用于IOC数组的GIN索引，使用jsonb_path_ops操作符类
  extractionResultIocPathIdx: index("idx_extraction_result_ioc_path_gin")
    .using("gin", sql`(${table.extractionResult} -> 'data' -> 'iocs') jsonb_path_ops`),
}));

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
      link: sql<string>`
        CASE
          -- 1. url字段为url形式（http或https开头），则直接作为link返回
          WHEN ${threatIntelligence.url} LIKE 'http%' THEN ${threatIntelligence.url}
          -- 2. source为url形式（http或https开头），则直接作为link返回
          WHEN ${threatIntelligence.source} LIKE 'http%' THEN ${threatIntelligence.source}
          -- 3. source为twitter开头或者profile-conversation-tweet开头的，提取tweet id拼接url
          WHEN ${threatIntelligence.source} LIKE 'tweet-%' THEN 
            'https://x.com/user/status/' || SUBSTRING(${threatIntelligence.source}, 7)
          WHEN ${threatIntelligence.source} LIKE 'profile-conversation-tweet-%' THEN 
            'https://x.com/user/status/' || SPLIT_PART(SUBSTRING(${threatIntelligence.source}, 28), '-tweet-', 1)
          -- 4. 其他格式，则使用join后的contentDetail.url作为link返回
          ELSE ${contentDetail.url}
        END
      `,
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

// 根据IOC进行忽略大小写的精确搜索
export const searchByIOC = async (iocValue: string, pn = 1, ps = 20, sourceTypes?: string) => {
  const offset = (pn - 1) * ps;
  
  // 构建搜索查询
  let query = db
    .select({
      id: threatIntelligence.id,
      insertedAt: sql<string>`${threatIntelligence.insertedAt}::timestamp AT TIME ZONE 'Asia/Shanghai'`,
      link: sql<string>`
        CASE
          -- 1. url字段为url形式（http或https开头），则直接作为link返回
          WHEN ${threatIntelligence.url} LIKE 'http%' THEN TRIM(${threatIntelligence.url})
          -- 2. source为url形式（http或https开头），则直接作为link返回
          WHEN ${threatIntelligence.source} LIKE 'http%' THEN TRIM(${threatIntelligence.source})
          -- 3. source为twitter开头或者profile-conversation-tweet开头的，提取tweet id拼接url
          WHEN ${threatIntelligence.source} LIKE 'tweet-%' THEN 
            'https://x.com/user/status/' || SUBSTRING(${threatIntelligence.source}, 7)
          WHEN ${threatIntelligence.source} LIKE 'profile-conversation-tweet-%' THEN 
            'https://x.com/user/status/' || SPLIT_PART(SUBSTRING(${threatIntelligence.source}, 28), '-tweet-', 1)
          -- 4. 其他格式，则使用join后的contentDetail.url作为link返回
          ELSE TRIM(${contentDetail.url})
        END
      `,
      meta: sql<any>`
        CASE
          -- 如果source为tweet格式，从threatIntelligence和t_x表获取meta信息
          WHEN ${threatIntelligence.source} LIKE 'tweet-%' OR ${threatIntelligence.source} LIKE 'profile-conversation-tweet-%' THEN
            jsonb_build_object(
              'desc', TRIM(${threatIntelligence.content}),
              'source', TRIM(${t_x.username}),
              'source_type', 'twitter'
            )
          -- 其他情况从contentDetail获取meta信息
          ELSE
            jsonb_build_object(
              'title', TRIM(${contentDetail.detail}->>'摘要'),
              'desc', CASE
                WHEN ${contentDetail.content} IS NULL THEN ''
                WHEN POSITION(UPPER(${iocValue}) IN UPPER(${contentDetail.content})) > 0 THEN
                  -- 找到IOC值的位置，返回前后100字符的上下文
                  '...' || SUBSTRING(
                    ${contentDetail.content},
                    GREATEST(1, POSITION(UPPER(${iocValue}) IN UPPER(${contentDetail.content})) - 100),
                    200 + LENGTH(${iocValue})
                  ) || '...'
                ELSE
                  -- 找不到IOC值，返回开头100字符
                  SUBSTRING(TRIM(${contentDetail.content}), 1, 100) || '...'
              END,
              'source', TRIM(${contentDetail.source}),
              'source_type', TRIM(${contentDetail.sourceType})
            )
        END
      `,
    })
    .from(threatIntelligence)
    .leftJoin(
      contentDetail,
      eq(threatIntelligence.url, contentDetail.contentHash),
    )
    .leftJoin(
      t_x,
      eq(threatIntelligence.source, t_x.x_id)
    );

  // 构建总记录数查询
  let countQuery = db.select({ value: count() }).from(threatIntelligence);

  // 构建查询条件数组
  let sql_list = [];

  // 使用GIN索引进行忽略大小写的IOC搜索
  const searchCondition = sql`
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(${threatIntelligence.extractionResult} -> 'data' -> 'iocs') AS ioc
      WHERE LOWER(TRIM(ioc ->> 'IOC')) = LOWER(TRIM(${iocValue}))
    )
  `;
  sql_list.push(searchCondition);

  // 添加source_types筛选逻辑
  if (sourceTypes && sourceTypes.trim()) {
    const types = sourceTypes.split(',').map(type => type.trim()).filter(type => type);
    
    if (types.length > 0) {
      const sourceTypeConditions = [];
      
      for (const type of types) {
        if (type === "twitter") {
          sourceTypeConditions.push(
            sql`(${threatIntelligence.source} like 'tweet%' or ${threatIntelligence.source} like 'profile-conversation%')`
          );
        } else if (type === "biz") {
          sourceTypeConditions.push(
            sql`${threatIntelligence.source} like 'https://mp.weixin.qq.com%'`
          );
        } else if (type === "blog") {
          sourceTypeConditions.push(
            sql`${threatIntelligence.source} not like 'tweet%' and ${threatIntelligence.source} not like 'profile-conversation%' 
            and ${threatIntelligence.source} not like 'https://mp.weixin.qq.com%'`
          );
        }
      }
      
      if (sourceTypeConditions.length > 0) {
        const sourceTypeCondition = sql.join(sourceTypeConditions, sql` or `);
        sql_list.push(sql`(${sourceTypeCondition})`);
      }
    }
  }

  // 应用所有查询条件
  if (sql_list.length > 0) {
    const sql_condition = sql.join(sql_list, sql` and `);
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
    searchTerm: iocValue,
    sourceTypes,
  };
};
