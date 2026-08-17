CREATE TABLE `about` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`concept` text DEFAULT '' NOT NULL,
	`vision` text DEFAULT '' NOT NULL,
	`identity` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `artists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`portrait` text DEFAULT '' NOT NULL,
	`bio` text NOT NULL,
	`statement` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artists_slug_unique` ON `artists` (`slug`);--> statement-breakpoint
CREATE TABLE `artworks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`artist_slug` text NOT NULL,
	`year` text NOT NULL,
	`medium` text NOT NULL,
	`dimensions` text NOT NULL,
	`width_cm` integer NOT NULL,
	`height_cm` integer NOT NULL,
	`image` text NOT NULL,
	`availability` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`displayed` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artworks_slug_unique` ON `artworks` (`slug`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`date` text DEFAULT '' NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`hero_transform` text DEFAULT 'translate(0px, 0px) scale(1)' NOT NULL,
	`thumb_transform` text DEFAULT 'translate(0px, 0px) scale(1)' NOT NULL,
	`detail_transform` text DEFAULT 'translate(0px, 0px) scale(1)' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`video` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE TABLE `events_media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`url` text NOT NULL,
	`pos` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`whatsapp_number` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`instagram` text DEFAULT '' NOT NULL,
	`facebook` text DEFAULT '' NOT NULL
);
