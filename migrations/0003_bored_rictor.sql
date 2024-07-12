ALTER TABLE `partiture` ADD `collab_id` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `partiture_collab_id_unique` ON `partiture` (`collab_id`);