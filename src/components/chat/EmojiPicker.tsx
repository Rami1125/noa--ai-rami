import { useState, useMemo, useEffect, useRef } from "react";
import {
  Smile,
  ThumbsUp,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  X,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type EmojiItem = {
  emoji: string;
  name: string;
  category: "smileys" | "gestures" | "logistics" | "symbols" | "nature";
  keywords: string[];
};

export const EMOJI_DATABASE: EmojiItem[] = [
  // Smileys & Emotions
  {
    emoji: "😀",
    name: "חיוך רחב",
    category: "smileys",
    keywords: ["smile", "happy", "חיוך", "שמח"],
  },
  { emoji: "😃", name: "חיוך שמח", category: "smileys", keywords: ["grin", "joy", "חיוך", "צחוק"] },
  { emoji: "😄", name: "חיוך בעיניים", category: "smileys", keywords: ["laugh", "eyes", "שמחה"] },
  { emoji: "😁", name: "חיוך שיניים", category: "smileys", keywords: ["teeth", "beam", "שיניים"] },
  { emoji: "😆", name: "צחוק סגור", category: "smileys", keywords: ["satisfied", "haha", "חהחה"] },
  { emoji: "😅", name: "זיעה של הקלה", category: "smileys", keywords: ["sweat", "relief", "מזל"] },
  { emoji: "😂", name: "דמעות של צחוק", category: "smileys", keywords: ["lol", "crying", "צחוק"] },
  {
    emoji: "🤣",
    name: "מתגלגל מצחוק",
    category: "smileys",
    keywords: ["rofl", "hilarious", "מתגלגל"],
  },
  {
    emoji: "😊",
    name: "חיוך סמוק",
    category: "smileys",
    keywords: ["blush", "kind", "חמוד", "תודה"],
  },
  {
    emoji: "😇",
    name: "חיוך עם הילה",
    category: "smileys",
    keywords: ["angel", "innocent", "מלאך"],
  },
  { emoji: "🙂", name: "חיוך קל", category: "smileys", keywords: ["slight", "friendly", "בסדר"] },
  { emoji: "😉", name: "קריצה", category: "smileys", keywords: ["wink", "secret", "קריצה"] },
  { emoji: "😌", name: "הקלה ושלווה", category: "smileys", keywords: ["relieved", "calm", "רגוע"] },
  {
    emoji: "😍",
    name: "עיני לבבות",
    category: "smileys",
    keywords: ["love", "heart", "אוהב", "מעולה"],
  },
  { emoji: "🥰", name: "אוהב ומחבק", category: "smileys", keywords: ["hearts", "adore", "תענוג"] },
  { emoji: "😘", name: "נשיקה עם לב", category: "smileys", keywords: ["kiss", "love", "נשיקה"] },
  {
    emoji: "😎",
    name: "משקפי שמש",
    category: "smileys",
    keywords: ["cool", "glasses", "מגניב", "אלוף"],
  },
  {
    emoji: "🥳",
    name: "חגיגה ומסיבה",
    category: "smileys",
    keywords: ["party", "celebrate", "מזל טוב", "חגיגה"],
  },
  { emoji: "😏", name: "חיוך ממזרי", category: "smileys", keywords: ["smirk", "clever", "ממזר"] },
  {
    emoji: "🤔",
    name: "חושב ובודק",
    category: "smileys",
    keywords: ["think", "wonder", "מחשבה", "שאלה"],
  },
  {
    emoji: "🫡",
    name: "הצדעה ואישור",
    category: "smileys",
    keywords: ["salute", "yes sir", "קיבלתי", "הבנתי", "פקודה"],
  },
  { emoji: "🤫", name: "שקט וסודי", category: "smileys", keywords: ["shh", "quiet", "שקט"] },
  { emoji: "🤗", name: "חיבוק חם", category: "smileys", keywords: ["hug", "embrace", "חיבוק"] },
  {
    emoji: "🤩",
    name: "עיני כוכבים",
    category: "smileys",
    keywords: ["star", "excited", "וואו", "התרגשות"],
  },
  {
    emoji: "😴",
    name: "ישן ועייף",
    category: "smileys",
    keywords: ["sleep", "tired", "לילה טוב", "עייף"],
  },
  {
    emoji: "🥺",
    name: "מבט מתחנן",
    category: "smileys",
    keywords: ["pleading", "puppy eyes", "בבקשה"],
  },
  { emoji: "😢", name: "דמעה", category: "smileys", keywords: ["tear", "sad", "עצוב"] },
  { emoji: "😭", name: "בכי", category: "smileys", keywords: ["cry", "loud", "בוכה"] },
  {
    emoji: "🤯",
    name: "ראש מתפוצץ",
    category: "smileys",
    keywords: ["mind blown", "shock", "הלם"],
  },
  { emoji: "😱", name: "צעקה והפתעה", category: "smileys", keywords: ["scream", "scared", "שוק"] },

  // Gestures & People
  {
    emoji: "👍",
    name: "אגודל למעלה / אישור",
    category: "gestures",
    keywords: ["thumbs up", "like", "ok", "אישור", "כן", "מעולה"],
  },
  {
    emoji: "👎",
    name: "אגודל למטה",
    category: "gestures",
    keywords: ["thumbs down", "dislike", "לא"],
  },
  {
    emoji: "👌",
    name: "מושלם / סגור",
    category: "gestures",
    keywords: ["ok", "perfect", "סגור", "בול"],
  },
  {
    emoji: "✌️",
    name: "שלום / ניצחון",
    category: "gestures",
    keywords: ["peace", "victory", "ניצחון"],
  },
  {
    emoji: "🤞",
    name: "מחזיק אצבעות",
    category: "gestures",
    keywords: ["fingers crossed", "luck", "בהצלחה"],
  },
  { emoji: "🤟", name: "אוהב אותך", category: "gestures", keywords: ["love you", "rock"] },
  {
    emoji: "🤙",
    name: "דבר איתי / קשר",
    category: "gestures",
    keywords: ["call me", "phone", "צלצל", "דבר"],
  },
  {
    emoji: "👏",
    name: "מחיאות כפיים",
    category: "gestures",
    keywords: ["applause", "bravo", "כל הכבוד", "בראבו"],
  },
  {
    emoji: "🙌",
    name: "ידיים למעלה",
    category: "gestures",
    keywords: ["hooray", "celebrate", "יישר כוח"],
  },
  {
    emoji: "🫶",
    name: "לב עם הידיים",
    category: "gestures",
    keywords: ["heart hands", "love", "אהבה"],
  },
  {
    emoji: "🤝",
    name: "לחיצת יד / עסקה",
    category: "gestures",
    keywords: ["handshake", "deal", "הסכם", "סגור", "עסקה"],
  },
  {
    emoji: "🙏",
    name: "תודה / בבקשה",
    category: "gestures",
    keywords: ["please", "thank you", "תודה", "בבקשה", "סליחה"],
  },
  {
    emoji: "💪",
    name: "כוח ומוטיבציה",
    category: "gestures",
    keywords: ["muscle", "strong", "כוח", "אלופים", "חזק"],
  },
  {
    emoji: "✍️",
    name: "רושם / חותם",
    category: "gestures",
    keywords: ["writing", "sign", "רישום", "תעודה"],
  },
  {
    emoji: "👋",
    name: "שלום / להתראות",
    category: "gestures",
    keywords: ["wave", "hello", "bye", "היי", "ביי"],
  },
  { emoji: "🖐️", name: "כף יד פרוסה", category: "gestures", keywords: ["hand", "five", "עצור"] },
  {
    emoji: "👀",
    name: "עיניים בודקות",
    category: "gestures",
    keywords: ["eyes", "looking", "רואה", "מסתכל", "בודק"],
  },
  {
    emoji: "🗣️",
    name: "מדבר ומעדכן",
    category: "gestures",
    keywords: ["speaking", "talking", "מודיע"],
  },

  // Logistics, Construction & Transport (Saban Building Materials)
  {
    emoji: "🚚",
    name: "משאית חלוקה",
    category: "logistics",
    keywords: ["truck", "delivery", "משאית", "חלוקה", "הובלה", "אספקה"],
  },
  {
    emoji: "🚛",
    name: "משאית כבדה / סמיטריילר",
    category: "logistics",
    keywords: ["semi", "heavy truck", "פולטריילר", "משא"],
  },
  {
    emoji: "🚜",
    name: "טרקטור / מחפרון",
    category: "logistics",
    keywords: ["tractor", "site", "שופל", "טרקטור", "עפר"],
  },
  {
    emoji: "🏗️",
    name: "מנוף ובנייה",
    category: "logistics",
    keywords: ["crane", "construction", "בניין", "מנוף", "אתר"],
  },
  {
    emoji: "🏢",
    name: "בניין משרדים",
    category: "logistics",
    keywords: ["office", "building", "בניין", "משרד"],
  },
  {
    emoji: "🏭",
    name: "מפעל / מחסן לוגיסטי",
    category: "logistics",
    keywords: ["factory", "warehouse", "מחסן", "סבן", "חולון"],
  },
  {
    emoji: "🏠",
    name: "בית / אתר פרטי",
    category: "logistics",
    keywords: ["house", "home", "בית", "וילה", "לקוח"],
  },
  {
    emoji: "🧱",
    name: "לבנים וחומרי בניין",
    category: "logistics",
    keywords: ["bricks", "blocks", "בלוקים", "לבנים", "בטון"],
  },
  {
    emoji: "🪵",
    name: "עץ ולוחות",
    category: "logistics",
    keywords: ["wood", "timber", "עץ", "לוחות"],
  },
  { emoji: "🪜", name: "סולם", category: "logistics", keywords: ["ladder", "climb", "סולם"] },
  {
    emoji: "🧰",
    name: "ארגז כלים",
    category: "logistics",
    keywords: ["toolbox", "tools", "כלים", "ציוד"],
  },
  {
    emoji: "🔧",
    name: "מפתח ברגים",
    category: "logistics",
    keywords: ["wrench", "fix", "תיקון", "אחזקה"],
  },
  {
    emoji: "🔨",
    name: "פטיש",
    category: "logistics",
    keywords: ["hammer", "build", "פטיש", "בנייה"],
  },
  {
    emoji: "🛠️",
    name: "כלי עבודה",
    category: "logistics",
    keywords: ["tools", "equipment", "עבודה"],
  },
  {
    emoji: "🦺",
    name: "אפוד זוהר / בטיחות",
    category: "logistics",
    keywords: ["safety vest", "vest", "בטיחות", "אפוד"],
  },
  {
    emoji: "🪖",
    name: "קסדת מגן",
    category: "logistics",
    keywords: ["helmet", "safety", "קסדה", "בטיחות"],
  },
  {
    emoji: "📦",
    name: "מכולה / ארגז סחורה",
    category: "logistics",
    keywords: ["package", "box", "container", "מכולה", "חבילה", "ארגז"],
  },
  {
    emoji: "📥",
    name: "הצבת מכולה / קבלה",
    category: "logistics",
    keywords: ["inbox", "placement", "הצבה", "קליטה"],
  },
  {
    emoji: "🔄",
    name: "החלפת מכולה",
    category: "logistics",
    keywords: ["swap", "repeat", "החלפה", "סבב"],
  },
  {
    emoji: "📤",
    name: "הוצאת מכולה / פינוי",
    category: "logistics",
    keywords: ["outbox", "removal", "הוצאה", "פינוי", "איסוף"],
  },
  {
    emoji: "🏷️",
    name: "תגית / תעודת משלוח",
    category: "logistics",
    keywords: ["tag", "label", "תגית", "תעודה", "משלוח"],
  },
  {
    emoji: "📋",
    name: "לוח פקודות / סידור עבודה",
    category: "logistics",
    keywords: ["clipboard", "schedule", "סידור", "משימה", "רשימה"],
  },
  {
    emoji: "🧾",
    name: "קבלה / חשבונית",
    category: "logistics",
    keywords: ["receipt", "invoice", "חשבונית", "קבלה", "תשלום"],
  },
  {
    emoji: "📏",
    name: "סרגל מידות / קוב",
    category: "logistics",
    keywords: ["ruler", "measure", "מידות", "קוב"],
  },

  // Symbols & Indicators
  {
    emoji: "✅",
    name: "אישור ירוק / בוצע",
    category: "symbols",
    keywords: ["check", "done", "yes", "בוצע", "וי", "מאושר"],
  },
  { emoji: "✔️", name: "סימון V תקין", category: "symbols", keywords: ["tick", "ok", "תקין"] },
  {
    emoji: "❌",
    name: "ביטול / שגוי",
    category: "symbols",
    keywords: ["x", "cross", "cancel", "ביטול", "לא"],
  },
  {
    emoji: "⚠️",
    name: "אזהרה / שים לב",
    category: "symbols",
    keywords: ["warning", "caution", "זהירות", "אזהרה", "דחוף"],
  },
  {
    emoji: "🚨",
    name: "התרעה דחופה",
    category: "symbols",
    keywords: ["siren", "alert", "דחוף", "התרעה"],
  },
  {
    emoji: "⛔",
    name: "אין כניסה / חסום",
    category: "symbols",
    keywords: ["no entry", "stop", "חסום", "סגור"],
  },
  {
    emoji: "📍",
    name: "מיקום GPS / כתובת",
    category: "symbols",
    keywords: ["pin", "location", "gps", "waze", "מיקום", "כתובת"],
  },
  {
    emoji: "🗺️",
    name: "מפה וניווט",
    category: "symbols",
    keywords: ["map", "navigation", "מפה", "ניווט"],
  },
  {
    emoji: "🕐",
    name: "שעון / זמנים",
    category: "symbols",
    keywords: ["clock", "time", "שעה", "זמן", "מועד"],
  },
  {
    emoji: "⏰",
    name: "שעון מעורר / תזכורת",
    category: "symbols",
    keywords: ["alarm", "reminder", "תזכורת"],
  },
  {
    emoji: "⌛",
    name: "שעון חול / ממתין",
    category: "symbols",
    keywords: ["hourglass", "wait", "המתנה", "בטיפול"],
  },
  {
    emoji: "🔔",
    name: "פעמון עדכונים",
    category: "symbols",
    keywords: ["bell", "notify", "הודעה", "עדכון"],
  },
  {
    emoji: "💬",
    name: "בלון דיבור / צ'אט",
    category: "symbols",
    keywords: ["chat", "speech", "הודעה", "שיחה"],
  },
  { emoji: "💡", name: "רעיון / פתרון", category: "symbols", keywords: ["idea", "light", "רעיון"] },
  {
    emoji: "💰",
    name: "שק כסף / פקדון",
    category: "symbols",
    keywords: ["money", "cash", "כסף", "פקדון", "מחיר"],
  },
  {
    emoji: "💳",
    name: "כרטיס אשראי",
    category: "symbols",
    keywords: ["card", "credit", "אשראי", "תשלום"],
  },
  { emoji: "💵", name: "שטרות מזומן", category: "symbols", keywords: ["cash", "dollar", "מזומן"] },
  {
    emoji: "🎯",
    name: "מטרה / יעד",
    category: "symbols",
    keywords: ["target", "goal", "מטרה", "יעד", "בול"],
  },
  {
    emoji: "🚀",
    name: "מהיר / טס לאתר",
    category: "symbols",
    keywords: ["rocket", "fast", "מהיר", "טיל"],
  },
  { emoji: "❤️", name: "לב אדום", category: "symbols", keywords: ["heart", "love", "לב"] },
  { emoji: "🔥", name: "אש / מעולה", category: "symbols", keywords: ["fire", "hot", "אש", "חזק"] },
  { emoji: "⭐", name: "כוכב מצטיין", category: "symbols", keywords: ["star", "rating", "כוכב"] },

  // Nature, Refreshment & Everyday
  {
    emoji: "☀️",
    name: "שמש / בוקר טוב",
    category: "nature",
    keywords: ["sun", "morning", "בוקר", "שמש", "יום"],
  },
  {
    emoji: "🌤️",
    name: "שמש נעימה",
    category: "nature",
    keywords: ["sunny", "weather", "מזג אוויר"],
  },
  { emoji: "🌧️", name: "גשם / חורף", category: "nature", keywords: ["rain", "wet", "גשם"] },
  { emoji: "⚡", name: "ברק / חשמל", category: "nature", keywords: ["lightning", "power", "חשמל"] },
  {
    emoji: "☕",
    name: "קפה בוקר",
    category: "nature",
    keywords: ["coffee", "break", "קפה", "הפסקה"],
  },
  { emoji: "🥪", name: "כריך צהריים", category: "nature", keywords: ["sandwich", "lunch", "אוכל"] },
  {
    emoji: "🥤",
    name: "שתייה קרה",
    category: "nature",
    keywords: ["drink", "water", "שתייה", "מים"],
  },
  { emoji: "🌴", name: "עץ דקל", category: "nature", keywords: ["palm", "tree", "נוף"] },
  {
    emoji: "🎉",
    name: "קונפטי / שמחה",
    category: "nature",
    keywords: ["party", "tada", "מזל טוב", "כל הכבוד"],
  },
];

const CATEGORIES = [
  { id: "all", label: "הכל", icon: Sparkles },
  { id: "recent", label: "נפוצים", icon: Clock },
  { id: "smileys", label: "פרצופים", icon: Smile },
  { id: "gestures", label: "מחוות", icon: ThumbsUp },
  { id: "logistics", label: "סבן ולוגיסטיקה", icon: Truck },
  { id: "symbols", label: "סמלים ואישורים", icon: CheckCircle2 },
] as const;

type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  className?: string;
};

const DEFAULT_RECENTS = ["👍", "✅", "🚚", "📦", "📍", "🙏", "💪", "😊", "😀", "🔄"];

export function EmojiPicker({ onSelect, onClose, className }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<string[]>(DEFAULT_RECENTS);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent emojis from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("saban_recent_emojis");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRecentEmojis(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji);

    // Save to recents
    setRecentEmojis((prev) => {
      const next = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 16);
      try {
        window.localStorage.setItem("saban_recent_emojis", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleClearRecents = () => {
    setRecentEmojis(DEFAULT_RECENTS);
    try {
      window.localStorage.removeItem("saban_recent_emojis");
    } catch {
      // ignore
    }
  };

  const filteredEmojis = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    if (activeTab === "recent") {
      if (!trimmed) {
        return recentEmojis.map(
          (emoji) =>
            EMOJI_DATABASE.find((item) => item.emoji === emoji) || {
              emoji,
              name: "אימוג'י",
              category: "smileys" as const,
              keywords: [],
            },
        );
      }
    }

    return EMOJI_DATABASE.filter((item) => {
      // Category filter
      if (activeTab !== "all" && activeTab !== "recent" && item.category !== activeTab) {
        return false;
      }
      // Query filter
      if (!trimmed) return true;
      if (item.emoji.includes(trimmed)) return true;
      if (item.name.toLowerCase().includes(trimmed)) return true;
      return item.keywords.some((k) => k.toLowerCase().includes(trimmed));
    });
  }, [query, activeTab, recentEmojis]);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="בחירת אימוג'י"
      className={cn(
        "wa-pop flex flex-col overflow-hidden rounded-2xl border border-wa-divider bg-wa-panel shadow-2xl transition-all",
        "w-[340px] max-w-[92vw] sm:w-[380px] h-[370px]",
        className,
      )}
    >
      {/* Search Header */}
      <div className="flex items-center gap-2 border-b border-wa-divider bg-wa-topbar/50 px-3 py-2.5">
        <div className="relative flex-1">
          <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-wa-meta" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש אימוג'י (חיוך, משאית, V, תודה)..."
            className="w-full rounded-full bg-wa-panel py-1.5 pe-8 ps-8 text-[13px] text-wa-bubble-text placeholder:text-wa-meta outline-none border border-wa-divider/40 focus:border-wa-green transition-colors"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="נקה חיפוש"
              className="absolute end-2 top-1/2 -translate-y-1/2 text-wa-meta hover:text-wa-bubble-text"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="סגירת חלונית אימוג'י"
          className="flex size-7 items-center justify-center rounded-full text-wa-meta transition-colors hover:bg-wa-hover hover:text-wa-bubble-text"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Categories Toolbar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-wa-divider bg-wa-topbar/30 px-2 py-1.5 wa-scroll">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveTab(cat.id);
                setQuery("");
              }}
              title={cat.label}
              aria-label={cat.label}
              className={cn(
                "flex items-center gap-1.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "bg-wa-green/15 text-wa-green font-semibold"
                  : "text-wa-meta hover:bg-wa-hover hover:text-wa-bubble-text",
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Emoji Grid Area */}
      <div className="flex-1 overflow-y-auto p-3 wa-scroll">
        {/* Recents banner if active and showing recents */}
        {activeTab === "all" && !query && (
          <div className="mb-3">
            <div className="mb-1.5 flex items-center justify-between px-1 text-[11px] font-semibold text-wa-meta">
              <span>נפוצים ואחרונים בשימוש</span>
            </div>
            <div className="grid grid-cols-8 gap-1 rounded-xl bg-wa-panel-alt/50 p-1.5 border border-wa-divider/30">
              {recentEmojis.slice(0, 8).map((emoji, index) => (
                <button
                  key={`rec-${emoji}-${index}`}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  aria-label={emoji}
                  className="flex size-9 items-center justify-center rounded-lg text-xl transition-transform hover:scale-125 hover:bg-wa-hover active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "recent" && (
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-wa-meta">אימוג&apos;ים בשימוש אחרון</span>
            <button
              type="button"
              onClick={handleClearRecents}
              className="flex items-center gap-1 text-[11px] text-wa-meta hover:text-destructive transition-colors"
            >
              <Trash2 className="size-3" />
              איפוס רשימה
            </button>
          </div>
        )}

        {filteredEmojis.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-wa-meta">
            <Smile className="size-8 stroke-[1.5] mb-2 opacity-50" />
            <p className="text-xs">לא נמצאו אימוג&apos;ים התואמים לחיפוש</p>
          </div>
        ) : (
          <div>
            <div className="mb-1.5 px-1 text-[11px] font-semibold text-wa-meta">
              {query
                ? `תוצאות חיפוש (${filteredEmojis.length})`
                : CATEGORIES.find((c) => c.id === activeTab)?.label || "אימוג'ים"}
            </div>
            <div className="grid grid-cols-8 gap-1">
              {filteredEmojis.map((item, index) => (
                <button
                  key={`${item.emoji}-${index}`}
                  type="button"
                  onClick={() => handleEmojiClick(item.emoji)}
                  title={item.name}
                  aria-label={item.name}
                  className="flex size-9 items-center justify-center rounded-lg text-xl transition-transform hover:scale-125 hover:bg-wa-hover active:scale-95"
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-wa-divider/50 bg-wa-topbar/40 px-3 py-1.5 text-center text-[11px] text-wa-meta">
        לחיצה על אימוג&apos;י תכניס אותו ישירות לשורת ההודעה
      </div>
    </div>
  );
}
