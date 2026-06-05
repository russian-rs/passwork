"use server";

import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "./actions";

export async function searchAuthentikUsers(query: string) {
  await verifyAdmin();

  if (!query || query.length < 2) return [];

  const authentikUrl = process.env.AUTHENTIK_URL?.replace(/\/$/, "");
  if (!authentikUrl) throw new Error("AUTHENTIK_URL not configured");

  const apiKey = process.env.AUTHENTIK_API_KEY;
  if (!apiKey) throw new Error("AUTHENTIK_API_KEY not configured");

  try {
    const res = await fetch(`${authentikUrl}/api/v3/core/users/?search=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch users from Authentik: ${res.status} ${res.statusText} - ${text}`);
    }

    const data = await res.json();
    return data.results.map((user: any) => ({
      id: user.uid || user.pk || user.id, // Authentik uid is the UUID
      username: user.username,
      name: user.name,
      email: user.email,
    }));
  } catch (e) {
    console.error("Error searching Authentik users:", e);
    return [];
  }
}

export async function addAdmin(rawAuthentikId: string, username: string, email: string) {
  const session = await verifyAdmin();
  const authentikId = String(rawAuthentikId);
  
  if (!authentikId || !username) {
    throw new Error("ID and username are required");
  }
  
  // Check if already an admin
  const existing = await db.query.admins.findFirst({
    where: eq(admins.authentikId, authentikId),
  });
  
  if (existing) {
    return;
  }
  
  await db.insert(admins).values({
    authentikId,
    username,
    email: email || null,
    addedBy: session.user?.name || session.user?.email || "Admin",
  });
  
  revalidatePath("/settings");
}

export async function removeAdmin(id: string) {
  const session = await verifyAdmin();
  
  // Don't allow removing yourself
  const admin = await db.query.admins.findFirst({
    where: eq(admins.id, id),
  });
  
  if (!admin) return;
  
  if (
    (session.user?.email && admin.email === session.user.email) ||
    String(admin.authentikId) === String((session.user as any)?.id)
  ) {
    throw new Error("Cannot remove yourself");
  }
  
  await db.delete(admins).where(eq(admins.id, id));
  revalidatePath("/settings");
}
