"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "@/i18n/I18nProvider";

export function Footer({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  
  return (
    <div className={`flex flex-col items-center gap-4 text-zinc-500 z-10 ${className}`}>
      <div className="flex items-center gap-6">
        <a 
          href="https://russian.rs" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-white transition-colors"
          title="Website"
        >
          <Globe className="w-5 h-5" />
        </a>
        <a 
          href="https://t.me/relocateserbia" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-[#2AABEE] transition-colors"
          title="Telegram Channel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.304-.346-.11l-6.4 4.026-2.76-.86c-.6-.188-.612-.6.126-.89l10.814-4.17c.502-.18.966.113.82.724z" />
          </svg>
        </a>
      </div>
      <div className="text-sm font-medium">{t("copyright")}</div>
    </div>
  );
}
