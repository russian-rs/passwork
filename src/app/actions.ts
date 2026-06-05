"use server";

import { db } from "@/db";
import { credentials, categories, sharedSecrets, admins } from "@/db/schema";
import { encrypt, decrypt } from "@/lib/encryption";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { eq, or } from "drizzle-orm";
import { getAverageColor } from "fast-average-color-node";
import { TOTP } from "otpauth";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export async function authenticate() {
  await signIn("authentik", { redirectTo: "/" });
}

// Verify auth before any action and return session
async function verifyAuth() {
  const session = await auth();
  if (!session || !session.user || (session as any).error) {
    redirect("/auth/signin");
  }
  return session;
}

export async function verifyAdmin() {
  const session = await verifyAuth();
  const rawUserId = (session.user as any)?.id;
  if (!rawUserId) {
    throw new Error("Unauthorized");
  }
  
  const userId = String(rawUserId);
  
  const allAdmins = await db.select().from(admins).limit(1);
  if (allAdmins.length === 0) {
    let finalAuthentikId = userId;
    if (session.user?.email) {
      try {
        const authentikUrl = process.env.AUTHENTIK_URL?.replace(/\/$/, "");
        const apiKey = process.env.AUTHENTIK_API_KEY;
        if (authentikUrl && apiKey) {
          const res = await fetch(`${authentikUrl}/api/v3/core/users/?search=${encodeURIComponent(session.user.email)}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.results?.[0]) {
              const u = data.results[0];
              finalAuthentikId = String(u.uid || u.pk || u.id);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch real uid for bootstrap", e);
      }
    }

    await db.insert(admins).values({
      authentikId: finalAuthentikId,
      username: session.user?.name || session.user?.email || "Admin",
      email: session.user?.email || null,
      addedBy: "system",
    });
    return session;
  }
  
  let admin = await db.query.admins.findFirst({
    where: session.user?.email
      ? or(
          eq(admins.authentikId, userId),
          eq(admins.email, session.user.email)
        )
      : eq(admins.authentikId, userId),
  });
  

  
  if (!admin) {
    throw new Error("Forbidden: Admin access required");
  }
  
  return session;
}

export async function createCredential(formData: FormData) {
  const session = await verifyAdmin();
  const userName = session.user?.name || session.user?.email || "Unknown User";
  
  const title = formData.get("title") as string;
  const username = formData.get("username") as string;
  const passwordRaw = formData.get("password") as string;
  const url = formData.get("url") as string;
  const totpSecretRaw = formData.get("totpSecret") as string;
  const notes = formData.get("notes") as string;
  const categoryId = formData.get("categoryId") as string;
  const iconFile = formData.get("icon") as File | null;
  
  let customIconBase64: string | null = null;
  let dominantColor: string | null = null;

  if (iconFile && iconFile.size > 0) {
    const buffer = Buffer.from(await iconFile.arrayBuffer());
    customIconBase64 = `data:${iconFile.type || "image/png"};base64,${buffer.toString("base64")}`;
    try {
      const color = await getAverageColor(buffer);
      dominantColor = color.hex;
    } catch (e) {
      console.warn("Failed to extract color from custom icon", e);
    }
  } else if (url) {
    try {
      const domain = new URL(url).hostname;
      const res = await fetch(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        const color = await getAverageColor(buffer);
        // Only use color if it's not a generic grey/white
        if (color.hex !== "#f2f2f2" && color.hex !== "#ffffff") {
          dominantColor = color.hex;
        }
      }
    } catch (e) {
      console.warn("Failed to extract color from favicon", e);
    }
  }
  
  if (!title || !passwordRaw) {
    throw new Error("Title and password are required");
  }

  let finalTotpSecret: string | null = null;
  if (totpSecretRaw) {
    finalTotpSecret = totpSecretRaw.replace(/\s+/g, '').toUpperCase();
    try {
      new TOTP({ secret: finalTotpSecret });
    } catch (e) {
      throw new Error("Invalid TOTP secret provided");
    }
  }
  
  await db.insert(credentials).values({
    title,
    username: username || null,
    passwordEncrypted: encrypt(passwordRaw),
    url: url || null,
    totpSecretEncrypted: finalTotpSecret ? encrypt(finalTotpSecret) : null,
    notes: notes || null,
    categoryId: categoryId || null,
    customIcon: customIconBase64,
    dominantColor,
    createdBy: userName,
    updatedBy: userName,
  });
  
  revalidatePath("/");
}

export async function getCredentialDecrypted(id: string) {
  await verifyAuth();
  
  const item = await db.query.credentials.findFirst({
    where: (credentials, { eq }) => eq(credentials.id, id),
  });
  
  if (!item) {
    throw new Error("Not found");
  }
  
  return {
    ...item,
    passwordDecrypted: decrypt(item.passwordEncrypted),
    hasTotp: !!item.totpSecretEncrypted,
  };
}

export async function updateCredential(id: string, formData: FormData) {
  const session = await verifyAdmin();
  const userName = session.user?.name || session.user?.email || "Unknown User";
  
  const title = formData.get("title") as string;
  const username = formData.get("username") as string;
  const passwordRaw = formData.get("password") as string;
  const url = formData.get("url") as string;
  const totpSecretRaw = formData.get("totpSecret") as string;
  const notes = formData.get("notes") as string;
  const categoryId = formData.get("categoryId") as string;
  const iconFile = formData.get("icon") as File | null;
  
  let customIconBase64: string | undefined = undefined;
  let dominantColor: string | undefined = undefined;

  if (iconFile && iconFile.size > 0) {
    const buffer = Buffer.from(await iconFile.arrayBuffer());
    customIconBase64 = `data:${iconFile.type || "image/png"};base64,${buffer.toString("base64")}`;
    try {
      const color = await getAverageColor(buffer);
      dominantColor = color.hex;
    } catch (e) {
      console.warn("Failed to extract color from custom icon", e);
    }
  } else if (url) {
    try {
      const domain = new URL(url).hostname;
      const res = await fetch(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        const color = await getAverageColor(buffer);
        if (color.hex !== "#f2f2f2" && color.hex !== "#ffffff") {
          dominantColor = color.hex;
        }
      }
    } catch (e) {
      console.warn("Failed to extract color from favicon", e);
    }
  }
  
  if (!title || !passwordRaw) {
    throw new Error("Title and password are required");
  }
  
  const updateData: any = {
    title,
    username: username || null,
    passwordEncrypted: encrypt(passwordRaw),
    url: url || null,
    notes: notes || null,
    categoryId: categoryId || null,
    updatedBy: userName,
    updatedAt: new Date(),
  };

  if (totpSecretRaw === "CLEAR") {
    updateData.totpSecretEncrypted = null;
  } else if (totpSecretRaw) {
    const finalTotpSecret = totpSecretRaw.replace(/\s+/g, '').toUpperCase();
    try {
      new TOTP({ secret: finalTotpSecret });
    } catch (e) {
      throw new Error("Invalid TOTP secret provided");
    }
    updateData.totpSecretEncrypted = encrypt(finalTotpSecret);
  }

  if (customIconBase64 !== undefined) updateData.customIcon = customIconBase64;
  if (dominantColor !== undefined) updateData.dominantColor = dominantColor;

  await db.update(credentials).set(updateData).where(eq(credentials.id, id));
  
  revalidatePath("/");
}

export async function getCurrentTotp(id: string) {
  await verifyAuth();
  
  const item = await db.query.credentials.findFirst({
    where: (credentials, { eq }) => eq(credentials.id, id),
  });
  
  if (!item || !item.totpSecretEncrypted) {
    return null;
  }
  
  const secret = decrypt(item.totpSecretEncrypted);
  
  const totp = new TOTP({
    issuer: item.title,
    label: item.username || "user",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret,
  });
  
  const code = totp.generate();
  const epoch = Math.floor(Date.now() / 1000);
  const remaining = 30 - (epoch % 30);
  
  return { code, remaining };
}

export async function createCategory(formData: FormData) {
  await verifyAdmin();
  
  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  
  if (!name) return;
  
  await db.insert(categories).values({ 
    name,
    color: color || null,
  });
  
  revalidatePath("/");
}

export async function updateCategoryColor(id: string, formData: FormData) {
  await verifyAdmin();
  const color = formData.get("color") as string;
  if (!id || !color) return;

  await db.update(categories)
    .set({ color })
    .where(eq(categories.id, id));
  
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  await verifyAdmin();
  if (!id) return;

  // Since categoryId on credentials has ON DELETE SET NULL, 
  // Postgres will automatically detach credentials from this category.
  await db.delete(categories).where(eq(categories.id, id));
  
  revalidatePath("/");
}

export async function createSharedSecret(text: string, expiresInHours: number) {
  const session = await verifyAuth();
  // Generate a short 12-character hex code instead of a long UUID
  const id = require("crypto").randomBytes(6).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  
  await db.insert(sharedSecrets).values({
    id,
    secretEncrypted: encrypt(text),
    expiresAt,
    createdBy: session.user?.name || "Unknown",
  });
  
  return id;
}

export async function revealSharedSecret(id: string) {
  const session = await auth(); // We don't enforce login here
  
  const record = await db.query.sharedSecrets.findFirst({
    where: eq(sharedSecrets.id, id),
  });
  
  if (!record) return null;
  
  if (record.expiresAt.getTime() < Date.now()) {
    // Expired
    await db.delete(sharedSecrets).where(eq(sharedSecrets.id, id));
    return null;
  }
  
  const decrypted = decrypt(record.secretEncrypted);
  
  // Burn the secret if not logged in
  if (!session?.user) {
    await db.delete(sharedSecrets).where(eq(sharedSecrets.id, id));
  }
  
  return decrypted;
}

export async function deleteCredential(id: string) {
  await verifyAdmin();
  if (!id) return;
  await db.delete(credentials).where(eq(credentials.id, id));
  revalidatePath("/");
}
