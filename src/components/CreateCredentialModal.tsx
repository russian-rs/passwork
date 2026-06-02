"use client";

import { useState, useRef, useEffect } from "react";
import { createCredential } from "@/app/actions";
import { X, ShieldCheck, KeyRound, Globe, FileText, Smartphone, Save, Dices, Check } from "lucide-react";
import { generatePassword } from "@/lib/utils";
import { useFormStatus } from "react-dom";
import { useTranslation } from "@/i18n/I18nProvider";

function SubmitButton({ disabledError }: { disabledError?: boolean }) {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <button
      type="submit"
      disabled={pending || disabledError}
      className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:active:scale-100"
    >
      <Save className="w-4 h-4" />
      {pending ? t("saving") : t("save")}
    </button>
  );
}

export function CreateCredentialModal({ 
  isOpen, 
  onClose,
  categories,
  initialCategoryId
}: { 
  isOpen: boolean; 
  onClose: () => void;
  categories: { id: string; name: string }[];
  initialCategoryId?: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState("");
  const [totpError, setTotpError] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setTitleTouched(false);
      setPassword("");
      setPasswordTouched(false);
      setTotpError(false);
      setUrlError(false);
      setFileName("");
    }
  }, [isOpen]);

  const handleTotpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val || val === "CLEAR") {
      setTotpError(false);
    } else {
      const clean = val.replace(/\s+/g, '');
      setTotpError(!/^([A-Za-z2-7]+=*)$/.test(clean));
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setUrlError(false);
      return;
    }
    try {
      new URL(val);
      setUrlError(false);
    } catch {
      setUrlError(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="glass-card w-full max-w-lg relative z-10 flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-white">{t("newItem")}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form 
            ref={formRef}
            action={async (formData) => {
              await createCredential(formData);
              formRef.current?.reset();
              onClose();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{t("title")} *</label>
              <input 
                name="title" 
                value={title}
                onChange={(e) => { setTitle(e.target.value); setTitleTouched(true); }}
                onBlur={() => setTitleTouched(true)}
                className={`w-full bg-black/50 border ${titleTouched && title.trim() === "" ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary/50'} rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2`}
                placeholder={t("titlePlaceholder")}
              />
              {titleTouched && title.trim() === "" && (
                <p className="text-[11px] text-red-400 mt-2 ml-1">{t("requiredField")}</p>
              )}
            </div>

            {categories && categories.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t("category")}</label>
                <select 
                  name="categoryId" 
                  defaultValue={initialCategoryId || ""}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                >
                  <option value="">{t("noCategory")}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{t("username")}</label>
              <input 
                name="username" 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={t("usernamePlaceholder")}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{t("password")} *</label>
              <div className="relative">
                <input 
                  name="password" 
                  type="text"
                  autoComplete="new-password"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                  onBlur={() => setPasswordTouched(true)}
                  className={`w-full bg-black/50 border ${passwordTouched && password === "" ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary/50'} rounded-xl pl-10 pr-12 py-3 text-white focus:outline-none focus:ring-2 font-mono`}
                  placeholder="••••••••••••••••"
                />
                <KeyRound className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${passwordTouched && password === "" ? 'text-red-400' : 'text-zinc-500'}`} />
                <button
                  type="button"
                  onClick={() => {
                    const newPw = generatePassword();
                    setPassword(newPw);
                    setPasswordTouched(true);
                    handleCopy(newPw, "generate");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors focus:outline-none"
                  title={t("generatePassword")}
                >
                  {copiedField === "generate" ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Dices className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordTouched && password === "" && (
                <p className="text-[11px] text-red-400 mt-2 ml-1">{t("requiredField")}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{t("totpSecret")} <span className="text-zinc-600">({t("optional")})</span></label>
              <div className="relative">
                <input 
                  name="totpSecret" 
                  autoComplete="off"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  onChange={handleTotpChange}
                  className={`w-full bg-black/50 border ${totpError ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary/50'} rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 font-mono`}
                  placeholder={t("totpEditPlaceholderNoTotp")}
                />
                <Smartphone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${totpError ? 'text-red-400' : 'text-zinc-500'}`} />
              </div>
              {totpError && (
                <p className="text-[11px] text-red-400 mt-2 ml-1">
                  {t("invalidTotpSecret")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{t("url")} <span className="text-zinc-600">({t("optional")})</span></label>
              <div className="relative">
                <input 
                  name="url" 
                  type="url"
                  onChange={handleUrlChange}
                  className={`w-full bg-black/50 border ${urlError ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary/50'} rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2`}
                  placeholder="https://console.aws.amazon.com"
                />
                <Globe className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${urlError ? 'text-red-400' : 'text-zinc-500'}`} />
              </div>
              {urlError && (
                <p className="text-[11px] text-red-400 mt-2 ml-1">
                  {t("invalidUrl")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{t("notes")}</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <textarea 
                  name="notes" 
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                  placeholder={t("additionalInfo")}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">{t("customIcon")} <span className="text-zinc-600">({t("optional")})</span></label>
              <div className="relative">
                <input 
                  id="customIconCreate"
                  name="customIcon" 
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                />
                <label 
                  htmlFor="customIconCreate"
                  className="flex items-center gap-4 w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-400 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span className="py-1 px-4 rounded-full bg-primary/20 text-primary text-xs font-semibold">{t("chooseFile")}</span>
                  <span className="truncate">{fileName || t("noFileChosen")}</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <SubmitButton disabledError={totpError || urlError || title.trim() === "" || password === ""} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
