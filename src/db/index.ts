import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/passwork";

// Force PostgreSQL to use the public schema by default for this connection
const client = postgres(connectionString, {
  connection: {
    search_path: "public"
  }
});
export const db = drizzle(client, { schema });
