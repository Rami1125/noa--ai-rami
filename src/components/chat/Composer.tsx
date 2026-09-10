import { useEffect, useRef, useState } from "react";
import {
  Camera,
  FileText,
  Image as ImageIcon,
  MapPin,
  Mic,
  Paperclip,
  Send,
  Smile,
  Sticker,
  Trash2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { EMOJIS } from "@/lib/chat-data";

type ComposerProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

const ATTACH_ITEMS = [
  { id: "document", label: "מסמך", hint: "צירוף PDF", icon: FileText },
  { id: "camera", label: "מצלמה", hint: "צילום עכשיו", icon: Camera },
  { id: "gallery", label: "גלריה", hint: "תמונות וסרטונים", icon: ImageIcon },
  { id: "location", label: "מיקום", hint: "שיתוף Waze", icon: MapPin },
] as const;

function formatDuration(seconds: number) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function Composer({ onSend, disabled }: ComposerProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  const submit = () => {
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText("");
    setShowEmoji(false);
    setShowAttach(false);
    inputRef.current?.focus();
  };

  const startRecording = () => {
    setElapsed(0);
    setRecording(true);
    setShowEmoji(false);
    setShowAttach(false);
  };

  const stopRecording = (send: boolean) => {
    setRecording(false);
    if (send && elapsed > 0) {
      onSend(`🎙️ הודעה קולית (${formatDuration(elapsed)})`);
    }
    setElapsed(0);
  };

  const handleAttach = (id: (typeof ATTACH_ITEMS)[number]["id"]) => {
    setShowAttach(false);
    if (id === "document" || id === "gallery") {
      fileRef.current?.click();
      return;
    }
    if (id === "location") {
      onSend(
        "📍 שיתוף מיקום: https://waze.com/ul?q=%D7%94%D7%90%D7%95%D7%A8%D7%92%D7%99%D7%9D%2030%20%D7%97%D7%95%D7%9C%D7%95%D7%9F&navigate=yes",
      );
      return;
    }
    onSend("📷 נשלחה תמונה מהמצלמה");
  };

  if (recording) {
    return (
      <div className="flex items-center gap-3 bg-wa-topbar px-3 py-2.5">
        <button
          type="button"
          onClick={() => stopRecording(false)}
          aria-label="ביטול הקלטה"
          className="rounded-full p-2 text-destructive transition-colors hover:bg-wa-hover"
        >
          <Trash2 className="size-5" />
        </button>

        <span className="flex size-2.5 animate-pulse rounded-full bg-destructive" />
        <span className="tabular-nums text-sm text-wa-bubble-text">{formatDuration(elapsed)}</span>

        <div className="flex h-8 flex-1 items-center gap-[3px] overflow-hidden">
          {Array.from({ length: 40 }).map((_, index) => (
            <span
              key={index}
              className="w-[3px] flex-1 rounded-full bg-wa-green"
              style={{
                height: `${30 + ((index * 37) % 60)}%`,
                animation: `wa-wave ${0.6 + (index % 5) * 0.12}s ${index * 0.03}s infinite ease-in-out`,
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => stopRecording(true)}
          aria-label="שליחת ההקלטה"
          className="flex size-10 items-center justify-center rounded-full bg-wa-green text-wa-shell transition-colors hover:bg-wa-green-strong"
        >
          <Send className="size-5 rtl:-scale-x-100" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative bg-wa-topbar px-2 py-2 sm:px-3">
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSend(`📎 צורף קובץ: ${file.name}`);
          event.target.value = "";
        }}
      />

      {showEmoji ? (
        <div className="wa-pop absolute bottom-full end-2 mb-2 w-[280px] rounded-xl border border-wa-divider bg-wa-panel p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-wa-meta">אימוג&apos;ים ומדבקות</span>
            <button
              type="button"
              onClick={() => setShowEmoji(false)}
              aria-label="סגירה"
              className="text-wa-meta"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setText((value) => value + emoji)}
                className="rounded p-1 text-lg transition-colors hover:bg-wa-hover"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showAttach ? (
        <div className="wa-pop absolute bottom-full start-2 mb-2 w-56 overflow-hidden rounded-xl border border-wa-divider bg-wa-panel shadow-lg">
          {ATTACH_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAttach(item.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-wa-hover"
            >
              <item.icon className="size-5 text-wa-green" />
              <span>
                <span className="block text-sm text-wa-bubble-text">{item.label}</span>
                <span className="block text-xs text-wa-meta">{item.hint}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-end gap-1.5">
        <div className="flex items-center text-wa-meta">
          <button
            type="button"
            onClick={() => {
              setShowEmoji((value) => !value);
              setShowAttach(false);
            }}
            aria-label="אימוג'י"
            className="rounded-full p-2 transition-colors hover:bg-wa-hover"
          >
            <Smile className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => setShowEmoji((value) => !value)}
            aria-label="מדבקות"
            className="hidden rounded-full p-2 transition-colors hover:bg-wa-hover sm:block"
          >
            <Sticker className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAttach((value) => !value);
              setShowEmoji(false);
            }}
            aria-label="צירוף קובץ"
            className={cn(
              "rounded-full p-2 transition-transform hover:bg-wa-hover",
              showAttach && "rotate-45",
            )}
          >
            <Paperclip className="size-6" />
          </button>
        </div>

        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="הקלד/י הודעה"
          className="wa-scroll max-h-32 min-h-11 flex-1 resize-none rounded-2xl bg-wa-panel px-4 py-2.5 text-[15px] text-wa-bubble-text outline-none placeholder:text-wa-meta"
        />

        {text.trim() ? (
          <button
            type="button"
            onClick={submit}
            disabled={disabled}
            aria-label="שליחה"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-wa-green text-wa-shell transition-colors hover:bg-wa-green-strong disabled:opacity-60"
          >
            <Send className="size-5 rtl:-scale-x-100" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            aria-label="הקלטת הודעה קולית"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-wa-green text-wa-shell transition-colors hover:bg-wa-green-strong"
          >
            <Mic className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
