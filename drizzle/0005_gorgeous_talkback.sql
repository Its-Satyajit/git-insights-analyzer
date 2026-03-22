ALTER TABLE "repositories" ADD COLUMN "analysis_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "analysis_phase" text;