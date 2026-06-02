import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const credentials = pgTable("credentials", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  username: text("username"),
  passwordEncrypted: text("password_encrypted").notNull(),
  url: text("url"),
  customIcon: text("custom_icon"),
  dominantColor: text("dominant_color"),
  totpSecretEncrypted: text("totp_secret_encrypted"),
  notes: text("notes"),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sharedSecrets = pgTable("shared_secrets", {
  id: text("id").primaryKey(),
  secretEncrypted: text("secret_encrypted").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
