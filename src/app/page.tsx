import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { credentials, categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Dashboard } from "@/components/Dashboard";

export default async function Home() {
  const session = await auth();
  
  if (!session || (session as any).error) {
    redirect("/auth/signin");
  }

  // Fetch data sorted alphabetically
  const allCategories = await db.select().from(categories).orderBy(asc(categories.name));
  const allCredentials = await db.select({
    id: credentials.id,
    title: credentials.title,
    username: credentials.username,
    categoryId: credentials.categoryId,
    url: credentials.url,
    customIcon: credentials.customIcon,
    dominantColor: credentials.dominantColor,
    totpSecretEncrypted: credentials.totpSecretEncrypted,
  }).from(credentials).orderBy(asc(credentials.title));

  const credentialsWithTotpFlag = allCredentials.map(c => ({
    id: c.id,
    title: c.title,
    username: c.username,
    categoryId: c.categoryId,
    url: c.url,
    customIcon: c.customIcon,
    dominantColor: c.dominantColor,
    hasTotp: !!c.totpSecretEncrypted,
  }));

  return (
    <Dashboard 
      credentials={credentialsWithTotpFlag}
      categories={allCategories}
      userName={session.user?.name}
      userEmail={session.user?.email}
    />
  );
}
