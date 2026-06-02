"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Copy, Check, Flame, Loader2 } from "lucide-react";
import { revealSharedSecret } from "@/app/actions";
import { useTranslation } from "@/i18n/I18nProvider";

export function SecretViewer({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [secretText, setSecretText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isBlurred, setIsBlurred] = useState(true);
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    let mounted = true;
    
    const fetchSecret = async () => {
      try {
        const decrypted = await revealSharedSecret(id);
        if (mounted) {
          if (decrypted) {
            setSecretText(decrypted);
          } else {
            setError(t("expiredSecretDesc"));
          }
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          setError(t("errorFetching"));
          setLoading(false);
        }
      }
    };
    
    fetchSecret();
    
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleCopy = () => {
    if (secretText) {
      navigator.clipboard.writeText(secretText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {(["en", "ru", "sr"] as const).map(lang => (
          <button 
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1 text-xs font-bold rounded-md uppercase ${language === lang ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5 bg-black/40 border border-white/10'}`}
          >
            {lang}
          </button>
        ))}
      </div>
      <div className="glass-card w-full max-w-lg p-6 md:p-10 flex flex-col items-center text-center relative z-10">
        <div className="w-20 h-20 bg-orange-500/20 rounded-3xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-orange-500/20 border border-orange-500/30">
          <ShieldAlert className="w-10 h-10 text-orange-400" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white mb-3">
          {t("secureMessage")}
        </h1>

      {loading ? (
        <div className="py-12 flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-4" />
          <p className="text-zinc-400">{t("decrypting")}</p>
        </div>
      ) : error ? (
        <div className="text-red-400 mt-4 bg-red-500/10 border border-red-500/20 p-6 rounded-2xl w-full">
          <Flame className="w-8 h-8 mx-auto mb-3 opacity-80" />
          <p className="font-medium">{error}</p>
        </div>
      ) : (
        <div className="w-full space-y-6 mt-4">
          <p className="text-sm text-zinc-400 mb-6 max-w-sm mx-auto leading-relaxed">
            {t("saveSecurelyDesc")}
          </p>
          
          <div className="relative group text-left">
            <div className="relative group w-full">
              <div 
                onClick={() => setIsBlurred(false)}
                className={`w-full bg-black/50 border border-white/10 rounded-2xl p-4 md:p-6 min-h-[120px] font-mono text-sm md:text-base text-white transition-all duration-500 ${isBlurred ? 'blur-md cursor-pointer select-none hover:blur-sm' : ''}`}
                style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
              >
                {secretText}
              </div>
            </div>
            {isBlurred && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-black/60 px-4 py-2 rounded-lg text-white font-medium backdrop-blur-sm border border-white/10 shadow-xl">
                  {t("clickToReveal")}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-xl font-semibold transition-all active:scale-95"
          >
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            {copied ? t("copied") : t("copyToClipboard")}
          </button>
        </div>
      )}
    </div>
    </>
  );
}
