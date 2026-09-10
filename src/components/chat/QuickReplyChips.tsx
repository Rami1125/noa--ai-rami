import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Edit3, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  QUICK_COMMAND_CATEGORIES,
  QUICK_DISPATCH_COMMANDS,
  type QuickCommand,
  type QuickCommandCategory,
} from "@/lib/chat-data";

type QuickReplyChipsProps = {
  onSend: (text: string) => void;
  onInsert: (text: string) => void;
  disabled?: boolean;
};

export function QuickReplyChips({ onSend, onInsert, disabled }: QuickReplyChipsProps) {
  const [selectedCategory, setSelectedCategory] = useState<QuickCommandCategory>("all");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredCommands = useMemo(() => {
    if (selectedCategory === "all") {
      return QUICK_DISPATCH_COMMANDS;
    }
    return QUICK_DISPATCH_COMMANDS.filter((cmd) => cmd.category === selectedCategory);
  }, [selectedCategory]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const offset = direction === "right" ? 180 : -180;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleChipClick = (cmd: QuickCommand) => {
    if (disabled) return;
    if (cmd.action === "send") {
      onSend(cmd.prompt);
    } else {
      onInsert(cmd.prompt);
    }
  };

  return (
    <div
      id="quick-dispatch-chips-container"
      className="border-b border-wa-divider/70 bg-wa-panel-alt/60 px-2 py-1.5 transition-colors sm:px-3"
    >
      {/* Header bar: category filter & toggle */}
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold text-wa-green transition-colors hover:bg-wa-hover"
            title={isCollapsed ? "הצגת פקודות סידור" : "הסתרת פקודות סידור"}
          >
            <Sparkles className="size-3.5" />
            <span className="whitespace-nowrap">פקודות סידור</span>
            <span className="rounded bg-wa-green/15 px-1 py-0.2 text-[10px] text-wa-green-strong">
              {filteredCommands.length}
            </span>
          </button>

          {!isCollapsed ? (
            <div className="flex items-center gap-1">
              {QUICK_COMMAND_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  id={`cat-filter-${cat.id}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium transition-all",
                    selectedCategory === cat.id
                      ? "bg-wa-green text-wa-shell shadow-xs"
                      : "bg-wa-panel text-wa-meta hover:bg-wa-hover hover:text-wa-bubble-text",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Scroll navigation arrows for desktop */}
        {!isCollapsed ? (
          <div className="hidden items-center gap-0.5 sm:flex">
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="rounded p-1 text-wa-meta transition-colors hover:bg-wa-hover hover:text-wa-bubble-text"
              aria-label="גלול ימינה"
              title="גלול ימינה"
            >
              <ChevronRight className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="rounded p-1 text-wa-meta transition-colors hover:bg-wa-hover hover:text-wa-bubble-text"
              aria-label="גלול שמאלה"
              title="גלול שמאלה"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Quick Reply Chips horizontal track */}
      {!isCollapsed ? (
        <div
          ref={scrollContainerRef}
          className="wa-scroll flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar"
        >
          {filteredCommands.map((cmd) => {
            const isInstantSend = cmd.action === "send";

            return (
              <div key={cmd.id} className="group relative flex shrink-0 items-center">
                <button
                  id={`quick-cmd-${cmd.id}`}
                  type="button"
                  onClick={() => handleChipClick(cmd)}
                  disabled={disabled}
                  title={`${cmd.description} (${isInstantSend ? "שליחה ישירה" : "הזנה לשדה ההודעה"})`}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border border-wa-divider bg-wa-panel px-2.5 py-1 text-xs font-medium text-wa-bubble-text shadow-xs transition-all",
                    "hover:border-wa-green/60 hover:bg-wa-hover active:scale-[0.97]",
                    disabled && "opacity-60 cursor-not-allowed",
                  )}
                >
                  <span className="text-[13px] leading-none" aria-hidden="true">
                    {cmd.emoji}
                  </span>
                  <span className="whitespace-nowrap">{cmd.label}</span>

                  {isInstantSend ? (
                    <Send
                      className="size-2.5 text-wa-green opacity-75 transition-transform group-hover:scale-110 rtl:-scale-x-100"
                      aria-hidden="true"
                    />
                  ) : (
                    <Edit3
                      className="size-2.5 text-wa-meta opacity-80 transition-transform group-hover:scale-110"
                      aria-hidden="true"
                    />
                  )}
                </button>

                {/* Secondary action: if it is a send command, user can also click a small edit icon to inspect/customize */}
                {isInstantSend ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsert(cmd.prompt);
                    }}
                    title="הכנס לשדה לעריכה לפני שליחה"
                    className="absolute -top-1 -start-1 hidden size-4 items-center justify-center rounded-full bg-wa-panel border border-wa-divider text-[9px] text-wa-meta opacity-0 shadow-xs transition-all hover:text-wa-green group-hover:flex group-hover:opacity-100"
                  >
                    <Edit3 className="size-2.5" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
