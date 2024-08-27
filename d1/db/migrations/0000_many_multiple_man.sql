CREATE TABLE `t_blogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`link` text,
	`source` text,
	`date` text DEFAULT (CURRENT_DATE)
);
