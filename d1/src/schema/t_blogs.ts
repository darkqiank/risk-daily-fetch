import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { Env, createDbInstance } from '../database'

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
	return await db.select().from(t_blogs).where(sql`${t_blogs.link} >= date('now', '-7 days')`).all();
};

export const createOrUpdateBlog = async (env: Env, link: string, source: string) => {
    const db = createDbInstance(env);
	const existingBlog = await db.select().from(t_blogs).where(sql`${t_blogs.link} = ${link}`).get()
	if (existingBlog) {
        // 如果存在，则更新现有条目
		console.log("更新新条目")
        await db.update(t_blogs).set({ source }).where(sql`${t_blogs.link} = ${link}`).run();
    } else {
        // 如果不存在，则插入新条目
		console.log("插入新条目")
        await db.insert(t_blogs).values({ link, source }).run();
    }
};

export const batchUpdateBlog = async (env: Env, blogs: { link: string, source: string }[]) => {
	for (const blog of blogs) {
		console.log(blog)
		await createOrUpdateBlog(env, blog.link, blog.source)
	}
}

// Read blog entry by Date
export const getBlogByDate = async (env: Env, date: string) => {
    const db = createDbInstance(env);
    return await db.select().from(t_blogs).where(sql`${t_blogs.date} = ${date}`);
};


