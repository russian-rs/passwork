"use client";

import { authenticate } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Shield, Globe } from "lucide-react";
import { useTranslation } from "@/i18n/I18nProvider";

export default function SignInPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      
      <div className="glass-card w-full max-w-md p-10 relative z-10 flex flex-col items-center text-center">
        <div className="w-24 h-24 flex items-center justify-center mb-6">
          <img src="/passwork.png" alt="Passwork Logo" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>
        
        <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 via-fuchsia-500 to-orange-500 mb-3 pb-1">
          Passwork
        </h1>
        <p className="text-zinc-400 mb-12 text-lg">{t("signInSubtitle")}</p>
        
        <form
          action={authenticate}
          className="w-full"
        >
          <button 
            type="submit" 
            className="w-full bg-white text-black hover:bg-zinc-200 transition-colors py-3.5 rounded-xl font-semibold shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            {t("signInBtn")}
          </button>
        </form>
        
        <p className="mt-8 text-xs text-zinc-500">
          {t("signInHelp")}
        </p>
      </div>

      {/* Footer */}
      <Footer className="absolute bottom-8" />
    </div>
  );
}
