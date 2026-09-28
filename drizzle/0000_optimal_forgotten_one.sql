CREATE TABLE `responses` (
	`id` text PRIMARY KEY NOT NULL,
	`theme` text NOT NULL,
	`answers` text NOT NULL,
	`feedback` text NOT NULL,
	`created_at` integer NOT NULL,
	`gift` text,
	`email` text,
	`marketing_consent` integer DEFAULT 0 NOT NULL,
	`test` integer DEFAULT 0 NOT NULL
);
