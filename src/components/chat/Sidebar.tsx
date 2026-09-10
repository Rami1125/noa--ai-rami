import { useMemo, useState } from "react";
import { Search, MessageSquarePlus, MoreVertical, BellOff, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { CONVERSATIONS, type Conversation } from "@/lib/chat-data";

type Tab = "all" | "unread" | "groups";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "unread", label: "לא נקראו" },
  { id: "groups", label: "קבוצות" },
];

type SidebarProps = {
  activeId: string;
  onSelect: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  className?: string;
};

function Avatar({ conversation }: { conversation: Conversation }) {
  if (conversation.avatar) {
    return (
      <img
        src={conversation.avatar}
        alt={conversation.name}
        loading="lazy"
        className="size-12 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-wa-topbar text-lg font-semibold text-wa-meta">
      {conversation.initials}
    </div>
  );
}

export function Sidebar({ activeId, onSelect, isDark, onToggleTheme, className }: SidebarProps) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const conversations = useMemo(() => {
    return CONVERSATIONS.filter((c) => {
      if (tab === "unread" && c.unread === 0) return false;
      if (tab === "groups" && c.kind !== "group") return false;
      if (query.trim() && !c.name.includes(query.trim())) return false;
      return true;
    });
  }, [tab, query]);

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-s border-wa-divider bg-wa-panel md:w-[380px] lg:w-[420px]",
        className,
      )}
    >
      <header className="flex items-center justify-between bg-wa-topbar px-4 py-2.5">
        <h1 className="text-lg font-semibold text-wa-bubble-text">צ&apos;אטים</h1>
        <div className="flex items-center gap-1 text-wa-meta">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? "מצב בהיר" : "מצב כהה"}
            className="rounded-full p-2 transition-colors hover:bg-wa-hover"
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          <button
            type="button"
            aria-label="צ'אט חדש"
            className="rounded-full p-2 transition-colors hover:bg-wa-hover"
          >
            <MessageSquarePlus className="size-5" />
          </button>
          <button
            type="button"
            aria-label="תפריט"
            className="rounded-full p-2 transition-colors hover:bg-wa-hover"
          >
            <MoreVertical className="size-5" />
          </button>
        </div>
      </header>

      <div className="bg-wa-panel px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg bg-wa-panel-alt px-3 py-2">
          <Search className="size-4 text-wa-meta" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="חיפוש או התחלת צ'אט חדש"
            className="w-full bg-transparent text-sm text-wa-bubble-text outline-none placeholder:text-wa-meta"
          />
        </div>
      </div>

      <div className="flex gap-2 px-3 pb-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-full px-3 py-1 text-sm transition-colors",
              tab === item.id
                ? "bg-wa-green/20 text-wa-green"
                : "bg-wa-panel-alt text-wa-meta hover:bg-wa-hover",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="wa-scroll flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-3 text-start transition-colors",
              conversation.id === activeId ? "bg-wa-hover" : "hover:bg-wa-hover",
            )}
          >
            <Avatar conversation={conversation} />
            <span className="min-w-0 flex-1 border-b border-wa-divider pb-3">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-[15px] font-medium text-wa-bubble-text">
                  {conversation.name}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-xs",
                    conversation.unread > 0 ? "text-wa-badge" : "text-wa-meta",
                  )}
                >
                  {conversation.time}
                </span>
              </span>
              <span className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-[13px] text-wa-meta">{conversation.preview}</span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {conversation.muted ? <BellOff className="size-3.5 text-wa-meta" /> : null}
                  {conversation.unread > 0 ? (
                    <span className="flex min-w-5 items-center justify-center rounded-full bg-wa-badge px-1.5 text-[11px] font-semibold text-wa-shell">
                      {conversation.unread}
                    </span>
                  ) : null}
                </span>
              </span>
            </span>
          </button>
        ))}
        {conversations.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-wa-meta">לא נמצאו צ&apos;אטים</p>
        ) : null}
      </div>
    </aside>
  );
}
