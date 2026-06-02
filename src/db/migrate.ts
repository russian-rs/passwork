import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "path";

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Skipping migrations.");
    return;
  }

  console.log("Running database migrations...");
  
  // Use max 1 connection for migrations
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    // Resolve the path to the migrations folder
    // In production (built Next.js), this might run from a different CWD
    // We'll point it to src/db/migrations
    const migrationsFolder = path.join(process.cwd(), "src/db/migrations");
    
    await migrate(db, { migrationsFolder });
    console.log("Migrations applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations();
