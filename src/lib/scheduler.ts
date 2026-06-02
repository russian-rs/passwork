import { db } from "@/db";
import { sql } from "drizzle-orm";

const CLEANUP_INTERVAL = 1000 * 60 * 15; // 15 minutes

export function startCleanupScheduler() {
  // Prevent multiple intervals in dev mode or overlapping calls
  if ((global as any).__cleanup_scheduled) return;
  (global as any).__cleanup_scheduled = true;

  console.log("Registered shared secrets cleanup scheduler (15m interval).");

  setInterval(async () => {
    try {
      // Use a PostgreSQL advisory lock to ensure only one pod performs the cleanup at any given time.
      // This distributes the task correctly across a multi-pod Kubernetes deployment.
      const lockResult = await db.execute(sql`SELECT pg_try_advisory_lock(987654321) as locked`);
      
      if (lockResult[0]?.locked) {
        try {
          await db.execute(sql`DELETE FROM shared_secrets WHERE expires_at < NOW()`);
        } finally {
          await db.execute(sql`SELECT pg_advisory_unlock(987654321)`);
        }
      }
    } catch (e) {
      console.error("Cleanup scheduler error:", e);
    }
  }, CLEANUP_INTERVAL);
}
