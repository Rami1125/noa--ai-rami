import React from "react";
import { Sparkles } from "lucide-react";

interface FormattedChatMessageProps {
  text: string;
  isOut: boolean;
}

const BULLET_PREFIXES = ["🔹", "🔸", "▪️", "▫️", "▶️", "✔️"];
const HEADER_PREFIXES = [
  "👤",
  "📋",
  "📦",
  "🏗️",
  "🧱",
  "🚛",
  "📐",
  "💧",
  "🌙",
  "💡",
  "🚚",
  "🚩",
  "✨",
  "🔔",
  "⚠️",
  "🚨",
  "📍",
  "⏰",
  "📞",
];

/**
 * Parses inline formatting like *bold*, **bold**, _italic_, phone numbers and links,
 * completely stripping asterisks and converting them to modern HTML/React typography.
 */
function renderInlineContent(content: string, keyPrefix: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s]+|0[2-9]\d?-?\d{7}|05\d-?\d{7})/g;
  const parts = content.split(pattern);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (!part) return null;

    // Bold with ** or *
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length > 4) ||
      (part.startsWith("*") && part.endsWith("*") && part.length > 2)
    ) {
      const cleanText = part.replace(/^\*+|\*+$/g, "");
      return (
        <strong key={key} className="font-bold text-wa-bubble-text">
          {cleanText}
        </strong>
      );
    }

    // URLs
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={key}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-wa-tick underline font-medium hover:opacity-80 break-all transition-opacity"
        >
          {part}
        </a>
      );
    }

    // Phone numbers
    if (/^0[2-9]\d?-?\d{7}$/.test(part) || /^05\d-?\d{7}$/.test(part)) {
      const cleanPhone = part.replace(/\D/g, "");
      return (
        <a
          key={key}
          href={`tel:${cleanPhone}`}
          className="text-wa-tick font-semibold hover:underline"
        >
          {part}
        </a>
      );
    }

    // Clean any stray asterisks that might remain
    const sanitized = part.replace(/\*/g, "");
    return <React.Fragment key={key}>{sanitized}</React.Fragment>;
  });
}

export function FormattedChatMessage({ text, isOut }: FormattedChatMessageProps) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  let isNoaSignature = false;
  let signatureText = "";

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    // Empty line / paragraph break
    if (!line) {
      elements.push(<div key={`spacer-${idx}`} className="h-1.5" />);
      return;
    }

    // Detect Noa signature line
    if (
      line.includes("נועה ❤️") ||
      line.includes("נועה AI") ||
      (line.includes("נועה") && line.includes("סידור ח. סבן")) ||
      (line.includes("נועה") && line.includes("המאמנת האישית"))
    ) {
      isNoaSignature = true;
      signatureText = line.replace(/\*/g, "").trim();
      return;
    }

    // Clean any leading asterisks from list items
    let cleanedLine = line;
    let isBullet = false;
    let bulletEmoji = "";

    const foundBullet = BULLET_PREFIXES.find((b) => cleanedLine.startsWith(b));

    if (/^[*•-]\s+/.test(cleanedLine)) {
      isBullet = true;
      cleanedLine = cleanedLine.replace(/^[*•-]\s+/, "");
      bulletEmoji = "🔹";
    } else if (foundBullet) {
      isBullet = true;
      bulletEmoji = foundBullet;
      cleanedLine = cleanedLine.slice(foundBullet.length).trim();
    }

    const isHeaderLine = HEADER_PREFIXES.some((h) => line.startsWith(h));

    if (isHeaderLine) {
      elements.push(
        <div
          key={`header-${idx}`}
          className="font-bold text-[15px] text-wa-bubble-text flex items-baseline gap-1.5 mt-1.5 mb-1 pb-0.5 border-b border-wa-divider/30"
        >
          <span>{renderInlineContent(cleanedLine, `line-${idx}`)}</span>
        </div>,
      );
    } else if (isBullet) {
      elements.push(
        <div
          key={`bullet-${idx}`}
          className="flex items-start gap-2 text-[14px] leading-relaxed my-0.5 ps-1"
        >
          <span className="shrink-0 text-xs mt-0.5 select-none">{bulletEmoji || "🔹"}</span>
          <span className="flex-1">{renderInlineContent(cleanedLine, `line-${idx}`)}</span>
        </div>,
      );
    } else {
      elements.push(
        <p key={`p-${idx}`} className="text-[14.5px] leading-relaxed break-words my-0.5">
          {renderInlineContent(cleanedLine, `line-${idx}`)}
        </p>,
      );
    }
  });

  return (
    <div className="space-y-0.5 text-wa-bubble-text select-text">
      {elements}

      {!isOut && isNoaSignature ? (
        <div className="mt-2.5 pt-2 border-t border-wa-divider/40 flex items-center justify-between text-[11px] text-wa-green font-medium select-none">
          <div className="flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa-green opacity-50" />
              <span className="relative inline-flex rounded-full size-2 bg-wa-green" />
            </span>
            <span className="font-bold tracking-tight">
              {signatureText || "נועה ❤️ | סידור ח. סבן"}
            </span>
          </div>
          <span className="text-[10px] text-wa-meta bg-wa-hover/60 px-1.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="size-2.5 text-wa-green" />
            SabanOS
          </span>
        </div>
      ) : null}
    </div>
  );
}
