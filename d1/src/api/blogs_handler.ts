import { Env} from '../database';
import { batchUpdateBlog, getLatestBlogs, getBlogByDate } from '../schema/t_blogs';

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const { pathname } = new URL(request.url);

        if (pathname === "/api/blogs") {
            if (request.method === "GET") {
                const result = await getLatestBlogs(env);
                return new Response(JSON.stringify(result), { status: 200 });
            } else if (request.method === "POST") {
                const blogs = await request.json() as { link: string, source: string }[];
                await batchUpdateBlog(env, blogs);
                return new Response("Blog updated", { status: 201 });
            }
        } else if (pathname.startsWith("/api/blogs/")) {
            const date = pathname.split("/")[3];

            if (request.method === "GET") {
                const result = await getBlogByDate(env, date);
                return new Response(JSON.stringify(result), { status: 200 });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
} satisfies ExportedHandler<Env>;
