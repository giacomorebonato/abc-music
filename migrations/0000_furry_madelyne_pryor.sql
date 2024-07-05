CREATE TABLE `collab` (
	`created_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`updated_at` integer,
	`content` blob
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`created_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`updated_at` integer,
	`color` text,
	`nickname` text,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`created_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`updated_at` integer,
	`color` text,
	`nickname` text,
	`email` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);