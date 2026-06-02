"use client";

import { useState } from "react";
import { updateCategoryColor, deleteCategory } from "@/app/actions";
import { X, Palette, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useTranslation } from "@/i18n/I18nProvider";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50"
    >
      {pending ? t("saving") : t("saveColor")}
    </button>
  );
}

export function EditCategoryModal({ 
  category,
  isOpen, 
  onClose,
  onDeleted
}: { 
  category: { id: string; name: string; color: string | null } | null;
  isOpen: boolean; 
  onClose: () => void; 
  onDeleted: () => void;
}) {
  const [selectedColor, setSelectedColor] = useState<string>(category?.color || "#3b82f6");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useTranslation();

  // Sync state when category changes
  if (category && selectedColor === "#3b82f6" && category.color && selectedColor !== category.color) {
    setSelectedColor(category.color);
  }

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

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="glass-card w-full max-w-[420px] relative z-10 flex flex-col overflow-hidden">
        {isConfirmingDelete && (
          <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <Trash2 className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">{t("deleteCategoryTitle")}</h3>
            <p className="text-sm text-zinc-400 mb-6">{t("deleteCategoryConfirm")}</p>
            <div className="flex gap-3 w-full">
              <button 
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all"
              >
                {t("cancel")}
              </button>
              <button 
                type="button"
                onClick={async () => {
                  setIsDeleting(true);
                  await deleteCategory(category.id);
                  setIsDeleting(false);
                  setIsConfirmingDelete(false);
                  onDeleted();
                  onClose();
                }}
                disabled={isDeleting}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 py-3 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? t("deleting") : t("delete")}
              </button>
            </div>
          </div>
        )}
        
        <div className={`transition-all duration-300 transform ${isConfirmingDelete ? 'blur-md opacity-40 scale-95 pointer-events-none' : ''}`}>
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-white truncate max-w-[200px]">{t("edit")} {category.name}</h2>
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
            action={async (formData) => {
              await updateCategoryColor(category.id, formData);
              onClose();
            }}
            className="space-y-6"
          >
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

            <div className="pt-2 flex gap-3">
              <SubmitButton />
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
}
