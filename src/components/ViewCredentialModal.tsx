"use client";

import { useState, useEffect, useRef } from "react";
import { X, Shield, Copy, Check, ExternalLink, RefreshCw, Edit2, Save, KeyRound, Smartphone, Globe, FileText, Dices, Eye, EyeOff } from "lucide-react";
import { getCredentialDecrypted, updateCredential, getCurrentTotp, deleteCredential } from "@/app/actions";
import { generatePassword } from "@/lib/utils";
import { useFormStatus } from "react-dom";
import { useTranslation } from "@/i18n/I18nProvider";

function SubmitEditButton({ disabledError }: { disabledError?: boolean }) {
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

type DecryptedCredential = {
  id: string;
  title: string;
  username: string | null;
  url: string | null;
  notes: string | null;
  passwordDecrypted: string;
  hasTotp: boolean;
  categoryId: string | null;
  dominantColor: string | null;
  customIcon: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
};

export function ViewCredentialModal({
  credentialId,
  isOpen,
  onClose,
  categories,
}: {
  credentialId: string | null;
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
}) {
  const [data, setData] = useState<DecryptedCredential | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState<string | null>(null);
  const [totpProgress, setTotpProgress] = useState(100);
  const [fileName, setFileName] = useState("");
  const [totpError, setTotpError] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (data && isEditing) {
      setTitle(data.title);
      setPassword(data.passwordDecrypted);
      setTitleTouched(false);
      setPasswordTouched(false);
      setUrlError(false);
      setTotpError(false);
    }
  }, [data, isEditing]);

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

  let domain = "";
  try {
    if (data?.url) {
      domain = new URL(data.url).hostname;
    }
  } catch (e) {
    // Ignore invalid url
  }

  useEffect(() => {
    if (isOpen && credentialId) {
      setLoading(true);
      getCredentialDecrypted(credentialId)
        .then((res) => {
          setData(res as DecryptedCredential);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setData(null);
      setIsEditing(false);
      setIsDeleting(false);
      setDeleteConfirmTitle("");
      setTotpCode(null);
      setShowPassword(false);
    }
  }, [isOpen, credentialId]);

  useEffect(() => {
    if (!data?.hasTotp) {
      setTotpCode(null);
      return;
    }

    let mounted = true;
    let timerId: NodeJS.Timeout;

    const fetchTotp = async () => {
      try {
        const res = await getCurrentTotp(data.id);
        if (res && mounted) {
          setTotpCode(res.code);
          
          // Fetch again exactly when it expires (plus a small 100ms padding to be safe)
          timerId = setTimeout(fetchTotp, (res.remaining * 1000) + 100);
        }
      } catch (e) {
        console.error("Failed to fetch TOTP", e);
      }
    };

    fetchTotp();

    return () => {
      mounted = false;
      clearTimeout(timerId);
    };
  }, [data?.hasTotp, data?.id]);

  // Local interval just for the progress bar animation
  useEffect(() => {
    if (!totpCode) return;
    const updateProgress = () => {
      const epoch = Math.floor(Date.now() / 1000);
      const remaining = 30 - (epoch % 30);
      setTotpProgress((remaining / 30) * 100);
    };
    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [totpCode]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        className="glass-card w-full max-w-lg relative z-10 flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden"
        style={data?.dominantColor ? {
          background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, ${data.dominantColor}15 100%)`,
          borderColor: `${data.dominantColor}30`,
          boxShadow: `0 8px 32px -4px ${data.dominantColor}15`
        } : {}}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20">
              {data?.customIcon ? (
                <img 
                  src={data.customIcon} 
                  alt={data.title}
                  className="w-5 h-5 object-contain"
                />
              ) : domain ? (
                <img 
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} 
                  alt={domain}
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Shield className={`w-5 h-5 text-primary ${(data?.customIcon || domain) ? 'hidden' : ''}`} />
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {isEditing ? t("editItem") : data?.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {data && !loading && (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors flex-shrink-0 ${
                  isEditing ? "text-primary bg-primary/10" : "text-zinc-400 hover:text-white"
                }`}
                title={t("edit")}
              >
                {isEditing ? (
                   <span className="text-xs font-medium">{t("cancel")}</span>
                ) : (
                   <Edit2 className="w-4 h-4" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
              <div className="flex items-center gap-3 text-white">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="font-medium">{t("loading")}</span>
              </div>
            </div>
          ) : null}
          {isDeleting && data ? (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <p className="text-red-400 font-medium mb-2 text-lg">{t("deleteConfirmText")}</p>
                <p className="text-sm text-zinc-400 mb-6">{t("typeNameToDelete")} <span className="font-bold text-white select-all">{data.title}</span></p>
                <input 
                  type="text"
                  value={deleteConfirmTitle}
                  onChange={(e) => setDeleteConfirmTitle(e.target.value)}
                  className="w-full bg-black/50 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 mb-6 text-center"
                  placeholder={data.title}
                />
                <div className="flex gap-3 justify-center">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsDeleting(false);
                      setDeleteConfirmTitle("");
                    }}
                    className="px-6 py-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button 
                    type="button"
                    disabled={deleteConfirmTitle !== data.title}
                    onClick={async () => {
                      await deleteCredential(data.id);
                      onClose();
                    }}
                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500 shadow-lg shadow-red-500/20"
                  >
                    {t("delete")}
                  </button>
                </div>
              </div>
            </div>
          ) : isEditing && data ? (
            <form 
              ref={formRef}
              action={async (formData) => {
                if (!credentialId) return;
                await updateCredential(credentialId, formData);
                
                // Re-fetch decrypted data to update view
                setLoading(true);
                const res = await getCredentialDecrypted(credentialId);
                setData(res as DecryptedCredential);
                setLoading(false);
                setIsEditing(false);
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
                    defaultValue={data.categoryId || ""}
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
                  defaultValue={data.username || ""}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t("password")}</label>
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
                    className={`w-full bg-black/50 border ${passwordTouched && password === "" ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary/50'} rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 font-mono`}
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
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t("website")}</label>
                <div className="relative">
                  <input 
                    name="url" 
                    type="url"
                    defaultValue={data.url || ""}
                    onChange={handleUrlChange}
                    className={`w-full bg-black/50 border ${urlError ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary/50'} rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2`}
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
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t("totpSecret")} <span className="text-zinc-600">({t("optional")})</span></label>
                <div className="relative">
                  <input 
                    name="totpSecret" 
                    autoComplete="off"
                    data-1p-ignore="true"
                    data-lpignore="true"
                    onChange={handleTotpChange}
                    placeholder={data.hasTotp ? t("totpEditPlaceholderHasTotp") : t("totpEditPlaceholderNoTotp")}
                    className={`w-full bg-black/50 border ${totpError ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary/50'} rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 font-mono`}
                  />
                  <Smartphone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${totpError ? 'text-red-400' : 'text-zinc-500'}`} />
                </div>
                {totpError ? (
                  <p className="text-[11px] text-red-400 mt-2 ml-1">
                    {t("invalidTotpSecret")}
                  </p>
                ) : data.hasTotp ? (
                  <p className="text-[11px] text-zinc-500 mt-2 ml-1">
                    {t("totpEditHelperHasTotp")}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t("notes")}</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <textarea 
                    name="notes" 
                    rows={3}
                    defaultValue={data.notes || ""}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">{t("customIcon")} <span className="text-zinc-600">({t("optional")})</span></label>
                <div className="relative">
                  <input 
                    id="customIconUpdate"
                    name="icon" 
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                  />
                  <label 
                    htmlFor="customIconUpdate"
                    className="flex items-center gap-4 w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-400 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <span className="py-1 px-4 rounded-full bg-primary/20 text-primary text-xs font-semibold">{t("chooseFile")}</span>
                    <span className="truncate">{fileName || t("noFileChosen")}</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/10 flex justify-between items-center">
                <button 
                  type="button" 
                  onClick={() => setIsDeleting(true)} 
                  className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium px-2 py-2"
                >
                  {t("deleteItem")}
                </button>
                <SubmitEditButton disabledError={totpError || urlError || title.trim() === "" || password === ""} />
              </div>
            </form>
          ) : data ? (
            <div className="space-y-6">
              {data.username && (
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                    {t("username")}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white font-mono text-sm tracking-wider flex items-center justify-between">
                      <span className="truncate">{data.username || t("noUsername")}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(data.username!, "username")}
                      className="w-12 h-12 flex-shrink-0 bg-primary/20 hover:bg-primary/30 border border-primary/20 rounded-xl flex items-center justify-center text-primary transition-all active:scale-95 shadow-lg shadow-primary/10"
                    >
                      {copiedField === "username" ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  {t("password")}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white font-mono text-sm tracking-wider flex items-center justify-between group">
                    <span>{showPassword ? data.passwordDecrypted : "••••••••••••"}</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-zinc-500 hover:text-white transition-colors"
                      title={showPassword ? t("hide") : t("reveal")}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleCopy(data.passwordDecrypted, "password")}
                    className="w-12 h-12 bg-primary/20 hover:bg-primary/30 border border-primary/20 rounded-xl flex items-center justify-center text-primary transition-all active:scale-95 shadow-lg shadow-primary/10"
                  >
                    {copiedField === "password" ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {totpCode && (
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-black/20">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                      style={{ width: `${totpProgress}%` }}
                    />
                  </div>
                  <label className="block text-xs font-medium text-indigo-300 uppercase tracking-wider mb-3">
                    {t("twoFactorCode")}
                  </label>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-mono tracking-[0.2em] font-bold text-white drop-shadow-md">
                      {totpCode.slice(0, 3)} {totpCode.slice(3)}
                    </div>
                    <button
                      onClick={() => handleCopy(totpCode, "totp")}
                      className="w-10 h-10 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-xl flex items-center justify-center text-indigo-300 hover:text-white transition-all active:scale-95"
                    >
                      {copiedField === "totp" ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {data.url && (
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                    {t("website")}
                  </label>
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    <span className="truncate">{data.url}</span>
                    <ExternalLink className="w-4 h-4 flex-shrink-0 ml-2" />
                  </a>
                </div>
              )}

              {data.notes && (
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                    {t("notes")}
                  </label>
                  <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-zinc-300 text-sm whitespace-pre-wrap">
                    {data.notes}
                  </div>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-white/5 flex flex-col gap-1 text-xs text-zinc-500">
                <p>
                  {t("createdDate")} {new Date(data.createdAt).toLocaleDateString()} {new Date(data.createdAt).toLocaleTimeString().slice(0,5)}
                  {data.createdBy && ` ${t("by")} ${data.createdBy}`}
                </p>
                {data.updatedAt.getTime() !== data.createdAt.getTime() && (
                  <p>
                    {t("modifiedDate")} {new Date(data.updatedAt).toLocaleDateString()} {new Date(data.updatedAt).toLocaleTimeString().slice(0,5)}
                    {data.updatedBy && ` ${t("by")} ${data.updatedBy}`}
                  </p>
                )}
              </div>
            </div>
          ) : !loading ? (
            <div className="text-center py-10 text-red-400">{t("failedToLoadData")}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
