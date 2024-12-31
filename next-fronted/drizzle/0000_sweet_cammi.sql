CREATE TABLE IF NOT EXISTS "content_detail" (
	"url" char(500) NOT NULL,
	"content" text,
	"content_hash" text NOT NULL,
	"source_type" char(255),
	"source" char(255),
	"detail" jsonb,
	"date" text DEFAULT (CURRENT_DATE),
	CONSTRAINT "content_detail_content_hash_unique" UNIQUE("content_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t_blog" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text,
	"blog_name" text,
	"info" jsonb,
	"date" text DEFAULT (CURRENT_DATE),
	CONSTRAINT "t_blog_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t_x" (
	"x_id" text PRIMARY KEY NOT NULL,
	"item_type" text NOT NULL,
	"data" jsonb NOT NULL,
	"username" text,
	"user_id" text,
	"user_link" text,
	"date" text DEFAULT (CURRENT_DATE)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "threat_intelligence" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" char(255) NOT NULL,
	"content" text,
	"inserted_at" timestamp (6) NOT NULL,
	"source" char(255),
	"extraction_result" jsonb
);
