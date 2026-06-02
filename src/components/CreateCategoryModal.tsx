"use client";

import { useRef, useState } from "react";
import { createCategory } from "@/app/actions";
import { X, FolderPlus } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useTranslation } from "@/i18n/I18nProvider";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 mt-4"
    >
      {pending ? t("creating") : t("createCategory")}
    </button>
  );
}

export function CreateCategoryModal({ 
  isOpen, 
  onClose,
  onCreated
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCreated: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#3b82f6");
  const { t } = useTranslation();

  const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // yellow
    "#10b981", // green
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#64748b", // slate
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="glass-card w-full max-w-[420px] relative z-10 flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-white">{t("createCategory")}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form 
            ref={formRef}
            action={async (formData) => {
              await createCategory(formData);
              formRef.current?.reset();
              setSelectedColor("#3b82f6");
              onCreated();
              onClose();
            }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-zinc-400 mb-2">{t("title")}</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder={t("title")}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-zinc-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-3">{t("color")}</label>
              <input type="hidden" name="color" value={selectedColor} />
              <div className="flex items-center gap-3 flex-wrap">
                {colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      selectedColor === c ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-900 shadow-lg" : "hover:scale-110 opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
