import { useState, useEffect } from "react";
import {
  X,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Smartphone,
  Server,
  Zap,
  Bot,
  Copy,
  Check,
  ShieldCheck,
  Radio,
  ExternalLink,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { NOA_AVATAR } from "@/lib/chat-data";

export type GatewayStatus = "connected" | "awaiting_scan" | "disconnected";

type WhatsAppQrModalProps = {
  isOpen: boolean;
  onClose: () => void;
  status: GatewayStatus;
  onChangeStatus: (status: GatewayStatus) => void;
  phoneNumber?: string;
  onTriggerRealWhatsApp?: () => Promise<void>;
};

export function WhatsAppQrModal({
  isOpen,
  onClose,
  status,
  onChangeStatus,
  phoneNumber = "+972 50-886-1080",
  onTriggerRealWhatsApp,
}: WhatsAppQrModalProps) {
  const [copied, setCopied] = useState(false);
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [countdown, setCountdown] = useState(48);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastPing, setLastPing] = useState("לפני 3 שניות");
  const [activeTab, setActiveTab] = useState<"qr" | "settings" | "docs">("qr");

  // Timer countdown simulation for QR code expiry
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 50;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(phoneNumber.replace(/\s+/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshQr = () => {
    setIsRefreshing(true);
    setCountdown(50);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleToggleSimulation = () => {
    if (status === "connected") {
      onChangeStatus("awaiting_scan");
    } else {
      onChangeStatus("connected");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="wa-pop relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-wa-divider bg-wa-panel text-wa-bubble-text shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-wa-divider bg-wa-topbar px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-wa-green/15 text-wa-green">
              <QrCode className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">שער וואטסאפ (QR Gateway) — נועה AI</h3>
                <span className="flex items-center gap-1 rounded-full bg-wa-green/10 px-2 py-0.5 text-[11px] font-medium text-wa-green">
                  <ShieldCheck className="size-3" />
                  קו רשמי מאומת
                </span>
              </div>
              <p className="text-xs text-wa-meta">
                סריקה וקישור שרת מקומי / Evolution API לקו{" "}
                <span className="font-semibold text-wa-green">{phoneNumber}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-wa-meta transition-colors hover:bg-wa-hover hover:text-wa-bubble-text"
            aria-label="סגור חלון"
          >
            <X className="size-5" />
          </button>
        </header>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-wa-divider/70 bg-wa-shell/40 px-5 py-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-wa-meta">סטטוס חיבור:</span>
            {status === "connected" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                מחובר ומאזין להודעות
              </span>
            ) : status === "awaiting_scan" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                ממתין לסריקת QR
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
                <span className="size-2 rounded-full bg-red-500" />
                מנותק
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-wa-meta">
            <span className="flex items-center gap-1">
              <Radio className="size-3.5 text-wa-green animate-pulse" />
              <span>דופק: {lastPing}</span>
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:flex items-center gap-1">
              <Smartphone className="size-3.5" />
              <span>קו מוגדר: {phoneNumber}</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-wa-divider px-5">
          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={cn(
              "border-b-2 px-4 py-2.5 text-xs font-medium transition-colors",
              activeTab === "qr"
                ? "border-wa-green text-wa-green font-semibold"
                : "border-transparent text-wa-meta hover:text-wa-bubble-text",
            )}
          >
            סריקת קוד QR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={cn(
              "border-b-2 px-4 py-2.5 text-xs font-medium transition-colors",
              activeTab === "settings"
                ? "border-wa-green text-wa-green font-semibold"
                : "border-transparent text-wa-meta hover:text-wa-bubble-text",
            )}
          >
            הגדרות שרת &amp; Webhook
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("docs")}
            className={cn(
              "border-b-2 px-4 py-2.5 text-xs font-medium transition-colors",
              activeTab === "docs"
                ? "border-wa-green text-wa-green font-semibold"
                : "border-transparent text-wa-meta hover:text-wa-bubble-text",
            )}
          >
            מדריך התחברות מהיר
          </button>
        </div>

        {/* Tab Contents */}
        <div className="max-h-[65vh] overflow-y-auto p-5">
          {activeTab === "qr" && (
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              {/* QR Container */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-wa-divider bg-white p-5 text-neutral-900 shadow-sm md:w-[260px]">
                {status === "connected" ? (
                  <div className="flex size-[200px] flex-col items-center justify-center gap-3 text-center text-emerald-600">
                    <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="size-10" />
                    </div>
                    <p className="text-sm font-bold">המכשיר מקושר בהצלחה!</p>
                    <p className="text-xs text-neutral-500">
                      {phoneNumber} מקושר ל-SabanOS ומשיב אוטונומית
                    </p>
                  </div>
                ) : (
                  <div className="relative flex size-[200px] items-center justify-center">
                    {/* Stylized QR Code SVG */}
                    <svg
                      viewBox="0 0 200 200"
                      className={cn("size-full transition-opacity", isRefreshing && "opacity-40")}
                    >
                      {/* Outer positioning patterns */}
                      <rect x="10" y="10" width="50" height="50" rx="6" fill="#128C7E" />
                      <rect x="20" y="20" width="30" height="30" rx="3" fill="#ffffff" />
                      <rect x="27" y="27" width="16" height="16" rx="2" fill="#128C7E" />

                      <rect x="140" y="10" width="50" height="50" rx="6" fill="#128C7E" />
                      <rect x="150" y="20" width="30" height="30" rx="3" fill="#ffffff" />
                      <rect x="157" y="27" width="16" height="16" rx="2" fill="#128C7E" />

                      <rect x="10" y="140" width="50" height="50" rx="6" fill="#128C7E" />
                      <rect x="20" y="150" width="30" height="30" rx="3" fill="#ffffff" />
                      <rect x="27" y="157" width="16" height="16" rx="2" fill="#128C7E" />

                      {/* Dense QR data grid simulation */}
                      <g fill="#1f2937">
                        <rect x="70" y="15" width="12" height="12" />
                        <rect x="90" y="15" width="16" height="8" />
                        <rect x="115" y="15" width="14" height="14" />
                        <rect x="70" y="35" width="25" height="10" />
                        <rect x="105" y="35" width="22" height="12" />
                        <rect x="75" y="55" width="14" height="14" />
                        <rect x="98" y="55" width="28" height="10" />

                        <rect x="15" y="70" width="20" height="10" />
                        <rect x="42" y="70" width="18" height="16" />
                        <rect x="15" y="90" width="12" height="24" />
                        <rect x="35" y="95" width="24" height="14" />
                        <rect x="15" y="120" width="44" height="10" />

                        <rect x="145" y="70" width="18" height="12" />
                        <rect x="170" y="70" width="15" height="22" />
                        <rect x="145" y="90" width="20" height="14" />
                        <rect x="170" y="100" width="18" height="24" />
                        <rect x="140" y="112" width="22" height="16" />

                        <rect x="70" y="145" width="16" height="18" />
                        <rect x="95" y="145" width="22" height="12" />
                        <rect x="125" y="145" width="15" height="25" />
                        <rect x="70" y="170" width="35" height="16" />
                        <rect x="115" y="175" width="20" height="12" />
                        <rect x="145" y="145" width="45" height="45" rx="4" fill="#075E54" />
                        <rect x="155" y="155" width="25" height="25" fill="#ffffff" />
                        <rect x="162" y="162" width="11" height="11" fill="#128C7E" />
                      </g>
                    </svg>

                    {/* Center Noa AI Badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex size-11 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-wa-green">
                        <img
                          src={NOA_AVATAR}
                          alt="נועה AI"
                          className="size-9 rounded-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Expiry / Refresh */}
                <div className="mt-3 flex w-full items-center justify-between text-[11px] text-neutral-600">
                  <span>
                    {status === "connected" ? "חיבור פעיל" : `קוד מתרענן בעוד ${countdown} שניות`}
                  </span>
                  <button
                    type="button"
                    onClick={handleRefreshQr}
                    className="flex items-center gap-1 font-medium text-wa-green hover:underline"
                  >
                    <RefreshCw className={cn("size-3", isRefreshing && "animate-spin")} />
                    רענן
                  </button>
                </div>
              </div>

              {/* Instructions & Controls */}
              <div className="flex-1 space-y-4 text-xs">
                <div>
                  <h4 className="text-sm font-semibold text-wa-bubble-text">
                    שלבי חיבור ב-3 צעדים פשוטים:
                  </h4>
                  <ol className="mt-2.5 space-y-2 text-wa-meta">
                    <li className="flex items-start gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wa-green/15 text-[11px] font-bold text-wa-green">
                        1
                      </span>
                      <span>
                        פתח/י את אפליקציית WhatsApp במכשיר שבו פעיל הקו{" "}
                        <strong className="text-wa-bubble-text">{phoneNumber}</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wa-green/15 text-[11px] font-bold text-wa-green">
                        2
                      </span>
                      <span>
                        היכנס/י ל-<strong>הגדרות</strong> (או 3 נקודות ב-Android) &gt;{" "}
                        <strong>מכשירים מקושרים</strong> &gt; <strong>קשר מכשיר</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wa-green/15 text-[11px] font-bold text-wa-green">
                        3
                      </span>
                      <span>
                        כוון/י את מצלמת המכשיר אל קוד ה-QR שמשמאל. נועה תתחבר ותאזין לשיחות באופן
                        אוטונומי!
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Quick Number Copy */}
                <div className="flex items-center justify-between rounded-xl border border-wa-divider bg-wa-panel/60 p-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="size-4 text-wa-green" />
                    <div>
                      <p className="text-[11px] text-wa-meta">מספר וואטסאפ של נועה AI:</p>
                      <p className="font-mono text-xs font-semibold text-wa-bubble-text">
                        {phoneNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="flex items-center gap-1 rounded-lg border border-wa-divider bg-wa-hover px-2.5 py-1 text-xs text-wa-meta transition-colors hover:text-wa-bubble-text"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-wa-green" />
                        <span className="text-wa-green">הועתק</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>העתק</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Test Simulation Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleToggleSimulation}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors shadow-sm",
                      status === "connected"
                        ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                        : "bg-wa-green text-wa-shell hover:bg-wa-green-hover",
                    )}
                  >
                    {status === "connected" ? (
                      <>
                        <AlertCircle className="size-4" />
                        הדמיית ניתוק שער
                      </>
                    ) : (
                      <>
                        <Zap className="size-4" />
                        הדמיית סריקה מוצלחת (קשר מכשיר)
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLastPing("עודכן עכשיו")}
                    className="flex items-center gap-1.5 rounded-lg border border-wa-divider bg-wa-panel px-3 py-2 text-xs text-wa-meta transition-colors hover:bg-wa-hover hover:text-wa-bubble-text"
                  >
                    <RefreshCw className="size-3.5" />
                    בדיקת פעימת דופק (Ping)
                  </button>
                </div>

                {/* Real WhatsApp to Make Webhook Dispatch */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-3.5 text-xs space-y-2.5 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Zap className="size-4 text-emerald-400 fill-emerald-400" />
                      שיגור הודעת WhatsApp אמיתית ל-Make
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                      Live Webhook
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-200/80">
                    שדר בקשת תיאום מכולה ישירות ל-Make Webhook (`https://hook.eu1.make.com/...`)
                    וצפה בהודעה ובתשובת התרחיש מופיעות בשידור חי בחלון הצ&apos;אט עם תגי סנכרון
                    רשמיים.
                  </p>
                  {onTriggerRealWhatsApp && (
                    <button
                      type="button"
                      onClick={async () => {
                        await onTriggerRealWhatsApp();
                        onClose();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-wa-green py-2.5 text-xs font-bold text-wa-shell transition-all hover:bg-wa-green-hover shadow-md active:scale-98"
                    >
                      <Smartphone className="size-4" />
                      <span>שגר עכשיו הודעת WhatsApp אמיתית ל-Make ועבור לצ&apos;אט 🚀</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-wa-divider bg-wa-panel/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-wa-bubble-text">
                      מצב מענה אוטונומי של נועה AI
                    </h4>
                    <p className="text-[11px] text-wa-meta">
                      כאשר מופעל, כל הודעה לוואטסאפ תענה ישירות ע״י נועה בהתבסס על ה-DNA של ח. סבן.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutonomousMode((v) => !v)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                      autonomousMode ? "bg-wa-green" : "bg-neutral-600",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        autonomousMode ? "-translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-wa-divider bg-wa-panel/60 p-4 space-y-2">
                <h4 className="font-semibold text-wa-bubble-text">כתובת שרת המענה (Webhook URL)</h4>
                <p className="text-[11px] text-wa-meta">
                  השרת המקומי (Evolution API / Docker) מעביר הודעות נכנסות ליעד זה:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://hook.eu2.make.com/saban-noa-dispatch-0508861080"
                    className="flex-1 rounded-lg border border-wa-divider bg-wa-shell/60 px-3 py-2 font-mono text-[11px] text-wa-bubble-text"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "https://hook.eu2.make.com/saban-noa-dispatch-0508861080",
                      );
                      alert("כתובת ה-Webhook הועתקה ללוח!");
                    }}
                    className="rounded-lg bg-wa-hover px-3 py-2 text-xs text-wa-bubble-text"
                  >
                    העתק
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="rounded-xl border border-wa-divider bg-wa-panel/40 p-3">
                  <p className="text-wa-meta">סוג חיבור שער (Engine)</p>
                  <p className="font-semibold text-wa-bubble-text">
                    Evolution API (WhatsApp Web Engine)
                  </p>
                </div>
                <div className="rounded-xl border border-wa-divider bg-wa-panel/40 p-3">
                  <p className="text-wa-meta">מזהה סשן (Session ID)</p>
                  <p className="font-mono font-semibold text-wa-bubble-text">
                    saban_noa_0508861080
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "docs" && (
            <div className="space-y-3 text-xs leading-relaxed text-wa-meta">
              <div className="rounded-xl border border-wa-green/30 bg-wa-green/5 p-3.5 text-wa-bubble-text">
                <h4 className="flex items-center gap-1.5 font-semibold text-wa-green">
                  <Bot className="size-4" />
                  איך נועה משיבה למי שפונה לקו 050-886-1080?
                </h4>
                <p className="mt-1 text-[11px] text-wa-meta">
                  כל לקוח, נהג או קבלן שכותב הודעה לקו הוואטסאפ של נועה מנותב מיידית למנוע ה-AI של
                  ח. סבן. נועה מזהה את איש הקשר לפי המספר (למשל: ורד אידלסון, איציק זהבי, חכמת הנהג)
                  ומשיבה לו בסגנון המדויק לפי מאגר הידע שבקובץ{" "}
                  <code className="rounded bg-wa-shell px-1 py-0.5 text-wa-green">
                    knowledge.ts
                  </code>
                  .
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-wa-bubble-text">דוגמאות לתפעול מקצועי מהשטח:</h5>
                <ul className="space-y-1.5 list-disc list-inside text-[11px]">
                  <li>
                    <strong>קבלן שמזמין מכולה:</strong> נועה שואלת על מיקום, סוג פסולת ותאריך,
                    ופותחת כרטיס הזמנה מסודר בסידור.
                  </li>
                  <li>
                    <strong>בירור מחירים:</strong> נועה אינה קובעת מחירונים — היא מפנה מיד לאיציק
                    זהבי בסניף החרש 4.
                  </li>
                  <li>
                    <strong>פנייה מוורד אידלסון:</strong> נועה משתפת פעולה מלאה בהצלבות קומקס
                    ובתעודות משלוח, ומעבירה את הקרדיט לראמי.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-wa-divider bg-wa-topbar px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-wa-meta">
            <Server className="size-4 text-wa-green" />
            <span>Gateway: Active Node</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-wa-green px-5 py-2 text-xs font-semibold text-wa-shell transition-colors hover:bg-wa-green-hover"
          >
            סגור
          </button>
        </footer>
      </div>
    </div>
  );
}
