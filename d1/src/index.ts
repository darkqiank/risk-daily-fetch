import { drizzle } from 'drizzle-orm/d1';
import { t_blogs } from './schema';

export interface Env {
  DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const { pathname } = new URL(request.url);

		if (pathname === "/api/blogs") {
		// If you did not use `DB` as your binding name, change it here
			const db = drizzle(env.DB);
			const result = await db.select().from(t_blogs).all();
			return Response.json(result);
		}

		return new Response(
		"Call /api/ to see everyone who works at Bs Beverages",
		);
	},
} satisfies ExportedHandler<Env>;
