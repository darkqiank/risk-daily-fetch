import { pgTable, text, jsonb } from "drizzle-orm/pg-core";
import { desc, sql } from "drizzle-orm";

import db from "../database";

export const t_x = pgTable("t_x", {
  x_id: text("x_id").primaryKey(),
  itemType: text("item_type").notNull(),
  data: jsonb("data").notNull(),
  username: text("username"),
  user_id: text("user_id"),
  user_link: text("user_link"),
  date: text("date").default(sql`(CURRENT_DATE)`),
});

export interface XFilters {
  user_id?: string;
  date?: string;
}

// 批量上传数据
export const batchUpsertX = async (twitters: any) => {
  return await db
    .insert(t_x)
    .values(twitters)
    .onConflictDoUpdate({
      target: t_x.x_id,
      set: {
        itemType: sql`excluded.item_type`,
        data: sql`excluded.data`,
        username: sql`excluded.username`,
        user_id: sql`excluded.user_id`,
        user_link: sql`excluded.user_link`,
      },
    });
};

// 获取最新3天数据
export const getLatestX = async () => {
  return await db
    .select()
    .from(t_x)
    .where(sql`CAST(${t_x.date} AS DATE) >= CURRENT_DATE - INTERVAL '3 days'`);
};

// 根据日期获取数据
export const getXByDate = async (date: string) => {
  return await db
    .select()
    .from(t_x)
    .where(sql`${t_x.date} = ${date}`);
};

export const getPaginatedData = async (filters: XFilters, pn = 1, ps = 20) => {
  const offset = (pn - 1) * ps;
  let query = db
    .select()
    .from(t_x)
    .orderBy(desc(t_x.date))
    .limit(ps)
    .offset(offset);

  if (filters.user_id) {
    query = query.where(sql`${t_x.user_id} = ${filters.user_id}`) as any;
  }

  if (filters.date) {
    query = query.where(sql`${t_x.date} = ${filters.date}`) as any;
  }

  return await query;
};
