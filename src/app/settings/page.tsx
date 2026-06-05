import { db } from "@/db";
import { admins } from "@/db/schema";
import { AdminManager, SettingsTitle, AccessDenied } from "./admin-manager";
import { verifyAdmin } from "../actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Settings - Passwork",
};

export default async function SettingsPage() {
  let isAdmin = false;
  let currentUserEmail: string | null = null;
  let currentUserId: string | null = null;
  
  try {
    const session = await verifyAdmin();
    isAdmin = true;
    currentUserEmail = session?.user?.email || null;
    currentUserId = session?.user?.id || null;
  } catch (e) {
    isAdmin = false;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black/95 text-white flex flex-col">
        <header className="h-16 md:h-20 glass border-b border-white/10 flex items-center px-4 md:px-8 z-10 sticky top-0 gap-4">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <SettingsTitle />
        </header>
        <AccessDenied />
      </div>
    );
  }

  const currentAdmins = await db.query.admins.findMany({
    orderBy: (admins, { asc }) => [asc(admins.createdAt)],
  });

  return (
    <div className="min-h-screen bg-black/95 text-white flex flex-col">
      <header className="h-16 md:h-20 glass border-b border-white/10 flex items-center px-4 md:px-8 z-10 sticky top-0 gap-4">
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <SettingsTitle />
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-black border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            

            
            <AdminManager 
              initialAdmins={currentAdmins} 
              currentUserEmail={currentUserEmail}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
