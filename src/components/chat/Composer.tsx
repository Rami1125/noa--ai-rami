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
  Moon,
  Brain,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { QuickReplyChips } from "@/components/chat/QuickReplyChips";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { MessageInput } from "@/components/chat/MessageInput";

export { MessageInput } from "@/components/chat/MessageInput";

type ComposerProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  onTypingChange?: (isTyping: boolean) => void;
  onOpenJournal?: () => void;
};

const ATTACH_ITEMS = [
  { id: "journal", label: "יומן ומאגר פסיכולוגי", hint: "חוסן מנטלי ו-CBT 🧠", icon: Brain },
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

export function Composer({ onSend, disabled, onTypingChange, onOpenJournal }: ComposerProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<number | null>(null);

  const notifyTyping = () => {
    if (!onTypingChange) return;
    onTypingChange(true);
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = window.setTimeout(() => {
      onTypingChange(false);
      typingTimerRef.current = null;
    }, 2000);
  };

  const clearTyping = () => {
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    onTypingChange?.(false);
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
      onTypingChange?.(false);
    };
  }, [onTypingChange]);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  const submit = () => {
    const value = text.trim();
    if (!value || disabled) return;
    clearTyping();
    onSend(value);
    setText("");
    setShowEmoji(false);
    setShowAttach(false);
    inputRef.current?.focus();
  };

  const startRecording = () => {
    notifyTyping();
    setElapsed(0);
    setRecording(true);
    setShowEmoji(false);
    setShowAttach(false);
  };

  const stopRecording = (send: boolean) => {
    clearTyping();
    setRecording(false);
    if (send && elapsed > 0) {
      onSend(`🎙️ הודעה קולית (${formatDuration(elapsed)})`);
    }
    setElapsed(0);
  };

  const handleAttach = (id: (typeof ATTACH_ITEMS)[number]["id"]) => {
    setShowAttach(false);
    if (id === "journal") {
      onOpenJournal?.();
      return;
    }
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

  const handleInsertEmoji = (emoji: string) => {
    const textarea = inputRef.current;
    if (!textarea) {
      setText((prev) => prev + emoji);
      notifyTyping();
      return;
    }

    const start = textarea.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? text.length;
    const nextText = text.slice(0, start) + emoji + text.slice(end);
    setText(nextText);
    notifyTyping();

    // Preserve cursor position right after the inserted emoji and keep textarea focused
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const nextPos = start + emoji.length;
        inputRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 15);
  };

  const handleInsert = (template: string) => {
    setText((prev) => {
      if (!prev.trim()) return template;
      return `${prev} ${template}`;
    });
    setShowEmoji(false);
    setShowAttach(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(
          inputRef.current.value.length,
          inputRef.current.value.length,
        );
      }
    }, 40);
  };

  if (recording) {
    return (
      <div className="flex items-center gap-3 bg-wa-panel px-3 py-2.5 border-t border-wa-divider">
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
    <div className="relative flex flex-col bg-wa-panel border-t border-wa-divider">
      {/* Clickable quick-reply chips above the message input field */}
      <QuickReplyChips onSend={onSend} onInsert={handleInsert} disabled={disabled} />

      <div className="relative px-2 py-2 sm:px-3">
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
          <div className="absolute bottom-full start-2 sm:start-4 z-30 mb-2">
            <EmojiPicker onSelect={handleInsertEmoji} onClose={() => setShowEmoji(false)} />
          </div>
        ) : null}

        {showAttach ? (
          <div className="wa-pop absolute bottom-full start-2 z-30 mb-2 w-56 overflow-hidden rounded-xl border border-wa-divider bg-wa-panel shadow-lg">
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

        <MessageInput
          ref={inputRef}
          value={text}
          onChange={(val) => {
            setText(val);
            if (val.trim()) {
              notifyTyping();
            } else {
              clearTyping();
            }
          }}
          onSend={submit}
          onAttachClick={() => {
            setShowAttach((value) => !value);
            setShowEmoji(false);
          }}
          onEmojiClick={() => {
            setShowEmoji((value) => !value);
            setShowAttach(false);
          }}
          onVoiceClick={startRecording}
          disabled={disabled}
          isAttachActive={showAttach}
          isEmojiActive={showEmoji}
          className="border-none bg-transparent px-0 py-0 shadow-none"
        />
      </div>
    </div>
  );
}
