CREATE TABLE `sheet_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`version` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	`lease_until` integer DEFAULT 0 NOT NULL,
	`synced_at` integer,
	`last_error` text
);
