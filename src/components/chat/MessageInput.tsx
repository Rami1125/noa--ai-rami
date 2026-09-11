import { forwardRef, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { Paperclip, Send, Smile, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttachClick?: () => void;
  onEmojiClick?: () => void;
  onVoiceClick?: () => void;
  disabled?: boolean;
  placeholder?: string;
  isAttachActive?: boolean;
  isEmojiActive?: boolean;
  className?: string;
};

export const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(
  function MessageInput(
    {
      value,
      onChange,
      onSend,
      onAttachClick,
      onEmojiClick,
      onVoiceClick,
      disabled = false,
      placeholder = "הקלד/י הודעה...",
      isAttachActive = false,
      isEmojiActive = false,
      className,
    },
    ref,
  ) {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const textareaRef = (ref || internalRef) as React.MutableRefObject<HTMLTextAreaElement | null>;

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !disabled) {
          onSend();
        }
      }
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    };

    const hasContent = value.trim().length > 0;

    return (
      <div
        id="message-input-panel"
        className={cn(
          "relative flex items-end gap-2 bg-wa-panel px-3 py-2.5 sm:px-4 border-t border-wa-divider shadow-sm transition-colors",
          className,
        )}
      >
        {/* Left utility buttons: Emoji and Attachment */}
        <div className="flex items-center gap-1 text-wa-meta pb-0.5">
          {onEmojiClick ? (
            <button
              id="message-emoji-button"
              type="button"
              onClick={onEmojiClick}
              disabled={disabled}
              aria-label="בחירת אימוג'י ומדבקות"
              title="אימוג'י ומדבקות"
              className={cn(
                "rounded-full p-2 transition-colors hover:bg-wa-hover active:scale-95 disabled:opacity-50",
                isEmojiActive ? "text-wa-green bg-wa-hover" : "text-wa-meta",
              )}
            >
              <Smile className="size-5 sm:size-6" />
            </button>
          ) : null}

          {onAttachClick ? (
            <button
              id="message-attach-button"
              type="button"
              onClick={onAttachClick}
              disabled={disabled}
              aria-label="צירוף קובץ או מסמך"
              title="צירוף קובץ"
              className={cn(
                "rounded-full p-2 transition-all hover:bg-wa-hover active:scale-95 disabled:opacity-50",
                isAttachActive ? "rotate-45 text-wa-green bg-wa-hover" : "text-wa-meta",
              )}
            >
              <Paperclip className="size-5 sm:size-6" />
            </button>
          ) : null}
        </div>

        {/* Center: Flexible text field using wa-panel styling */}
        <div className="relative flex-1 min-w-0">
          <textarea
            id="message-text-field"
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="wa-scroll max-h-36 min-h-11 w-full resize-none rounded-2xl border border-wa-divider/70 bg-wa-panel px-4 py-2.5 text-[15px] leading-relaxed text-wa-bubble-text outline-none transition-all placeholder:text-wa-meta focus:border-wa-green/60 focus:ring-1 focus:ring-wa-green/30 disabled:opacity-60"
          />
        </div>

        {/* Right: Send button or Voice Recording button */}
        <div className="flex items-center pb-0.5">
          {hasContent ? (
            <button
              id="message-send-button"
              type="button"
              onClick={onSend}
              disabled={disabled || !hasContent}
              aria-label="שליחת הודעה"
              title="שליחה"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-wa-green text-wa-shell shadow-sm transition-all duration-150 hover:bg-wa-green-strong active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="size-5 rtl:-scale-x-100" />
            </button>
          ) : onVoiceClick ? (
            <button
              id="message-voice-button"
              type="button"
              onClick={onVoiceClick}
              disabled={disabled}
              aria-label="הקלטת הודעה קולית"
              title="הודעה קולית"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-wa-green text-wa-shell shadow-sm transition-all duration-150 hover:bg-wa-green-strong active:scale-95 disabled:opacity-50"
            >
              <Mic className="size-5" />
            </button>
          ) : (
            <button
              id="message-send-button-empty"
              type="button"
              disabled
              aria-label="שליחה"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-wa-panel border border-wa-divider text-wa-meta opacity-40 cursor-not-allowed"
            >
              <Send className="size-5 rtl:-scale-x-100" />
            </button>
          )}
        </div>
      </div>
    );
  },
);
