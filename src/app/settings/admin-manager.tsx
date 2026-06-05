"use client";

import { useState, useEffect } from "react";
import { searchAuthentikUsers, addAdmin, removeAdmin } from "../admin_actions";
import { Search, Plus, Trash2, User, Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/i18n/I18nProvider";

export function SettingsTitle() {
  const { t } = useTranslation();
  return <h1 className="text-xl font-semibold">{t("settings")}</h1>;
}

export function AccessDenied() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-3">{t("accessDenied")}</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          {t("accessDeniedDesc")}
        </p>
        <Link 
          href="/"
          className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          {t("returnToVault")}
        </Link>
      </div>
    </div>
  );
}

export function AdminManager({ 
  initialAdmins,
  currentUserEmail,
  currentUserId
}: { 
  initialAdmins: any[],
  currentUserEmail: string | null,
  currentUserId: string | null
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setIsSearching(true);
        setError(null);
        try {
          const data = await searchAuthentikUsers(query);
          setResults(data);
          if (data.length === 0) {
            setError(t("noUsersFound"));
          }
        } catch (err: any) {
          console.error(err);
          setError(err.message || t("failedToSearch"));
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, t]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{t("administrators")}</h2>
        <p className="text-zinc-400 text-sm md:text-base">
          {t("adminsDesc")}
        </p>
      </div>

      <div className="space-y-10">
        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-3 uppercase tracking-wider">{t("addNewAdmin")}</h3>
        <div className="relative mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchAuthentik")}
              className="w-full bg-[#121212] border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" />
            )}
          </div>

          {(results.length > 0 || error) && query.length >= 3 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              {error && (
                <div className="text-red-400 text-sm p-4 bg-red-400/5">
                  {error}
                </div>
              )}

              {results.length > 0 && (
                <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                  {results.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-zinc-800 p-2.5 rounded-full">
                          <User className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{user.name || user.username}</div>
                          <div className="text-xs text-zinc-500">{user.email || user.username}</div>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await addAdmin(user.id, user.name || user.username, user.email || "");
                            setResults([]);
                            setQuery("");
                          } catch (err: any) {
                            setError(err.message || t("failedToAddAdmin"));
                          }
                        }}
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 p-2.5 rounded-lg transition-colors"
                        title={t("addAsAdmin")}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-300 mb-3 uppercase tracking-wider">{t("currentAdmins")}</h3>
        <div className="space-y-3">
          {initialAdmins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-500/20 p-2.5 rounded-full border border-indigo-500/30">
                  <User className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{admin.username}</div>
                  {admin.email && <div className="text-xs text-zinc-500">{admin.email}</div>}
                  <div className="text-[10px] text-zinc-600 mt-0.5">{t("addedBy")} {admin.addedBy}</div>
                </div>
              </div>
              {((currentUserEmail && admin.email === currentUserEmail) || 
                (currentUserId && String(admin.authentikId) === currentUserId)) ? (
                <div className="text-xs font-medium text-zinc-500 px-3 py-1 bg-white/5 rounded-lg border border-white/5 uppercase tracking-wider">
                  {t("you")}
                </div>
              ) : (
                <button
                  onClick={() => setAdminToDelete(admin.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2.5 rounded-lg transition-colors"
                  title={t("removeAdmin")}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          
          {initialAdmins.length === 0 && (
            <div className="text-sm text-zinc-500 p-6 text-center border border-dashed border-white/10 rounded-xl">
              {t("noAdminsConfigured")}
            </div>
          )}
        </div>
      </div>
      </div>
      
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => !isDeleting && setAdminToDelete(null)}
          />
          <div className="glass-card w-full max-w-[420px] relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-black/50 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <Trash2 className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{t("removeAdmin")}</h3>
              <p className="text-sm text-zinc-400 mb-6">{t("removeAdminConfirm")}</p>
              <div className="flex gap-3 w-full">
                <button 
                  type="button"
                  onClick={() => setAdminToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await removeAdmin(adminToDelete);
                      setAdminToDelete(null);
                    } catch (e: any) {
                      alert(e.message);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 py-3 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isDeleting ? t("deleting") : t("delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
