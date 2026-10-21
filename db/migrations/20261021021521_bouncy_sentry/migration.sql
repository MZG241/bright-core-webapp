ALTER TABLE "jobs" DROP CONSTRAINT "jobs_slug_key";--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "views_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_code_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_code_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_code_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "requirements" SET DATA TYPE jsonb USING "requirements"::jsonb;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "requirements" SET DEFAULT '[]';