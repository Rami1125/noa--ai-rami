import { useState } from "react";
import { ArrowRight, Phone, Search, Video, MoreVertical, Image as ImageIcon } from "lucide-react";

import { NOA_AVATAR } from "@/lib/chat-data";

type ChatHeaderProps = {
  title: string;
  status: string;
  onBack?: () => void;
  onOpenWallpaper?: () => void;
};

export function ChatHeader({ title, status, onBack, onOpenWallpaper }: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

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

      <img src={NOA_AVATAR} alt="נועה AI" className="size-10 shrink-0 rounded-full object-cover" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-wa-bubble-text">{title}</p>
        <p className="truncate text-xs text-wa-meta">{status}</p>
      </div>

      <div className="flex items-center gap-1 text-wa-meta">
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
            <div className="wa-pop absolute end-0 top-full z-40 mt-1.5 w-48 overflow-hidden rounded-xl border border-wa-divider bg-wa-panel py-1 shadow-lg">
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
