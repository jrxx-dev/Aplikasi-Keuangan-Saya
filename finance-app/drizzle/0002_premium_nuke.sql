ALTER TABLE "logs" ADD COLUMN "resolved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "logs" ADD COLUMN "resolved_at" timestamp;--> statement-breakpoint
ALTER TABLE "logs" ADD COLUMN "resolved_by" text;