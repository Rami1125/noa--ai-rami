import { useState, useRef } from "react";
import { X, Image as ImageIcon, Upload, Link as LinkIcon, Check, RotateCcw } from "lucide-react";

export type WallpaperPreset = {
  id: string;
  name: string;
  category: "whatsapp" | "saban" | "solid";
  url: string;
  type: "svg" | "image" | "color";
  description: string;
};

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: "default-doodle",
    name: "דודל וואטסאפ וקטורי (ברירת מחדל)",
    category: "whatsapp",
    url: "default",
    type: "svg",
    description: "איורי וואטסאפ וקטוריים קלים המותאמים אוטומטית למצב בהיר/כהה",
  },
  {
    id: "wa-official-light",
    name: "וואטסאפ מקורי בהיר (Official Light)",
    category: "whatsapp",
    url: "https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png",
    type: "image",
    description: "טפטר השרבוטים המקורי הקלאסי של WhatsApp בגרסה בהירה",
  },
  {
    id: "wa-official-dark",
    name: "וואטסאפ מקורי כהה (Official Dark)",
    category: "whatsapp",
    url: "https://user-images.githubusercontent.com/15075759/28719142-84196144-73b1-11e7-9a8c-a1d2d3a3d5ea.png",
    type: "image",
    description: "טפט השרבוטים הרשמי של WhatsApp למצב לילה ורקעים כהים",
  },
  {
    id: "wa-emerald",
    name: "גוון ירוק צ'אט נקי (סבן)",
    category: "solid",
    url: "solid-emerald",
    type: "color",
    description: "רקע חלק ואלגנטי ללא שרבוטים, לקריאות מקסימלית של ההודעות",
  },
  {
    id: "saban-blueprint",
    name: "תבנית בניין והנדסה (Saban Grid)",
    category: "saban",
    url: "blueprint-grid",
    type: "svg",
    description: "רשת קווי בניין ותכנון הנדסי עדינים ברוח חברת ח. סבן",
  },
];

type WallpaperModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentWallpaper: string;
  onSelectWallpaper: (wallpaperUrl: string) => void;
};

export function WallpaperModal({
  isOpen,
  onClose,
  currentWallpaper,
  onSelectWallpaper,
}: WallpaperModalProps) {
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("נא לבחור קובץ תמונה תקין (PNG, JPG, SVG, WebP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onSelectWallpaper(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onSelectWallpaper(customUrl.trim());
    setCustomUrl("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="wa-pop max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-wa-divider bg-wa-panel p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-wa-divider pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-wa-green/15 text-wa-green">
              <ImageIcon className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-wa-bubble-text">
                החלפת רקע צ&apos;אט (וואטסאפ סבן)
              </h3>
              <p className="text-xs text-wa-meta">
                בחירת טפט שרבוטים מדמה וואטסאפ או העלאת תמונה אישית
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="rounded-full p-1.5 text-wa-meta transition-colors hover:bg-wa-hover"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="mb-5 space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-wa-meta">
            טפטים ודוגמאות מדמות וואטסאפ:
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {WALLPAPER_PRESETS.map((preset) => {
              const isSelected = currentWallpaper === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectWallpaper(preset.url)}
                  className={`group relative flex flex-col justify-between rounded-xl border p-3 text-start transition-all ${
                    isSelected
                      ? "border-wa-green bg-wa-green/10 shadow-xs"
                      : "border-wa-divider bg-wa-topbar hover:border-wa-green/40 hover:bg-wa-hover"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-wa-bubble-text">{preset.name}</span>
                    {isSelected && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wa-green text-white">
                        <Check className="size-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-wa-meta">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom URL Input */}
        <div className="mb-4 border-t border-wa-divider pt-4">
          <label className="mb-1.5 block text-xs font-semibold text-wa-bubble-text">
            הדבקת כתובת URL ישירה לתמונה:
          </label>
          <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute start-2.5 top-2.5 size-4 text-wa-meta" />
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/wallpaper.png"
                className="w-full rounded-lg border border-wa-divider bg-wa-topbar py-1.5 pe-3 ps-8 text-xs text-wa-bubble-text placeholder:text-wa-meta focus:border-wa-green focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              disabled={!customUrl.trim()}
              className="rounded-lg bg-wa-green px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              החל
            </button>
          </form>
        </div>

        {/* Upload Custom Image from File */}
        <div className="border-t border-wa-divider pt-4">
          <label className="mb-1.5 block text-xs font-semibold text-wa-bubble-text">
            העלאת קובץ תמונת רקע מהמחשב/נייד:
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-wa-divider bg-wa-topbar py-2.5 text-xs font-medium text-wa-bubble-text transition-colors hover:border-wa-green hover:bg-wa-hover"
          >
            <Upload className="size-4 text-wa-green" />
            בחירת קובץ תמונה מהמכשיר
          </button>
        </div>

        {/* Reset to Default Button */}
        <div className="mt-5 flex items-center justify-between border-t border-wa-divider pt-3">
          <button
            type="button"
            onClick={() => onSelectWallpaper("default")}
            className="flex items-center gap-1.5 text-xs text-wa-meta transition-colors hover:text-wa-bubble-text"
          >
            <RotateCcw className="size-3.5" />
            איפוס לרקע ברירת המחדל
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-wa-topbar px-4 py-1.5 text-xs font-medium text-wa-bubble-text transition-colors hover:bg-wa-hover"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
