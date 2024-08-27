import blogs_handler from "./api/blogs_handler";
import { Env } from './database';


export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        return blogs_handler.fetch(request, env);
    },
} satisfies ExportedHandler<Env>;
