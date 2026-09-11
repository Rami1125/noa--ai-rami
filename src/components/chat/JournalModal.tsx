import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  HeartHandshake,
  Moon,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import {
  deleteJournalEntry,
  generateNoaPsychologicalReflection,
  getDailyQuestion,
  getMoodStats,
  getRandomQuestion,
  loadJournalEntries,
  MOOD_CONFIGS,
  PSYCHOLOGICAL_JOURNAL_QUESTIONS,
  saveJournalEntry,
  SUGGESTED_EMOTIONAL_TAGS,
  type JournalCard,
  type JournalEntry,
  type MoodLevel,
} from "@/lib/journal";
import { cn } from "@/lib/utils";
import { PsychologyKnowledgeTab } from "./PsychologyKnowledgeTab";

type JournalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onShareToChat?: (card: JournalCard, text: string) => void;
};

export function JournalModal({ isOpen, onClose, onShareToChat }: JournalModalProps) {
  const [activeTab, setActiveTab] = useState<"write" | "history" | "psychology">("write");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodLevel>("good");
  const [question, setQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["שחרור עומס 🕊️"]);
  const [noaFeedback, setNoaFeedback] = useState<string>("");
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  // Initialize data on modal open
  useEffect(() => {
    if (!isOpen) return;
    const loaded = loadJournalEntries();
    setEntries(loaded);

    // If today's entry already exists, load its question or pick daily
    const todayStr = new Date().toISOString().slice(0, 10);
    const existingToday = loaded.find((e) => e.date === todayStr);

    if (existingToday) {
      setSelectedMood(existingToday.mood);
      setQuestion(existingToday.question);
      setUserAnswer(existingToday.userAnswer);
      setSelectedTags(existingToday.tags);
      setNoaFeedback(existingToday.noaFeedback || "");
    } else {
      setQuestion(getDailyQuestion(todayStr));
      setUserAnswer("");
      setNoaFeedback("");
      setSelectedMood("good");
      setSelectedTags(["שחרור עומס 🕊️"]);
    }
    setSavedNotice(false);
  }, [isOpen]);

  const stats = useMemo(() => getMoodStats(entries), [entries]);

  const handleCycleQuestion = () => {
    const nextQ = getRandomQuestion(question);
    setQuestion(nextQ);
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleGenerateFeedback = () => {
    if (!userAnswer.trim()) return;
    setIsGeneratingFeedback(true);
    setTimeout(() => {
      const feedback = generateNoaPsychologicalReflection(question, userAnswer, selectedMood);
      setNoaFeedback(feedback);
      setIsGeneratingFeedback(false);
    }, 600);
  };

  const handleSave = (shareToChat = false) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

    const feedbackToSave =
      noaFeedback ||
      (userAnswer.trim()
        ? generateNoaPsychologicalReflection(question, userAnswer, selectedMood)
        : undefined);

    const newEntry: JournalEntry = {
      id: `journal-${dateStr}`,
      date: dateStr,
      time: timeStr,
      timestamp: now.getTime(),
      mood: selectedMood,
      moodScore: MOOD_CONFIGS[selectedMood].score,
      moodLabel: MOOD_CONFIGS[selectedMood].label,
      question,
      userAnswer: userAnswer.trim() || "הקדשתי רגע שקט בסוף יום לנשימה והרפיה.",
      noaFeedback: feedbackToSave,
      tags: selectedTags,
    };

    const updated = saveJournalEntry(newEntry);
    setEntries(updated);
    setNoaFeedback(feedbackToSave || "");
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);

    if (shareToChat && onShareToChat) {
      const card: JournalCard = {
        entryId: newEntry.id,
        mood: newEntry.mood,
        moodLabel: newEntry.moodLabel,
        moodEmoji: MOOD_CONFIGS[newEntry.mood].emoji,
        question: newEntry.question,
        answer: newEntry.userAnswer,
        noaReflection: feedbackToSave,
        date: dateStr,
        time: timeStr,
      };

      const chatText = `🌙 סיכום יום רגשי ביומן האישי:\n• מצב רוח: ${MOOD_CONFIGS[newEntry.mood].emoji} ${newEntry.moodLabel}\n• שאלה: ${question}\n• תשובה: ${newEntry.userAnswer}`;
      onShareToChat(card, chatText);
      onClose();
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteJournalEntry(id);
    setEntries(updated);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-wa-divider bg-wa-panel text-wa-bubble-text shadow-2xl">
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-wa-divider bg-gradient-to-r from-indigo-950/40 via-wa-topbar to-wa-panel px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30">
              <Moon className="size-5" />
            </div>
            <div>
              <h2 id="journal-modal-title" className="text-base font-semibold sm:text-lg">
                יומן אישי וסיכום יום רגשי עם נועה AI
              </h2>
              <p className="text-xs text-wa-meta">
                שאלות עומק, פריקת מתחים, חיבור אישי ומעקב רגשי (Journal Entry)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור חלון יומן"
            className="rounded-full p-1.5 text-wa-meta transition-colors hover:bg-wa-hover hover:text-wa-bubble-text"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-wa-divider bg-wa-panel-alt/50 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={cn(
              "relative flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === "write"
                ? "border-indigo-400 text-indigo-400"
                : "border-transparent text-wa-meta hover:text-wa-bubble-text",
            )}
          >
            <BookOpen className="size-4" />
            <span>רפלקציה יומית (היום)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={cn(
              "relative flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === "history"
                ? "border-indigo-400 text-indigo-400"
                : "border-transparent text-wa-meta hover:text-wa-bubble-text",
            )}
          >
            <TrendingUp className="size-4" />
            <span>מעקב רגשי והיסטוריה ({entries.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("psychology")}
            className={cn(
              "relative flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === "psychology"
                ? "border-indigo-400 text-indigo-400"
                : "border-transparent text-wa-meta hover:text-wa-bubble-text",
            )}
          >
            <Brain className="size-4" />
            <span>מאגר ידע פסיכולוגי וחוסן 🧠</span>
          </button>
        </div>

        {/* Content area */}
        <div className="wa-scroll flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === "psychology" ? (
            <PsychologyKnowledgeTab
              onAskNoa={(prompt) => {
                onClose();
                if (onShareToChat) {
                  onShareToChat(
                    {
                      id: `psych-prompt-${Date.now()}`,
                      type: "daily_reflection",
                      title: "שאלה ממאגר הידע הפסיכולוגי",
                      date: new Date().toLocaleDateString("he-IL"),
                      time: new Date().toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      summary: prompt,
                      tags: ["מאגר פסיכולוגי 🧠"],
                    },
                    prompt,
                  );
                }
              }}
            />
          ) : activeTab === "write" ? (
            <div className="space-y-5">
              {/* Step 1: Mood Selector */}
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-medium text-wa-meta">
                  <span>1. איך אתה מרגיש עכשיו בסוף יום העבודה?</span>
                  <span className="font-mono text-[11px] text-indigo-400">
                    {MOOD_CONFIGS[selectedMood].label} (ניקוד: {MOOD_CONFIGS[selectedMood].score}/5)
                  </span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(MOOD_CONFIGS) as MoodLevel[]).map((m) => {
                    const cfg = MOOD_CONFIGS[m];
                    const isSelected = selectedMood === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMood(m)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-all",
                          isSelected
                            ? cn("scale-105 shadow-md", cfg.bgClass, "ring-2 ring-indigo-500/50")
                            : "border-wa-divider/60 bg-wa-panel hover:bg-wa-hover hover:border-wa-divider",
                        )}
                      >
                        <span className="text-2xl sm:text-3xl">{cfg.emoji}</span>
                        <span className="text-[11px] font-medium truncate max-w-full">
                          {cfg.label.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Open-ended Psychological Question */}
              <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-wa-panel-alt/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                    <Sparkles className="size-3.5" />
                    <span>שאלת נועה לסגירת היום ולפתיחת הלב:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCycleQuestion}
                    className="flex items-center gap-1 text-[11px] text-wa-meta transition-colors hover:text-indigo-400"
                    title="שאל שאלה פסיכולוגית אחרת"
                  >
                    <RefreshCw className="size-3" />
                    <span>שאלה אחרת</span>
                  </button>
                </div>
                <p className="text-sm font-medium leading-relaxed text-wa-bubble-text sm:text-[15px]">
                  &ldquo;{question}&rdquo;
                </p>
              </div>

              {/* Step 3: User's Response */}
              <div>
                <label
                  htmlFor="journal-answer"
                  className="mb-1.5 block text-xs font-medium text-wa-meta"
                >
                  2. התשובה והמחשבות שלך (מרחב אישי מוגן ללא שיפוטיות):
                </label>
                <textarea
                  id="journal-answer"
                  rows={4}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="כתוב כאן בחופשיות... מה עבר עליך, מה הקל עליך, או איזה עומס אתה בוחר לפרוק הלילה..."
                  className="w-full resize-none rounded-xl border border-wa-divider bg-wa-chat/50 p-3 text-sm text-wa-bubble-text placeholder:text-wa-meta/70 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Step 4: Emotional Tags */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-wa-meta">
                  <Tag className="size-3" />
                  <span>תגיות רגשיות ונושאים עיקריים:</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_EMOTIONAL_TAGS.map((t) => {
                    const isSelected = selectedTags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleToggleTag(t)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                          isSelected
                            ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300"
                            : "border-wa-divider bg-wa-panel text-wa-meta hover:bg-wa-hover",
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 5: Noa AI Psychological Feedback */}
              {userAnswer.trim().length > 3 ? (
                <div className="rounded-xl border border-wa-divider/80 bg-wa-panel-alt/80 p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-wa-meta">
                      <HeartHandshake className="size-4 text-rose-400" />
                      <span>תובנה וחיבוק מנטלי מנועה AI:</span>
                    </div>
                    <button
                      type="button"
                      disabled={isGeneratingFeedback}
                      onClick={handleGenerateFeedback}
                      className="flex items-center gap-1 rounded-lg bg-indigo-500/15 px-2 py-1 text-[11px] font-medium text-indigo-300 transition-colors hover:bg-indigo-500/25 disabled:opacity-50"
                    >
                      <Sparkles className="size-3 animate-pulse" />
                      <span>{noaFeedback ? "רענן תובנה" : "קבל שיקוף מנועה"}</span>
                    </button>
                  </div>

                  {isGeneratingFeedback ? (
                    <div className="flex items-center gap-2 py-2 text-xs text-indigo-400">
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>נועה מעבדת את תשובתך ומנסחת שיקוף חם ומחזק...</span>
                    </div>
                  ) : noaFeedback ? (
                    <p className="whitespace-pre-line text-xs sm:text-sm text-wa-bubble-text leading-relaxed bg-wa-panel/70 p-3 rounded-lg border border-wa-divider/40">
                      {noaFeedback}
                    </p>
                  ) : (
                    <p className="text-xs text-wa-meta">
                      לחץ על &quot;קבל שיקוף מנועה&quot; כדי לקבל מנועה ניתוח רגשי, חיזוק מנטלי
                      וברכת לילה טוב מותאמת.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            /* Tab: History and Emotional Tracking */
            <div className="space-y-5">
              {/* Stats overview banner */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-wa-divider bg-wa-panel-alt p-3 text-center">
                  <p className="text-xs text-wa-meta">סך רפלקציות</p>
                  <p className="text-xl font-bold text-indigo-400 sm:text-2xl">
                    {stats.totalEntries}
                  </p>
                </div>
                <div className="rounded-xl border border-wa-divider bg-wa-panel-alt p-3 text-center">
                  <p className="text-xs text-wa-meta">ממוצע מצב רוח</p>
                  <p className="text-xl font-bold text-emerald-400 sm:text-2xl">
                    {stats.averageScore} / 5
                  </p>
                </div>
                <div className="col-span-2 rounded-xl border border-wa-divider bg-wa-panel-alt p-3">
                  <p className="mb-1.5 text-xs text-wa-meta">התפלגות מצבי רוח</p>
                  <div className="flex items-center gap-2">
                    {(Object.keys(MOOD_CONFIGS) as MoodLevel[]).map((m) => {
                      const count = stats.moodCounts[m];
                      return (
                        <div
                          key={m}
                          title={`${MOOD_CONFIGS[m].label}: ${count}`}
                          className="flex flex-1 flex-col items-center rounded-lg bg-wa-panel py-1 text-center"
                        >
                          <span className="text-base">{MOOD_CONFIGS[m].emoji}</span>
                          <span className="text-[11px] font-semibold text-wa-meta">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Entries list */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-wa-meta">היסטוריית רישומי היומן:</h3>
                {entries.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-wa-divider p-8 text-center text-wa-meta">
                    <BookOpen className="mx-auto mb-2 size-8 opacity-40" />
                    <p className="text-sm">עדיין לא נשמרו רישומים ביומן האישי.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("write")}
                      className="mt-3 rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:bg-indigo-500/30"
                    >
                      התחל את הרפלקציה הראשונה שלך
                    </button>
                  </div>
                ) : (
                  entries.map((entry) => {
                    const isExpanded = expandedEntryId === entry.id;
                    const moodCfg = MOOD_CONFIGS[entry.mood];
                    return (
                      <div
                        key={entry.id}
                        className="overflow-hidden rounded-xl border border-wa-divider bg-wa-panel transition-colors hover:border-wa-divider"
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setExpandedEntryId(isExpanded ? null : entry.id);
                            }
                          }}
                          className="flex w-full cursor-pointer items-center justify-between p-3.5 text-start hover:bg-wa-hover/60"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{moodCfg.emoji}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">{entry.date}</span>
                                <span className="text-xs text-wa-meta">{entry.time}</span>
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                                    moodCfg.bgClass,
                                    moodCfg.colorClass,
                                  )}
                                >
                                  {entry.moodLabel}
                                </span>
                              </div>
                              <p className="mt-0.5 truncate text-xs text-wa-meta max-w-md">
                                {entry.question}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleDelete(entry.id, e)}
                              className="rounded-full p-1 text-wa-meta hover:bg-rose-500/10 hover:text-rose-400"
                              title="מחק רישום"
                            >
                              <Trash2 className="size-4" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="size-4 text-wa-meta" />
                            ) : (
                              <ChevronDown className="size-4 text-wa-meta" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-wa-divider/60 bg-wa-panel-alt/40 p-4 space-y-3 text-xs sm:text-sm">
                            <div>
                              <p className="font-medium text-indigo-400 mb-1">שאלה שנשאלה:</p>
                              <p className="italic text-wa-bubble-text">
                                &ldquo;{entry.question}&rdquo;
                              </p>
                            </div>

                            <div>
                              <p className="font-medium text-wa-meta mb-1">התשובה שלך:</p>
                              <p className="whitespace-pre-wrap rounded-lg bg-wa-panel p-2.5 border border-wa-divider/50">
                                {entry.userAnswer}
                              </p>
                            </div>

                            {entry.noaFeedback && (
                              <div>
                                <p className="font-medium text-rose-400 mb-1">שיקוף מנועה AI:</p>
                                <p className="whitespace-pre-line rounded-lg bg-wa-panel p-2.5 border border-wa-divider/50 text-wa-meta">
                                  {entry.noaFeedback}
                                </p>
                              </div>
                            )}

                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {entry.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-wa-panel px-2 py-0.5 text-[10px] text-wa-meta border border-wa-divider/50"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-wa-divider bg-wa-topbar px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            {savedNotice ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <Check className="size-3.5" />
                <span>היומן נשמר בהצלחה!</span>
              </span>
            ) : (
              <span className="text-[11px] text-wa-meta">
                הנתונים נשמרים מקומית במכשירך באופן מוצפן ובטוח
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "write" ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  className="rounded-xl border border-wa-divider bg-wa-panel px-3.5 py-2 text-xs font-medium text-wa-bubble-text transition-colors hover:bg-wa-hover"
                >
                  שמור ביומן
                </button>
                {onShareToChat ? (
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-500"
                  >
                    <Share2 className="size-3.5" />
                    <span>שמור ושתף בצ&apos;אט עם נועה</span>
                  </button>
                ) : null}
              </>
            ) : activeTab === "psychology" ? (
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
              >
                <BookOpen className="size-3.5" />
                <span>מעבר לכתיבת יומן</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
              >
                <Plus className="size-3.5" />
                <span>כתיבת רפלקציה להיום</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
