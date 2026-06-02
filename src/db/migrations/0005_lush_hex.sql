CREATE TABLE "shared_secrets" (
	"id" text PRIMARY KEY NOT NULL,
	"secret_encrypted" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
