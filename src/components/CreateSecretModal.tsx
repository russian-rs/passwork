"use client";

import { useState } from "react";
import { X, Copy, Check, Link as LinkIcon, ShieldAlert } from "lucide-react";
import { createSharedSecret } from "@/app/actions";
import { useTranslation } from "@/i18n/I18nProvider";

export function CreateSecretModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [expiresIn, setExpiresIn] = useState(24);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const id = await createSharedSecret(text, expiresIn);
      const link = `${window.location.origin}/secret/${id}`;
      setGeneratedLink(link);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setText("");
    setExpiresIn(24);
    setGeneratedLink(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="glass-card w-full max-w-md relative z-10 flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <ShieldAlert className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{t("shareSecret")}</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!generatedLink ? (
            <>
              <p className="text-sm text-zinc-400">
                {t("shareSecretDesc")}
              </p>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t("secretInfo")}</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  placeholder={t("secretContentPlaceholder")}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t("expiration")}</label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none"
                >
                  <option value={1}>{t("expires1h")}</option>
                  <option value={24}>{t("expires24h")}</option>
                  <option value={168}>{t("expires7d")}</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !text.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
                >
                  {loading ? t("creating") : t("createLink")}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6 text-center py-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">{t("secretCreated")}</h3>
              </div>
              
              <div className="relative">
                <input 
                  type="text" 
                  readOnly 
                  value={generatedLink}
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>
              
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? t("copied") : t("copyLink")}
              </button>

              <button
                onClick={handleClose}
                className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-all"
              >
                {t("close")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
