CREATE TABLE IF NOT EXISTS "t_x" (
	"x_id" text PRIMARY KEY NOT NULL,
	"item_type" text NOT NULL,
	"data" jsonb NOT NULL,
	"username" text,
	"user_id" text,
	"user_link" text,
	"date" text DEFAULT (CURRENT_DATE)
);
