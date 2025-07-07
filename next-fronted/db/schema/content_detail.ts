import { pgTable, text, jsonb, char, serial, index } from "drizzle-orm/pg-core";
import { desc, sql, count, eq } from "drizzle-orm";

import db from "../database";

import { threatIntelligence } from "./threat_intelligence";

// 配置选择：优先使用 jieba，备用 english
// const SEARCH_CONFIG = 'jiebacfg'; // 如果 pg_jieba 不可用，改为 'english'
const SEARCH_CONFIG = 'simple';

export const contentDetail = pgTable("content_detail", {
  id: serial("id").primaryKey(),
  url: char("url", { length: 500 }).notNull(),
  content: text("content"),
  contentHash: text("content_hash").notNull().unique(),
  sourceType: char("source_type", { length: 255 }),
  source: char("source", { length: 255 }),
  detail: jsonb("detail"),
  date: text("date").default(sql`(CURRENT_DATE)`),
}, (table) => ({
  // GIN索引用于全文搜索优化（使用jieba中文分词）
  fullTextSearchIdx: index("idx_content_detail_fulltext_search")
    .using("gin", sql`to_tsvector('simple', COALESCE(${table.content}, '') || ' ' || COALESCE(${table.url}, '') || ' ' || COALESCE(${table.source}, ''))`),
}));

export interface DetailFilters {
  date?: string;
  sourceType?: string;
  home?: string;
  op?: string;
  apt?: string;
  eu?: string;
  ioc?: string;
  ids?: any;
  query?: string;
}

// PostgreSQL 全文搜索函数
export const fullTextSearch = async (
  query: string,
  filters: DetailFilters = {},
  pn = 1,
  ps = 20,
) => {
  const offset = (pn - 1) * ps;
  
  // 清理查询字符串，支持中文搜索（保留更多特殊字符）
  const cleanQuery = query
    .trim()
    .replace(/\s+/g, ' ');
  
  if (!cleanQuery) {
    // 如果查询为空，返回空结果
    return {
      data: [],
      totalPages: 0,
      totalRecords: 0,
      pageNumber: pn,
      pageSize: ps,
      searchQuery: query,
    };
  }
  
  // 构建tsquery，使用jieba配置支持中文和特殊字符
  const tsquery = cleanQuery
    .split(' ')
    .filter(term => term.length > 0)
    .map(term => {
      // 对于包含特殊字符的词，进行转义处理
      const escapedTerm = term.replace(/[&|!():*]/g, '\\$&');
      return escapedTerm + ':*'; // 添加前缀匹配
    })
    .join(' & ');

  // 构建搜索条件
  let searchConditions = [
    sql`to_tsvector(${SEARCH_CONFIG}, COALESCE(${contentDetail.content}, '') || ' ' || COALESCE(${contentDetail.url}, '') || ' ' || COALESCE(${contentDetail.source}, '')) @@ to_tsquery(${SEARCH_CONFIG}, ${tsquery})`
  ];

  // 应用其他过滤条件
  if (filters.date) {
    searchConditions.push(sql`LEFT(${contentDetail.date}, 10) = ${filters.date}`);
  }

  if (filters.sourceType) {
    searchConditions.push(sql`${contentDetail.sourceType} = ${filters.sourceType}`);
  }

  if (filters.home !== undefined) {
    if (filters.home === "true") {
      searchConditions.push(sql`${contentDetail.detail} ->>'家庭事件' = '是'`);
    } else if (filters.home === "false") {
      searchConditions.push(sql`${contentDetail.detail} ->>'家庭事件' != '是'`);
    }
  }

  if (filters.op !== undefined) {
    if (filters.op === "true") {
      searchConditions.push(sql`${contentDetail.detail} ->>'运营商事件' = '是'`);
    } else if (filters.op === "false") {
      searchConditions.push(sql`${contentDetail.detail} ->>'运营商事件' != '是'`);
    }
  }

  if (filters.apt !== undefined) {
    if (filters.apt === "true") {
      searchConditions.push(sql`${threatIntelligence.extractionResult}->'data'->>'APT' = '是'`);
    } else if (filters.apt === "false") {
      searchConditions.push(sql`${threatIntelligence.extractionResult}->'data'->>'APT' != '是'`);
    }
  }

  if (filters.eu !== undefined) {
    if (filters.eu === "true") {
      searchConditions.push(sql`${threatIntelligence.extractionResult}->'data'->>'欧美' = '是'`);
    } else if (filters.eu === "false") {
      searchConditions.push(sql`${threatIntelligence.extractionResult}->'data'->>'欧美' != '是'`);
    }
  }

  if (filters.ioc !== undefined) {
    if (filters.ioc === "true") {
      searchConditions.push(sql`jsonb_array_length(${threatIntelligence.extractionResult} -> 'data' -> 'iocs') > 0`);
    } else if (filters.ioc === "false") {
      searchConditions.push(sql`jsonb_array_length(${threatIntelligence.extractionResult} -> 'data' -> 'iocs') = 0`);
    }
  }

  const searchCondition = sql.join(searchConditions, sql` AND `);

  try {
    const searchQuery = db
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
        rank: sql<number>`ts_rank(to_tsvector(${SEARCH_CONFIG}, COALESCE(${contentDetail.content}, '') || ' ' || COALESCE(${contentDetail.url}, '') || ' ' || COALESCE(${contentDetail.source}, '')), to_tsquery(${SEARCH_CONFIG}, ${tsquery}))`,
        snippet: sql<string>`ts_headline(${SEARCH_CONFIG}, 
          COALESCE(${contentDetail.content}, ''), 
          to_tsquery(${SEARCH_CONFIG}, ${tsquery})
        )`,
      })
      .from(contentDetail)
      .leftJoin(
        threatIntelligence,
        eq(contentDetail.contentHash, threatIntelligence.url),
      )
      .where(searchCondition)
      .orderBy(desc(sql`ts_rank(to_tsvector(${SEARCH_CONFIG}, COALESCE(${contentDetail.content}, '') || ' ' || COALESCE(${contentDetail.url}, '') || ' ' || COALESCE(${contentDetail.source}, '')), to_tsquery(${SEARCH_CONFIG}, ${tsquery}))`), desc(contentDetail.id))
      .offset(offset)
      .limit(ps);

    const countQuery = db
      .select({ value: count() })
      .from(contentDetail)
      .leftJoin(
        threatIntelligence,
        eq(contentDetail.contentHash, threatIntelligence.url),
      )
      .where(searchCondition);

    // 执行查询
    const [data, countResult] = await Promise.all([searchQuery, countQuery]);

    const totalRecords = countResult[0].value;
    const totalPages = Math.ceil(totalRecords / ps);

    return {
      data: data.map((item: any) => ({
        ...item,
        snippet: item.snippet ? item.snippet.replace(/<b>/g, '<em class="bg-yellow-200 font-bold not-italic">').replace(/<\/b>/g, '</em>') : null,
      })),
      totalPages,
      totalRecords,
      pageNumber: pn,
      pageSize: ps,
      searchQuery: query,
    };
  } catch (error) {
    console.error('Full text search error:', error);
    throw error;
  }
};

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

  const [data, countResult] = await Promise.all([query, countQuery]);
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
  await db.insert(contentDetail).values(data).onConflictDoUpdate({
    target: contentDetail.contentHash,
    set: {
      url: sql`CASE WHEN excluded.url IS NOT NULL AND excluded.url != '' THEN excluded.url ELSE ${contentDetail.url} END`,
      content: sql`CASE WHEN excluded.content IS NOT NULL THEN excluded.content ELSE ${contentDetail.content} END`,
      source: sql`CASE WHEN excluded.source IS NOT NULL AND excluded.source != '' THEN excluded.source ELSE ${contentDetail.source} END`,
      sourceType: sql`CASE WHEN excluded.source_type IS NOT NULL AND excluded.source_type != '' THEN excluded.source_type ELSE ${contentDetail.sourceType} END`,
      detail: sql`CASE 
        WHEN excluded.detail IS NOT NULL 
        THEN COALESCE(${contentDetail.detail}, '{}'::jsonb) || excluded.detail
        ELSE ${contentDetail.detail}
        END`,
    },
  });
};
