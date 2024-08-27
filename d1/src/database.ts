import { drizzle } from 'drizzle-orm/d1';
import { Env } from '.';

export const createDbInstance = (env: Env) => {
    return drizzle(env.DB);
};
