import { pgTable, text, jsonb, serial } from "drizzle-orm/pg-core";
import { desc, sql, count } from "drizzle-orm";

import db from "../database";

export const t_blog = pgTable("t_blog", {
  id: serial("id").primaryKey(),
  url: text("url").unique(),
  blog_name: text("blog_name"),
  info: jsonb("info"),
  date: text("date").default(sql`(CURRENT_DATE)`),
});

export interface BlogFilters {
  blog_name?: string;
  date?: string;
}

// 批量上传数据
export const batchInsertBlog = async (blogs: any) => {
  const uniqueBlogs = blogs.reduce((acc: any[], blog: any) => {
    if (!acc.some((item) => item.url === blog.url)) {
      acc.push(blog);
    }

    return acc;
  }, []);

  return await db
    .insert(t_blog)
    .values(uniqueBlogs)
    .onConflictDoUpdate({
      target: t_blog.url,
      set: {
        // info: sql`excluded.info`,
        info: sql`CASE WHEN excluded.info IS NOT NULL THEN excluded.info ELSE t_blog.info END`,
      },
    });
};

export const getPaginatedData = async (
  filters: BlogFilters,
  pn = 1,
  ps = 6,
) => {
  const offset = (pn - 1) * ps;
  let query = db
    .select()
    .from(t_blog)
    .orderBy(desc(t_blog.id))
    .offset(offset)
    .limit(ps);

  // 构建总记录数查询
  let countQuery = db.select({ value: count() }).from(t_blog);

  if (filters.blog_name) {
    query = query.where(sql`${t_blog.blog_name} = ${filters.blog_name}`) as any;
    countQuery = countQuery.where(
      sql`${t_blog.blog_name} = ${filters.blog_name}`,
    ) as any;
  }

  if (filters.date) {
    query = query.where(sql`${t_blog.date} = ${filters.date}`) as any;
    countQuery = countQuery.where(sql`${t_blog.date} = ${filters.date}`) as any;
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

// 获取blog统计数据
export const getBlogCount = async () => {
  return await db
    .select({
      blog_name: t_blog.blog_name,
      total: sql<number>`cast(count(*) as int)`,
      new: sql<number>`cast(COUNT(CASE WHEN CAST(${t_blog.date} AS DATE) = CURRENT_DATE THEN 1 END) as int)`,
    })
    .from(t_blog)
    .groupBy(t_blog.blog_name);
};
