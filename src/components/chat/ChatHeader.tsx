import { useState } from "react";
import {
  ArrowRight,
  Phone,
  Search,
  Video,
  MoreVertical,
  Image as ImageIcon,
  Radio,
  RotateCcw,
  QrCode,
  ShieldCheck,
  Moon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/chat-data";
import type { TypingUser } from "@/lib/typing-events";
import type { GatewayStatus } from "@/components/chat/WhatsAppQrModal";

type ChatHeaderProps = {
  conversation: Conversation;
  status: string;
  typingUsers?: TypingUser[];
  onBack?: () => void;
  onOpenWallpaper?: () => void;
  onSimulateColleagueTyping?: () => void;
  onResetHistory?: () => void;
  onOpenQrGateway?: () => void;
  gatewayStatus?: GatewayStatus;
  onOpenJournal?: () => void;
};

export function ChatHeader({
  conversation,
  status,
  typingUsers = [],
  onBack,
  onOpenWallpaper,
  onSimulateColleagueTyping,
  onResetHistory,
  onOpenQrGateway,
  gatewayStatus = "connected",
  onOpenJournal,
}: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const isTyping = typingUsers.length > 0;
  const typingLabel =
    typingUsers.length === 1
      ? `${typingUsers[0].userName} מקליד/ה...`
      : `${typingUsers.map((u) => u.userName).join(", ")} מקלידים...`;

  return (
    <header className="relative flex items-center gap-3 bg-wa-topbar px-3 py-2">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="חזרה לרשימת הצ'אטים"
          className="rounded-full p-1.5 text-wa-meta transition-colors hover:bg-wa-hover md:hidden"
        >
          <ArrowRight className="size-5" />
        </button>
      ) : null}

      {conversation.avatar ? (
        <img
          src={conversation.avatar}
          alt={conversation.name}
          className="size-10 shrink-0 rounded-full object-cover ring-1 ring-wa-divider/40"
        />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-wa-panel text-base font-semibold text-wa-meta border border-wa-divider">
          {conversation.initials}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[15px] font-medium text-wa-bubble-text">
            {conversation.name}
          </p>
          {conversation.isOfficial ? (
            <span
              title="קו וואטסאפ רשמי מאומת — ח. סבן"
              className="hidden xs:inline-flex items-center gap-0.5 rounded-full bg-wa-green/15 px-1.5 py-0.5 text-[10px] font-medium text-wa-green"
            >
              <ShieldCheck className="size-3" />
              <span>רשמי</span>
            </span>
          ) : null}
        </div>
        {isTyping ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-wa-green">
            <span className="truncate">{typingLabel}</span>
            <span className="inline-flex items-center gap-0.5">
              <span
                className="size-1 rounded-full bg-wa-green animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="size-1 rounded-full bg-wa-green animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="size-1 rounded-full bg-wa-green animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </span>
          </div>
        ) : (
          <p className="truncate text-xs text-wa-meta">
            {conversation.phone ? (
              <span className="font-mono text-[11px] text-wa-green font-medium">
                {conversation.phone} •{" "}
              </span>
            ) : null}
            {status}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 text-wa-meta">
        {onOpenQrGateway ? (
          <button
            type="button"
            onClick={onOpenQrGateway}
            aria-label="שער וואטסאפ QR"
            title="שער וואטסאפ (QR Gateway) — חיבור מספר 050-886-1080"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              gatewayStatus === "connected"
                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
            )}
          >
            <QrCode className="size-3.5" />
            <span className="hidden sm:inline">
              {gatewayStatus === "connected" ? "QR מחובר" : "סריקת QR"}
            </span>
            <span
              className={cn(
                "size-1.5 rounded-full",
                gatewayStatus === "connected" ? "bg-emerald-400" : "bg-amber-400 animate-ping",
              )}
            />
          </button>
        ) : null}

        {onOpenJournal ? (
          <button
            type="button"
            onClick={onOpenJournal}
            aria-label="יומן רגשי וסיכום יום עם נועה"
            title="יומן רגשי וסיכום יום עם נועה 🌙"
            className="flex items-center gap-1.5 text-[11px] font-medium rounded-full bg-indigo-500/10 text-indigo-300 px-2.5 py-1 transition-colors hover:bg-indigo-500/20 border border-indigo-500/30"
          >
            <Moon className="size-3.5 text-indigo-400" />
            <span className="hidden sm:inline">יומן רגשי</span>
          </button>
        ) : null}

        {onSimulateColleagueTyping ? (
          <button
            type="button"
            onClick={onSimulateColleagueTyping}
            aria-label="הדמיית הקלדה מצד עמית"
            title="הדמיית הקלדה מצד עמית בצוות סבן"
            className="hidden sm:flex items-center gap-1 text-[11px] font-medium rounded-full bg-wa-green/10 text-wa-green px-2.5 py-1 transition-colors hover:bg-wa-green/20"
          >
            <Radio className="size-3.5 animate-pulse" />
            <span>בדיקת הקלדה</span>
          </button>
        ) : null}

        <button
          type="button"
          aria-label="שיחת וידאו"
          className="rounded-full p-2 transition-colors hover:bg-wa-hover"
        >
          <Video className="size-5" />
        </button>
        <button
          type="button"
          aria-label="שיחת קול"
          className="rounded-full p-2 transition-colors hover:bg-wa-hover"
        >
          <Phone className="size-5" />
        </button>
        <button
          type="button"
          aria-label="חיפוש בשיחה"
          className="rounded-full p-2 transition-colors hover:bg-wa-hover"
        >
          <Search className="size-5" />
        </button>

        {onOpenWallpaper ? (
          <button
            type="button"
            onClick={onOpenWallpaper}
            aria-label="החלפת רקע שיחה"
            title="החלפת רקע שיחה (וואטסאפ / תמונה)"
            className="rounded-full p-2 text-wa-meta transition-colors hover:bg-wa-hover hover:text-wa-green"
          >
            <ImageIcon className="size-5" />
          </button>
        ) : null}

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            aria-label="תפריט שיחה"
            className="rounded-full p-2 transition-colors hover:bg-wa-hover"
          >
            <MoreVertical className="size-5" />
          </button>

          {showMenu && (
            <div className="wa-pop absolute end-0 top-full z-40 mt-1.5 w-56 overflow-hidden rounded-xl border border-wa-divider bg-wa-panel py-1 shadow-lg">
              {onOpenJournal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenJournal();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-xs text-wa-bubble-text hover:bg-wa-hover"
                >
                  <Moon className="size-4 text-indigo-400" />
                  יומן אישי וסיכום יום רגשי (Journal)
                </button>
              )}
              {onOpenQrGateway && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenQrGateway();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-xs text-wa-bubble-text hover:bg-wa-hover"
                >
                  <QrCode className="size-4 text-wa-green" />
                  שער וואטסאפ (סריקת QR)
                </button>
              )}
              {onSimulateColleagueTyping && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onSimulateColleagueTyping();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-xs text-wa-bubble-text hover:bg-wa-hover"
                >
                  <Radio className="size-4 text-wa-green" />
                  הדמיית הקלדה מצד עמית
                </button>
              )}
              {onOpenWallpaper && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenWallpaper();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-xs text-wa-bubble-text hover:bg-wa-hover"
                >
                  <ImageIcon className="size-4 text-wa-green" />
                  החלפת רקע שיחה
                </button>
              )}
              {onResetHistory && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onResetHistory();
                  }}
                  className="flex w-full items-center gap-2 border-t border-wa-divider/50 px-4 py-2.5 text-start text-xs text-red-500 hover:bg-wa-hover"
                >
                  <RotateCcw className="size-4" />
                  איפוס צ&apos;אטים לברירת מחדל
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
