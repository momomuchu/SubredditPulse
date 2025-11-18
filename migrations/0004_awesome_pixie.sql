CREATE TABLE "cron_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"job_name" text NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"subreddits_processed" integer DEFAULT 0,
	"scans_triggered" integer DEFAULT 0,
	"error_count" integer DEFAULT 0,
	"error_message" text,
	"metadata" jsonb,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"duration" integer
);
