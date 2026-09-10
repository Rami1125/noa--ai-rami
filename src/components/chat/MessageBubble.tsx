import { CheckCheck, Check, MapPin, Navigation, Package, Clock, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { ACTION_LABELS, type Message, type TaskCard } from "@/lib/chat-data";

function Ticks({ status }: { status: Message["status"] }) {
  if (!status) return null;
  if (status === "sent") return <Check className="size-4 text-wa-meta" />;
  return (
    <CheckCheck className={cn("size-4", status === "read" ? "text-wa-tick" : "text-wa-meta")} />
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

export function MessageBubble({ message }: { message: Message }) {
  const isOut = message.author === "me";

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
        {message.card ? <OrderCard card={message.card} /> : null}
        {message.text ? <p className="whitespace-pre-wrap break-words">{message.text}</p> : null}
        <span className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-wa-meta">
          {message.time}
          {isOut ? <Ticks status={message.status} /> : null}
        </span>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-lg rounded-es-none bg-wa-bubble-in px-3 py-2.5 shadow-sm">
        <span className="text-xs text-wa-meta">נועה מקלידה</span>
        <span className="flex items-center gap-1">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="size-1.5 rounded-full bg-wa-meta"
              style={{ animation: `wa-typing 1.2s ${index * 0.18}s infinite ease-in-out` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
