import { useState, useEffect } from "react";
import {
  CheckCheck,
  Check,
  MapPin,
  Navigation,
  Package,
  Clock,
  User,
  Moon,
  HeartHandshake,
  Sparkles,
  Volume2,
  Square,
  Zap,
  Smartphone,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ACTION_LABELS, type Message, type TaskCard } from "@/lib/chat-data";
import type { JournalCard } from "@/lib/journal";
import type { TypingUser } from "@/lib/typing-events";
import { FormattedChatMessage } from "./FormattedChatMessage";
import { noaSpeech } from "@/lib/speech";

function Ticks({ status }: { status: Message["status"] }) {
  if (!status) return null;

  if (status === "sent") {
    return (
      <span title="נשלח לשרת" aria-label="נשלח" className="inline-flex items-center">
        <Check className="size-3.5 stroke-[2.2] text-wa-meta" />
      </span>
    );
  }

  if (status === "delivered") {
    return (
      <span title="נמסר למקבל (V כפול אפור)" aria-label="נמסר" className="inline-flex items-center">
        <CheckCheck className="size-3.5 stroke-[2.2] text-wa-meta" />
      </span>
    );
  }

  // status === "read"
  return (
    <span title="נקרא (V כפול כחול)" aria-label="נקרא" className="inline-flex items-center">
      <CheckCheck className="size-3.5 stroke-[2.4] text-wa-tick" />
    </span>
  );
}

function OrderCard({ card }: { card: TaskCard }) {
  const action = ACTION_LABELS[card.action];
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(card.wazeQuery)}&navigate=yes`;

  return (
    <div className="mt-1 mb-2 w-full overflow-hidden rounded-lg bg-wa-panel-alt">
      <div className="flex items-center justify-between gap-2 bg-wa-green/15 px-3 py-2">
        <span className="text-sm font-semibold text-wa-bubble-text">{card.title}</span>
        <span className="rounded-full bg-wa-green/25 px-2 py-0.5 text-xs font-medium text-wa-green">
          {action.emoji} {action.label}
        </span>
      </div>

      <dl className="space-y-2 px-3 py-3 text-[13px] text-wa-bubble-text">
        <div className="flex items-center gap-2">
          <User className="size-4 shrink-0 text-wa-meta" />
          <dt className="sr-only">לקוח</dt>
          <dd>{card.customer}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Package className="size-4 shrink-0 text-wa-meta" />
          <dt className="sr-only">סוג מכולה</dt>
          <dd>{card.containerType}</dd>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-wa-meta" />
          <dt className="sr-only">כתובת</dt>
          <dd>{card.address}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-wa-meta" />
          <dt className="sr-only">מועד</dt>
          <dd>{card.scheduledFor}</dd>
        </div>
      </dl>

      <a
        href={wazeUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 border-t border-wa-divider py-2.5 text-sm font-medium text-wa-tick transition-colors hover:bg-wa-hover"
      >
        <Navigation className="size-4" />
        ניווט ב-Waze
      </a>
    </div>
  );
}

function JournalCardView({ card }: { card: JournalCard }) {
  const reflectionId = `reflection-${card.id || card.date}`;
  const [speakingId, setSpeakingId] = useState<string | null>(noaSpeech.getCurrentMessageId());

  useEffect(() => {
    return noaSpeech.subscribe(() => {
      setSpeakingId(noaSpeech.getCurrentMessageId());
    });
  }, []);

  const isSpeakingReflection = speakingId === reflectionId;

  return (
    <div className="mt-1 mb-2 w-full overflow-hidden rounded-xl border border-indigo-500/30 bg-wa-panel-alt/90 shadow-sm">
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-indigo-950/40 via-indigo-900/30 to-wa-panel px-3 py-2 border-b border-indigo-500/20">
        <div className="flex items-center gap-2">
          <Moon className="size-4 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-300">
            יומן אישי וסיכום יום רגשי 🌙
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[11px] font-medium text-indigo-300 border border-indigo-500/30">
          <span>{card.moodEmoji}</span>
          <span>{card.moodLabel}</span>
        </span>
      </div>

      <div className="space-y-2 p-3 text-xs sm:text-[13px]">
        <div>
          <p className="font-medium text-indigo-400/90 text-[11px] mb-0.5">שאלת נועה לפתיחת הלב:</p>
          <p className="italic text-wa-bubble-text bg-wa-panel/60 p-2 rounded-lg border border-wa-divider/40">
            &ldquo;{card.question}&rdquo;
          </p>
        </div>

        <div>
          <p className="font-medium text-wa-meta text-[11px] mb-0.5">רפלקציה ותשובה אישית:</p>
          <p className="whitespace-pre-wrap text-wa-bubble-text bg-wa-panel/80 p-2 rounded-lg border border-wa-divider/50">
            {card.answer}
          </p>
        </div>

        {card.noaReflection && (
          <div className="rounded-lg bg-rose-500/10 p-2.5 border border-rose-500/20 text-wa-bubble-text text-xs leading-relaxed">
            <div className="flex items-center justify-between font-medium text-rose-300 mb-1">
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="size-3.5" />
                <span>שיקוף ותובנה מנועה AI:</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isSpeakingReflection) {
                    noaSpeech.stop();
                  } else {
                    noaSpeech.speak(reflectionId, card.noaReflection || "");
                  }
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors",
                  isSpeakingReflection
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-rose-500/20 text-rose-200 hover:bg-rose-500/30",
                )}
              >
                {isSpeakingReflection ? (
                  <>
                    <span>עצור</span>
                    <Square className="size-2.5 fill-current" />
                  </>
                ) : (
                  <>
                    <Volume2 className="size-3" />
                    <span>הקשב לשיקוף</span>
                  </>
                )}
              </button>
            </div>
            <FormattedChatMessage text={card.noaReflection} isOut={false} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-wa-divider/50 px-3 py-1.5 text-[10px] text-wa-meta bg-wa-panel/50">
        <span>{card.date}</span>
        <span>נשמר ביומן האישי 🔒</span>
      </div>
    </div>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const isOut = message.author === "me";
  const [speakingId, setSpeakingId] = useState<string | null>(noaSpeech.getCurrentMessageId());

  useEffect(() => {
    return noaSpeech.subscribe(() => {
      setSpeakingId(noaSpeech.getCurrentMessageId());
    });
  }, []);

  const isSpeakingThis = speakingId === message.id;

  const handleToggleSpeech = () => {
    if (isSpeakingThis) {
      noaSpeech.stop();
    } else if (message.text) {
      noaSpeech.speak(message.id, message.text);
    }
  };

  return (
    <div className={cn("flex w-full", isOut ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "wa-pop relative max-w-[85%] rounded-lg px-2.5 py-1.5 text-[14.5px] leading-relaxed shadow-sm sm:max-w-[75%] md:max-w-[62%]",
          isOut
            ? "rounded-ee-none bg-wa-bubble-out text-wa-bubble-text"
            : "rounded-es-none bg-wa-bubble-in text-wa-bubble-text",
        )}
      >
        {!isOut ? (
          <div className="mb-1.5 flex items-center justify-between gap-2 pb-1 select-none border-b border-wa-divider/20">
            <div className="flex items-center gap-1.5">
              <span className="text-[12.5px] font-bold text-wa-green">נועה AI</span>
              <span className="inline-flex items-center rounded-sm bg-wa-green/15 px-1 py-0.2 text-[9.5px] font-semibold text-wa-green">
                סבן רשמי ✓
              </span>
            </div>
            {message.text ? (
              <button
                type="button"
                onClick={handleToggleSpeech}
                title={isSpeakingThis ? "עצירת הקראה" : "הקראת הודעה בקול נשי בעברית 🔊"}
                aria-label={isSpeakingThis ? "עצירת הקראה" : "הקראת הודעה בקול של נועה"}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold transition-all shadow-2xs",
                  isSpeakingThis
                    ? "bg-wa-green text-wa-shell animate-pulse scale-102"
                    : "bg-wa-hover/80 text-wa-meta hover:bg-wa-green/15 hover:text-wa-green",
                )}
              >
                {isSpeakingThis ? (
                  <>
                    <span className="flex items-center gap-0.5">
                      <span
                        className="size-1 rounded-full bg-current animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="size-1 rounded-full bg-current animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="size-1 rounded-full bg-current animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                    <span>עצור</span>
                    <Square className="size-2.5 fill-current" />
                  </>
                ) : (
                  <>
                    <Volume2 className="size-3" />
                    <span>הקשב לנועה</span>
                  </>
                )}
              </button>
            ) : null}
          </div>
        ) : null}
        {message.whatsappBadge ? (
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 select-none">
            <Smartphone className="size-3 text-emerald-400 shrink-0" />
            <span>הודעת WhatsApp</span>
            <span className="text-emerald-500/60">•</span>
            <span className="flex items-center gap-1 text-emerald-300">
              <Zap className="size-2.5 text-emerald-400" />
              {message.whatsappBadge.statusText || "סונכרן מול Make Webhook ⚡ (200 OK)"}
            </span>
          </div>
        ) : null}
        {message.card ? <OrderCard card={message.card} /> : null}
        {message.journalCard ? <JournalCardView card={message.journalCard} /> : null}
        {message.text ? <FormattedChatMessage text={message.text} isOut={isOut} /> : null}
        <span className="mt-1 flex items-center justify-end gap-1 text-[11px] text-wa-meta select-none">
          {message.time}
          {isOut ? <Ticks status={message.status} /> : null}
        </span>
      </div>
    </div>
  );
}

export function TypingIndicator({
  users,
  fallbackName = "נועה AI",
}: {
  users?: TypingUser[];
  fallbackName?: string;
}) {
  const activeUsers = users && users.length > 0 ? users : null;
  const firstUser = activeUsers?.[0];

  let label = `${fallbackName} מקליד/ה`;
  if (activeUsers) {
    if (activeUsers.length === 1) {
      label = firstUser?.statusText || `${firstUser?.userName} מקליד/ה`;
    } else if (activeUsers.length === 2) {
      label = `${activeUsers[0].userName} ו-${activeUsers[1].userName} מקלידים`;
    } else {
      label = `${activeUsers[0].userName} ו-${activeUsers.length - 1} נוספים מקלידים`;
    }
  }

  return (
    <div className="wa-pop flex items-end gap-2 justify-start my-1.5">
      {firstUser?.avatar ? (
        <img
          src={firstUser.avatar}
          alt={firstUser.userName}
          className="size-7 rounded-full object-cover shadow-xs ring-1 ring-wa-divider shrink-0"
        />
      ) : (
        <div className="size-7 rounded-full bg-wa-panel flex items-center justify-center text-[11px] font-semibold text-wa-meta border border-wa-divider shrink-0">
          {firstUser ? firstUser.userName.charAt(0) : "נ"}
        </div>
      )}

      <div className="flex items-center gap-2.5 rounded-lg rounded-es-none bg-wa-bubble-in px-3.5 py-2 shadow-xs border border-wa-divider/30">
        <span className="text-xs font-medium text-wa-bubble-text">{label}</span>
        <span className="flex items-center gap-1">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="size-1.5 rounded-full bg-wa-green"
              style={{ animation: `wa-typing 1.1s ${index * 0.16}s infinite ease-in-out` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
