import blogs_handler from "./api/blogs_handler";

export interface Env {
	DB: D1Database;
	AUTH_VALUE: string;
	PG_DB: string;
  }

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
		/**
     		* @param {string} PRESHARED_AUTH_HEADER_KEY Custom header to check for key
     		* @param {string} PRESHARED_AUTH_HEADER_VALUE Hard coded key value
     	*/
		const PRESHARED_AUTH_HEADER_KEY = "X-AUTH-KEY";
		const PRESHARED_AUTH_HEADER_VALUE = env.AUTH_VALUE;
		const psk = request.headers.get(PRESHARED_AUTH_HEADER_KEY);

		if (psk === PRESHARED_AUTH_HEADER_VALUE) {
			// Correct preshared header key supplied. Fetch request from origin.
			return blogs_handler.fetch(request, env);
		}
		// Incorrect key supplied. Reject the request.
		return new Response("Sorry, you have supplied an invalid key.", {
			status: 403,
		});
    },
} satisfies ExportedHandler<Env>;
