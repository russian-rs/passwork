"use client";

import { useState } from "react";
import { Shield, Key, Plus, Search, Folder, LogOut, X, Clock } from "lucide-react";
import { signOut } from "next-auth/react";
import { CreateCredentialModal } from "./CreateCredentialModal";
import { ViewCredentialModal } from "./ViewCredentialModal";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { EditCategoryModal } from "./EditCategoryModal";
import { CreateSecretModal } from "./CreateSecretModal";
import { Share2, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/i18n/I18nProvider";

type Credential = {
  id: string;
  title: string;
  username: string | null;
  categoryId: string | null;
  url: string | null;
  customIcon: string | null;
  dominantColor: string | null;
  hasTotp: boolean;
};

type Category = {
  id: string;
  name: string;
  color: string | null;
};

export function Dashboard({ 
  credentials, 
  categories,
  userName,
  userEmail,
  isAdmin = false
}: { 
  credentials: Credential[];
  categories: Category[];
  userName?: string | null;
  userEmail?: string | null;
  isAdmin?: boolean;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSecretOpen, setIsSecretOpen] = useState(false);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useTranslation();

  const displayedCredentials = credentials.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) || 
        (c.username && c.username.toLowerCase().includes(q))
      );
    }
    if (activeCategory) {
      return c.categoryId === activeCategory;
    }
    return true;
  });

  const currentCategory = activeCategory ? categories.find(c => c.id === activeCategory) : null;

  return (
    <div className="min-h-screen flex text-foreground relative">
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`w-80 glass border-r flex flex-col fixed md:relative z-50 md:z-0 h-[100dvh] transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 border-b border-white/5">
          <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 via-fuchsia-500 to-orange-500 pb-1">
            Passwork
          </h1>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          <div>
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 px-2">{t("vaults")}</h2>
            <ul className="space-y-1.5">
              <li>
                <button 
                  onClick={() => { setActiveCategory(null); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                    activeCategory === null 
                      ? "bg-white/10 text-white" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  <Key className={`w-5 h-5 ${activeCategory === null ? "text-primary" : "text-zinc-400"}`} />
                  {t("allItems")}
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t("categories")}</h2>
              {isAdmin && (
                <button 
                  onClick={() => setIsCategoryOpen(true)}
                  className="text-zinc-400 hover:text-white transition-colors p-1"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
            <ul className="space-y-1.5">
              {categories.map(cat => (
                <li 
                  key={cat.id} 
                  className={`group flex items-stretch rounded-lg transition-all cursor-pointer border-l-2 border-transparent overflow-hidden ${
                    activeCategory === cat.id ? (cat.color ? "" : "bg-white/10 border-white/20") : "hover:bg-white/5"
                  }`}
                  style={
                    activeCategory === cat.id && cat.color
                      ? {
                          background: `linear-gradient(90deg, ${cat.color}25 0%, rgba(255,255,255,0.02) 100%)`,
                          borderColor: cat.color,
                        }
                      : {}
                  }
                >
                  <button 
                    onClick={() => { setActiveCategory(cat.id); setIsMobileMenuOpen(false); }}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 text-base font-medium transition-colors ${
                      activeCategory === cat.id ? (cat.color ? "" : "text-white") : "text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  >
                    <Folder 
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${activeCategory === cat.id && !cat.color ? "text-primary" : (!cat.color ? "text-zinc-400" : "")}`} 
                      style={cat.color ? { color: cat.color } : {}}
                    />
                    <span 
                      className="truncate flex-1 text-left transition-colors"
                      style={activeCategory === cat.id && cat.color ? { color: cat.color, textShadow: `0 0 10px ${cat.color}40` } : {}}
                    >
                      {cat.name}
                    </span>
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategory(cat);
                      }}
                      className={`px-3 flex items-center justify-center transition-colors ${
                        activeCategory === cat.id
                          ? "text-zinc-400 hover:text-white"
                          : "text-transparent group-hover:text-zinc-400 hover:!text-white"
                      }`}
                      title={t("editCategory")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                  )}
                </li>
              ))}
              {categories.length === 0 && (
                <p className="px-4 py-2 text-sm text-zinc-500">{t("noCategories")}</p>
              )}
            </ul>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/5 flex gap-2 justify-center">
          {(["en", "ru", "sr"] as const).map(lang => (
            <button 
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 text-xs font-bold rounded-md uppercase ${language === lang ? 'bg-primary text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              {lang}
            </button>
          ))}
        </div>
        
        {isAdmin && (
          <div className="p-2 border-t border-white/5">
            <Link 
              href="/settings"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-zinc-400 hover:text-white hover:bg-white/5"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings className="w-5 h-5" />
              {t("settings")}
            </Link>
          </div>
        )}

        <div className="p-6 border-t border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-lg font-bold shadow-lg flex-shrink-0">
            {userName?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-white truncate">{userName}</p>
            <p className="text-sm text-zinc-400 truncate">{userEmail}</p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-zinc-400 hover:text-red-400 transition-colors flex-shrink-0"
            title={t("signOut")}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 md:h-20 glass border-b flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white flex-shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="max-w-md w-full flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder={t("searchVault")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-zinc-500 text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                title={t("clearSearch")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setIsSecretOpen(true)}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-medium transition-all active:scale-95 text-xs md:text-sm ml-2 md:ml-4 shadow-lg flex-shrink-0 whitespace-nowrap"
            title={t("createOneTimeSecret")}
          >
            <Share2 className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">{t("shareSecret")}</span>
            <span className="sm:hidden">{t("share")}</span>
          </button>
        </header>

        {/* Credentials Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col">
          <div className="mb-6 md:mb-8 flex flex-col items-start gap-4 md:gap-6 flex-shrink-0">
            {isAdmin && (
              <button 
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all active:scale-95 shadow-xl shadow-purple-500/25 border border-white/10 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                {t("addPassword")}
              </button>
            )}
            <div className="flex items-center gap-3">
              {currentCategory ? (
                <>
                  <Folder 
                    className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" 
                    style={currentCategory.color ? { color: currentCategory.color } : { color: '#a1a1aa' }} 
                  />
                  <h2 
                    className="text-xl md:text-2xl font-bold truncate"
                    style={
                      currentCategory.color
                        ? { color: currentCategory.color, textShadow: `0 0 15px ${currentCategory.color}40` }
                        : { color: 'white' }
                    }
                  >
                    {currentCategory.name}
                  </h2>
                </>
              ) : (
                <h2 className="text-xl md:text-2xl font-bold text-white">{t("vaultItems")}</h2>
              )}
            </div>
          </div>

          {displayedCredentials.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center pb-10">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <Shield className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                {activeCategory ? t("emptyCategory") : t("emptyVault")}
              </h3>
              {isAdmin && (
                <>
                  <p className="text-zinc-400 max-w-sm">
                    {activeCategory 
                      ? t("addToCategory") 
                      : t("addFirstPassword")}
                  </p>
                  <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="mt-6 bg-white/10 hover:bg-white/15 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
                  >
                    {t("addItem")}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {displayedCredentials.map(item => {
                const category = categories.find(c => c.id === item.categoryId);
                let domain = "";
                try {
                  if (item.url) {
                    domain = new URL(item.url).hostname;
                  }
                } catch (e) {
                  // Invalid URL, leave domain empty
                }
                
                return (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedCredentialId(item.id)}
                    className="glass-card p-3.5 md:p-5 cursor-pointer group flex flex-row md:flex-col items-center md:items-stretch relative overflow-hidden transition-all hover:-translate-y-1 gap-3.5 md:gap-0"
                    style={item.dominantColor ? {
                      background: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, ${item.dominantColor}15 100%)`,
                      borderColor: `${item.dominantColor}30`,
                      boxShadow: `0 4px 20px -2px ${item.dominantColor}10`
                    } : {}}
                  >
                    {/* Subtle top highlight line */}
                    {item.dominantColor && (
                      <div 
                        className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: item.dominantColor }}
                      />
                    )}
                    
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors shadow-inner overflow-hidden flex-shrink-0 md:mb-4 relative z-10">
                      {item.customIcon ? (
                        <img 
                          src={item.customIcon} 
                          alt={item.title}
                          className="w-5 h-5 md:w-6 md:h-6 object-contain"
                        />
                      ) : domain ? (
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} 
                          alt={domain}
                          className="w-5 h-5 md:w-6 md:h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Key className={`w-5 h-5 md:w-6 md:h-6 text-zinc-400 group-hover:text-primary transition-colors ${(item.customIcon || domain) ? 'hidden' : ''}`} />
                    </div>
                    
                    <div className="flex flex-1 min-w-0 flex-row items-center md:items-end justify-between gap-2 md:gap-3 md:mt-auto relative z-10">
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-base md:text-lg font-medium text-white mb-0 md:mb-1 truncate leading-tight md:leading-normal">{item.title}</h3>
                        <p className="text-xs md:text-sm text-zinc-500 truncate">{item.username || t("noUsername")}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        {category && (
                          <span 
                            className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 md:py-1 rounded-md border flex items-center shadow-lg whitespace-nowrap"
                            style={{
                              color: category.color || '#a1a1aa',
                              borderColor: category.color ? `${category.color}40` : 'rgba(255,255,255,0.05)',
                              backgroundColor: category.color ? `${category.color}15` : 'rgba(255,255,255,0.05)',
                              boxShadow: category.color ? `0 10px 15px -3px ${category.color}10` : 'none',
                            }}
                          >
                            {category.name}
                          </span>
                        )}

                        {item.hasTotp && (
                          <div 
                            className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 md:py-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 flex items-center gap-1 flex-shrink-0 shadow-lg shadow-indigo-500/10 whitespace-nowrap"
                            title="Two-Factor Authentication"
                          >
                            <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            2FA
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <CreateCredentialModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        categories={categories}
        initialCategoryId={activeCategory}
      />
      <ViewCredentialModal 
        credentialId={selectedCredentialId} 
        isOpen={!!selectedCredentialId} 
        onClose={() => setSelectedCredentialId(null)} 
        categories={categories}
        isAdmin={isAdmin}
      />
      <CreateCategoryModal
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        onCreated={() => setIsCategoryOpen(false)}
      />
      <EditCategoryModal
        category={editingCategory}
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onDeleted={() => {
          if (activeCategory === editingCategory?.id) {
            setActiveCategory(null);
          }
        }}
      />
      <CreateSecretModal
        isOpen={isSecretOpen}
        onClose={() => setIsSecretOpen(false)}
      />
    </div>
  );
}
