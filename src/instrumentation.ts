export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    const postgres = (await import("postgres")).default;
    const path = (await import("path")).default;
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn("DATABASE_URL not set, skipping auto-migrations.");
      return;
    }

    console.log("Running automatic database migrations...");

    const migrationClient = postgres(connectionString, { max: 1 });
    const db = drizzle(migrationClient);

    try {
      // In standalone mode, files are executed from .next/standalone
      // so we will copy the migrations folder there in the Dockerfile
      const migrationsFolder = path.join(process.cwd(), "src/db/migrations");
      
      await migrate(db, { migrationsFolder });
      console.log("Migrations applied successfully!");
    } catch (error) {
      console.error("Migration failed:", error);
    } finally {
      await migrationClient.end();
    }
    
    // Start background tasks
    const { startCleanupScheduler } = await import("./lib/scheduler");
    startCleanupScheduler();
  }
}
