import React, { useState, useEffect } from "react";
import {
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Info,
  ExternalLink,
} from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { cn } from "@/lib/utils";
import { NOA_AVATAR } from "@/lib/chat-data";

interface PWAInstallBannerProps {
  onOpenManualGuide?: () => void;
}

export function PWAInstallBanner({ onOpenManualGuide }: PWAInstallBannerProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("saban_pwa_banner_dismissed");
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("saban_pwa_banner_dismissed", "true");
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setIsDismissed(true), 3000);
      }
    } else {
      if (onOpenManualGuide) {
        onOpenManualGuide();
      } else {
        setShowGuideModal(true);
      }
    }
  };

  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      {/* PWA Floating / Top Guidance Card */}
      <div
        dir="rtl"
        className="relative mx-3 my-2 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-[#11221b] via-[#162a22] to-[#12231c] p-3.5 text-wa-bubble-text shadow-lg transition-all"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-wa-green/20 text-wa-green ring-1 ring-wa-green/40">
              <img src={NOA_AVATAR} alt="נועה AI" className="size-8 rounded-lg object-cover" />
              <span className="absolute -bottom-1 -left-1 flex size-4 items-center justify-center rounded-full bg-wa-green text-[9px] font-bold text-wa-shell">
                <Download className="size-2.5" />
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-xs font-bold text-white sm:text-sm">
                  התקנת אפליקציית נועה AI למסך הבית (PWA) 📲
                </h4>
                <span className="rounded-full bg-wa-green/20 px-2 py-0.2 text-[10px] font-medium text-wa-green border border-wa-green/30">
                  מומלץ לשימוש מהיר בשטח
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-100/80 max-w-xl">
                התקן את נועה ישירות למסך הבית של הטלפון או המחשב: גישה מיידית בלחיצה אחת, פתיחה במסך
                מלא ללא שורת כתובת, תגובתיות מהירה וסנכרון מלא לוואטסאפ ול-Make.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {installSuccess ? (
              <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="size-4" />
                האפליקציה הותקנה בהצלחה!
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 rounded-xl bg-wa-green px-3.5 py-1.5 text-xs font-semibold text-wa-shell shadow transition-all hover:bg-wa-green-hover hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="size-3.5" />
                  <span>{isInstallable ? "התקן למסך הבית" : "מדריך התקנה מהיר"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenManualGuide) onOpenManualGuide();
                    else setShowGuideModal(true);
                  }}
                  className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:bg-white/10"
                >
                  <Info className="size-3.5" />
                  <span>איך מתקינים?</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="סגור הודעת התקנה"
              className="rounded-lg p-1.5 text-emerald-200/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Internal Modal if no external handler */}
      <PWAInstallGuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />
    </>
  );
}

export function PWAInstallGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isInstallable, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-wa-divider bg-wa-panel text-wa-bubble-text shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-wa-divider bg-wa-topbar px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-wa-green/15 text-wa-green">
              <Smartphone className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white sm:text-base">
                התקנת נועה AI כאפליקציה במסך הבית (PWA)
              </h3>
              <p className="text-xs text-wa-meta">ח. סבן חומרי בניין בע״מ — קו סידור מהיר</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-wa-meta hover:bg-wa-hover hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4 text-xs">
          {/* Value Proposition */}
          <div className="rounded-xl border border-wa-green/30 bg-wa-green/10 p-3.5 text-emerald-100">
            <div className="flex items-center gap-1.5 font-bold text-wa-green mb-1 text-sm">
              <Sparkles className="size-4" />
              למה מומלץ להתקין את האפליקציה למסך הבית?
            </div>
            <ul className="space-y-1.5 text-[11px] text-emerald-200/90 list-disc list-inside">
              <li>
                <strong>זמינות מהשטח:</strong> אייקון ייעודי במסך הבית של הטלפון לגישה מיידית בלחיצה
                אחת.
              </li>
              <li>
                <strong>מסך מלא ללא דפדפן:</strong> חווית אפליקציה אמיתית ללא שורת כתובת, כפתורי
                דפדפן או הסחות דעת.
              </li>
              <li>
                <strong>סנכרון מהיר מול Make ו-WhatsApp:</strong> קליטה מהירה של הזמנות מכולות
                ושיחות עם נועה.
              </li>
              <li>
                <strong>שמירת היסטוריה ויומן:</strong> כל התיעוד והשיחות נשמרים מקומית במכשיר גם
                בניתוק זמני.
              </li>
            </ul>
          </div>

          {/* iOS Instructions */}
          <div className="rounded-xl border border-wa-divider bg-wa-shell/60 p-4 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
              <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white">
                🍏
              </span>
              <span>התקנה ב-iPhone / iPad (דפדפן Safari):</span>
            </div>
            <ol className="space-y-2 text-[11px] text-wa-meta pr-1">
              <li className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wa-green/20 text-wa-green font-bold text-[10px]">
                  1
                </span>
                <span>
                  לחץ/י על כפתור ה-<strong>שיתוף</strong> (
                  <Share2 className="inline size-3.5 text-wa-green mx-0.5" />
                  Share) בסרגל התחתון של Safari.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wa-green/20 text-wa-green font-bold text-[10px]">
                  2
                </span>
                <span>
                  גלול/י למטה בתפריט ובחר/י <strong>״הוסף למסך הבית״</strong> (
                  <PlusSquare className="inline size-3.5 text-wa-green mx-0.5" />
                  Add to Home Screen).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wa-green/20 text-wa-green font-bold text-[10px]">
                  3
                </span>
                <span>
                  לחץ/י על <strong>״הוסף״</strong> (Add) בפינה השמאלית/ימנית העליונה — וזהו! נועה AI
                  מופיעה במסך הבית שלך.
                </span>
              </li>
            </ol>
          </div>

          {/* Android / Chrome Instructions */}
          <div className="rounded-xl border border-wa-divider bg-wa-shell/60 p-4 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
              <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white">
                🤖
              </span>
              <span>התקנה ב-Android / Chrome / Edge:</span>
            </div>
            <ol className="space-y-2 text-[11px] text-wa-meta pr-1">
              <li className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wa-green/20 text-wa-green font-bold text-[10px]">
                  1
                </span>
                <span>
                  אם מופיע כפתור <strong>״התקן למסך הבית״</strong>, לחץ/י עליו ישירות לאישור מיידי.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wa-green/20 text-wa-green font-bold text-[10px]">
                  2
                </span>
                <span>
                  או לחץ/י על <strong>3 הנקודות (תפריט הדפדפן)</strong> בפינת המסך ובחר/י{" "}
                  <strong>״הוסף למסך הבית״</strong> או <strong>״התקן אפליקציה״</strong>.
                </span>
              </li>
            </ol>
          </div>

          {/* Desktop Chrome/Edge */}
          <div className="rounded-xl border border-wa-divider bg-wa-shell/40 p-3 text-[11px] text-wa-meta">
            <p>
              💻 <strong>משתמש/ת במחשב?</strong> ניתן להתקין דרך אייקון ההתקנה (
              <Download className="inline size-3 text-wa-green mx-0.5" />) המופיע בצד ימין/שמאל של
              שורת הכתובת ב-Google Chrome או Microsoft Edge.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-wa-divider bg-wa-topbar px-5 py-3.5">
          {isInstallable ? (
            <button
              type="button"
              onClick={async () => {
                await install();
                onClose();
              }}
              className="flex items-center gap-2 rounded-xl bg-wa-green px-4 py-2 text-xs font-bold text-wa-shell transition-colors hover:bg-wa-green-hover"
            >
              <Download className="size-4" />
              התקן עכשיו למסך הבית
            </button>
          ) : (
            <span className="text-[11px] text-wa-meta">
              פעל/י לפי השלבים למעלה בהתאם למכשירך 👆
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-wa-divider bg-wa-panel px-4 py-2 text-xs font-medium text-wa-bubble-text transition-colors hover:bg-wa-hover"
          >
            הבנתי, תודה
          </button>
        </div>
      </div>
    </div>
  );
}

export function PWAInstallHeaderButton({ onClick }: { onClick: () => void }) {
  const { isInstalled } = usePWAInstall();
  if (isInstalled) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="התקנת האפליקציה למסך הבית"
      title="התקנת אפליקציית נועה AI למסך הבית (PWA) 📲"
      className="flex items-center gap-1.5 text-[11px] font-medium rounded-full bg-wa-green/15 text-wa-green px-2.5 py-1 transition-all hover:bg-wa-green/25 border border-wa-green/30 active:scale-95"
    >
      <Download className="size-3.5" />
      <span className="hidden md:inline">התקן למסך הבית</span>
      <span className="md:hidden">התקן</span>
    </button>
  );
}
