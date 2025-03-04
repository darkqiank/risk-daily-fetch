CREATE TABLE IF NOT EXISTS "wechat_biz" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"pub_time" timestamp (6) NOT NULL,
	"url" text NOT NULL,
	"nickname" text,
	CONSTRAINT "wechat_biz_url_unique" UNIQUE("url")
);
