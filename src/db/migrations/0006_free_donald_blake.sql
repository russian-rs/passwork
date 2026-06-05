CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"authentik_id" text NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"added_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_authentik_id_unique" UNIQUE("authentik_id")
);
