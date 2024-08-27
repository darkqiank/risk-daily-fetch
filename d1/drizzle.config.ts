// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
    schema: "./src/schema/*",
    out: "./db/migrations",
    dialect: "sqlite",
    dbCredentials: {
        wranglerConfigPath: "wrangler.toml",
        dbName: "risk",
    },
} satisfies Config;
