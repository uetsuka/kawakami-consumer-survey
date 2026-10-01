ALTER TABLE `responses` ADD `status` text DEFAULT 'submitted' NOT NULL;--> statement-breakpoint
ALTER TABLE `responses` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `responses` ADD `answered_count` integer DEFAULT 12 NOT NULL;--> statement-breakpoint
ALTER TABLE `responses` ADD `revision` integer DEFAULT 0 NOT NULL;