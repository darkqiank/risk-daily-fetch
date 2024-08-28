import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { Env } from '..';
import { createDbInstance } from '../database'

export const t_blogs = sqliteTable('t_blogs', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    link: text('link').unique(),
	source: text('source'),
	date: text("date").default(sql`(CURRENT_DATE)`),
}
);

// 获取最近一周的数据
export const getLatestBlogs = async (env: Env) => {
    const db = createDbInstance(env);
    // return await db.select().from(t_blogs).all();
	return await db.select().from(t_blogs).where(sql`${t_blogs.link} >= date('now', '-30 days')`).all();
};


export const batchUpdateBlog = async (env: Env, blogs: { link: string, source: string }[]) => {
	const db = createDbInstance(env);
	return await db.insert(t_blogs).values(blogs).onConflictDoNothing()
}

// Read blog entry by Date
export const getBlogByDate = async (env: Env, date: string) => {
    const db = createDbInstance(env);
    return await db.select().from(t_blogs).where(sql`${t_blogs.date} = ${date}`);
};


