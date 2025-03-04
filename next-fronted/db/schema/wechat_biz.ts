import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { desc, sql, count } from "drizzle-orm";

import db from "../database";

export const wechatBiz = pgTable("wechat_biz", {
  id: serial("id").primaryKey(), // 主键
  title: text("title").notNull(), // 标题，非空
  pubTime: timestamp("pub_time", { precision: 6 }).notNull(), // 发布时间，非空
  url: text("url").notNull().unique(), // URL，非空
  nickname: text("nickname"), // 昵称
});

export interface bizFilters {
  date?: string;
  nickname?: string;
}

export const getPaginatedData = async (
  filters: bizFilters,
  pn = 1,
  ps = 20,
) => {
  const offset = (pn - 1) * ps;
  let query = db.select().from(wechatBiz);

  // 构建总记录数查询
  let countQuery = db.select({ value: count() }).from(wechatBiz);

  let sql_list = [];

  if (filters.date) {
    sql_list.push(sql`DATE(${wechatBiz.pubTime}) = ${filters.date}::date`);
  }

  if (filters.nickname !== undefined) {
    sql_list.push(sql`${wechatBiz.nickname} = ${filters.nickname}`);
  }

  if (sql_list.length > 0) {
    let sql_condition = sql.join(sql_list, sql` and `);

    query = query.where(sql_condition) as any;
    countQuery = countQuery.where(sql_condition) as any;
  }

  query = query
    .orderBy(desc(wechatBiz.pubTime))
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

// 获取blog统计数据
export const getBizCount = async () => {
  return await db
    .select({
      nickname: wechatBiz.nickname,
      total: sql<number>`cast(count(*) as int)`,
      new: sql<number>`cast(COUNT(CASE WHEN CAST(${wechatBiz.pubTime} AS DATE)  >= CURRENT_DATE - INTERVAL '3 days' THEN 1 END) as int)`,
    })
    .from(wechatBiz)
    .groupBy(wechatBiz.nickname);
};
