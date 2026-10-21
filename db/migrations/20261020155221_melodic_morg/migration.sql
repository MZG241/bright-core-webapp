CREATE TYPE "application_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "employment_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');--> statement-breakpoint
CREATE TYPE "job_status" AS ENUM('OPEN', 'CLOSED');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"job_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"cover_note" text,
	"cv_file_id" text NOT NULL,
	"cv_file_name" text NOT NULL,
	"status" "application_status" DEFAULT 'PENDING'::"application_status" NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"location" text NOT NULL,
	"employment_type" "employment_type" NOT NULL,
	"description" text NOT NULL,
	"requirements" text NOT NULL,
	"closing_date" timestamp with time zone NOT NULL,
	"status" "job_status" DEFAULT 'OPEN'::"job_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'ADMIN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "applications_job_email_unique" ON "applications" ("job_id","email");--> statement-breakpoint
CREATE INDEX "applications_job_id_idx" ON "applications" ("job_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" ("status");--> statement-breakpoint
CREATE INDEX "applications_created_at_idx" ON "applications" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_slug_unique" ON "jobs" ("slug");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" ("status");--> statement-breakpoint
CREATE INDEX "jobs_closing_date_idx" ON "jobs" ("closing_date");--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE;