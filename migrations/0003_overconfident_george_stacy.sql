CREATE TABLE "alert_history" (
	"id" text PRIMARY KEY NOT NULL,
	"alert_id" text NOT NULL,
	"scan_id" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"notification_sent" boolean DEFAULT false NOT NULL,
	"notification_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"subreddit_id" text NOT NULL,
	"alert_type" text NOT NULL,
	"threshold" double precision DEFAULT 0.2 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitored_subreddits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subreddit_name" text NOT NULL,
	"display_name" text,
	"scan_frequency" text DEFAULT 'daily' NOT NULL,
	"post_limit" integer DEFAULT 100 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"setup_fee" integer DEFAULT 800,
	"last_scan_at" timestamp,
	"next_scan_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scan_results" (
	"id" text PRIMARY KEY NOT NULL,
	"scan_id" text NOT NULL,
	"keyword_mentions" jsonb,
	"top_posts" jsonb,
	"emerging_topics" jsonb,
	"sentiment_distribution" jsonb,
	"word_cloud" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scans" (
	"id" text PRIMARY KEY NOT NULL,
	"subreddit_id" text NOT NULL,
	"scan_type" text DEFAULT 'auto' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"posts_scanned" integer DEFAULT 0,
	"credits_cost" integer DEFAULT 0 NOT NULL,
	"overall_sentiment" double precision,
	"sentiment_trend" text,
	"error_message" text,
	"metadata" jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sentiment_baselines" (
	"id" text PRIMARY KEY NOT NULL,
	"subreddit_id" text NOT NULL,
	"period" text NOT NULL,
	"average_sentiment" double precision NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subreddit_keywords" (
	"id" text PRIMARY KEY NOT NULL,
	"subreddit_id" text NOT NULL,
	"keyword" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_credits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_history" ADD CONSTRAINT "alert_history_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_history" ADD CONSTRAINT "alert_history_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_subreddit_id_monitored_subreddits_id_fk" FOREIGN KEY ("subreddit_id") REFERENCES "public"."monitored_subreddits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitored_subreddits" ADD CONSTRAINT "monitored_subreddits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_results" ADD CONSTRAINT "scan_results_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "scans_subreddit_id_monitored_subreddits_id_fk" FOREIGN KEY ("subreddit_id") REFERENCES "public"."monitored_subreddits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentiment_baselines" ADD CONSTRAINT "sentiment_baselines_subreddit_id_monitored_subreddits_id_fk" FOREIGN KEY ("subreddit_id") REFERENCES "public"."monitored_subreddits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subreddit_keywords" ADD CONSTRAINT "subreddit_keywords_subreddit_id_monitored_subreddits_id_fk" FOREIGN KEY ("subreddit_id") REFERENCES "public"."monitored_subreddits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;