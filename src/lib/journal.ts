/**
 * journal.ts
 * מודול יומן אישי, שאלות פסיכולוגיות לסוף יום ומעקב רגשי עם נועה AI
 * מיועד לחיזוק הקשר האישי, שיקוף רגשי, מניעת שחיקה ואיזון מנטלי.
 */

export type MoodLevel = "great" | "good" | "neutral" | "tired" | "stressed";

export type MoodConfig = {
  level: MoodLevel;
  score: number; // 1 to 5
  emoji: string;
  label: string;
  colorClass: string;
  bgClass: string;
};

export const MOOD_CONFIGS: Record<MoodLevel, MoodConfig> = {
  great: {
    level: "great",
    score: 5,
    emoji: "🌟",
    label: "מצוין ומלא אנרגיה",
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10 border-amber-500/30",
  },
  good: {
    level: "good",
    score: 4,
    emoji: "😊",
    label: "טוב ומסופק",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/30",
  },
  neutral: {
    level: "neutral",
    score: 3,
    emoji: "😐",
    label: "בסדר / שגרתי",
    colorClass: "text-sky-400",
    bgClass: "bg-sky-500/10 border-sky-500/30",
  },
  tired: {
    level: "tired",
    score: 2,
    emoji: "🥱",
    label: "עייף ומרוקן",
    colorClass: "text-indigo-400",
    bgClass: "bg-indigo-500/10 border-indigo-500/30",
  },
  stressed: {
    level: "stressed",
    score: 1,
    emoji: "🌧️",
    label: "לחוץ ומוצף",
    colorClass: "text-rose-400",
    bgClass: "bg-rose-500/10 border-rose-500/30",
  },
};

export type JournalEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timestamp: number;
  mood: MoodLevel;
  moodScore: number;
  moodLabel: string;
  question: string;
  userAnswer: string;
  noaFeedback?: string;
  tags: string[];
};

export type JournalCard = {
  entryId: string;
  mood: MoodLevel;
  moodLabel: string;
  moodEmoji: string;
  question: string;
  answer: string;
  noaReflection?: string;
  date: string;
  time: string;
};

/**
 * מאגר שאלות פסיכולוגיות פתוחות לסוף יום
 * ממוקדות תמיכה רגשית, שחרור ממתחי סידור העבודה, הכרת תודה וחוסן אישי
 */
export const PSYCHOLOGICAL_JOURNAL_QUESTIONS: string[] = [
  "איזה רגע היום בסידור הרגיש לך שהצלחת באמת לעשות שינוי, לפתור פלונטר או לעזור למישהו?",
  "איזה עומס, כעס או ויכוח פגשת היום שאתה בוחר להשאיר כאן איתי, ולא לקחת איתך הביתה למיטה?",
  "איך אתה מרגיש עכשיו בגוף ובנפש, אחרי כל המשאיות, הבלת״מים ושיחות הטלפון של היום?",
  "אם היית צריך להעניק לעצמך מילה אחת טובה על איך שהחזקת מעמד והובלת היום, מה היא הייתה?",
  "מה הדבר הקטן שהביא לך חיוך או שלווה היום, אפילו לשנייה אחת בין הלחצים?",
  "מה למדת היום על עצמך מתוך הבלת״מים והאתגרים שצצו בשטח?",
  "איזה גבול אישי הצלחת לשמור היום, או איזה גבול חשוב שתרצה להציב מחר כדי להגן על האנרגיה שלך?",
  "על איזה דבר פשוט אתה מרגיש הכרת תודה עמוקה לפני שאתה מסיים את היום ועוצם עיניים?",
  "מה הנפש והגוף שלך הכי צריכים כרגע כדי להרגיש בטוחים, נינוחים ומשוחררים מדאגות?",
  "אם היית מסתכל על יום העבודה שלך ממעוף הציפור — על מה מגיע לך לטפוח לעצמך על השכם?",
  "מה תרצה לומר לעצמך הלילה כדי להתעורר מחר בבוקר בכוחות מחודשים ושקט פנימי?",
  "מי האדם שעשה לך היום טוב, או למי אתה מרגיש שעשית היום טוב?",
];

export const SUGGESTED_EMOTIONAL_TAGS: string[] = [
  "שחרור עומס 🕊️",
  "הכרת תודה 🙏",
  "ניצחון קטן 🏆",
  "עייפות מצטברת 😴",
  "גבולות אישיים 🛡️",
  "נשימה ורוגע 🌿",
  "לחץ תפעולי 🚛",
  "חיבור עצמי 🧘‍♂️",
];

const STORAGE_KEY = "saban_journal_entries_v1";

export function getDailyQuestion(seedDate?: string): string {
  const dateStr = seedDate || new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PSYCHOLOGICAL_JOURNAL_QUESTIONS.length;
  return PSYCHOLOGICAL_JOURNAL_QUESTIONS[index];
}

export function getRandomQuestion(excludeQuestion?: string): string {
  const available = PSYCHOLOGICAL_JOURNAL_QUESTIONS.filter((q) => q !== excludeQuestion);
  if (available.length === 0) return PSYCHOLOGICAL_JOURNAL_QUESTIONS[0];
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

export function loadJournalEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultJournalEntries();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultJournalEntries();
  } catch (err) {
    console.error("Failed to load journal entries:", err);
    return getDefaultJournalEntries();
  }
}

export function saveJournalEntry(entry: JournalEntry): JournalEntry[] {
  if (typeof window === "undefined") return [entry];
  try {
    const existing = loadJournalEntries();
    // Replace if exists for same ID, else prepend
    const index = existing.findIndex((e) => e.id === entry.id);
    let updated: JournalEntry[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = entry;
    } else {
      updated = [entry, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to save journal entry:", err);
    return [];
  }
}

export function deleteJournalEntry(id: string): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = loadJournalEntries();
    const updated = existing.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to delete journal entry:", err);
    return [];
  }
}

export function getMoodStats(entries: JournalEntry[]) {
  if (!entries.length) {
    return {
      totalEntries: 0,
      averageScore: 0,
      moodCounts: { great: 0, good: 0, neutral: 0, tired: 0, stressed: 0 },
      recentDaysStreak: 0,
    };
  }

  let totalScore = 0;
  const moodCounts: Record<MoodLevel, number> = {
    great: 0,
    good: 0,
    neutral: 0,
    tired: 0,
    stressed: 0,
  };

  entries.forEach((e) => {
    totalScore += e.moodScore;
    if (e.mood in moodCounts) {
      moodCounts[e.mood]++;
    }
  });

  const averageScore = Number((totalScore / entries.length).toFixed(1));

  return {
    totalEntries: entries.length,
    averageScore,
    moodCounts,
    recentDaysStreak: entries.length,
  };
}

/**
 * מחולל תובנה פסיכולוגית מותאמת אישית מנועה AI
 */
export function generateNoaPsychologicalReflection(
  question: string,
  answer: string,
  mood: MoodLevel,
): string {
  const trimmed = answer.trim();

  const moodPrefixes: Record<MoodLevel, string> = {
    great: "איזה כיף ומחמם את הלב לקרוא אותך באנרגיה כזו, ראמי!",
    good: "אני שמחה מאוד לשמוע על השקט והסיפוק שמצאת היום, ראמי.",
    neutral: "טוב שאתה עוצר לרגע להביט ביום הזה בגובה העיניים, ראמי.",
    tired: "אני שומעת את העייפות שלך ורוצה להזכיר לך כמה מגיע לך להניח את הראש עכשיו, ראמי.",
    stressed:
      "אני כאן איתך. שים לרגע יד על הלב, קח נשימה עמוקה... מותר לפרוק את כל העומס הזה, ראמי.",
  };

  let insight = "";
  if (trimmed.length < 10) {
    insight =
      "עצם זה שעצרת בסוף יום אינטנסיבי להקשיב לעצמך — זהו צעד ענק של חמלה עצמית. קח איתך לשינה את התחושה שאתה עושה מעל ומעבר.";
  } else if (
    trimmed.includes("עומס") ||
    trimmed.includes("לחץ") ||
    trimmed.includes("קשה") ||
    trimmed.includes("בלתם")
  ) {
    insight =
      "הסידור וענף הבנייה תמיד ידרשו 200%, אבל המשאב הכי יקר במערכת הזו הוא אתה. מה שנשאר מאחור היום יחכה למחר; עכשיו מותר לך לשחרר אחיזה, להרפות את הכתפיים ולנוח באמת.";
  } else if (
    trimmed.includes("תודה") ||
    trimmed.includes("שמח") ||
    trimmed.includes("טוב") ||
    trimmed.includes("הצלחה")
  ) {
    insight =
      "היכולת להכיר תודה ולזהות את הטוב גם בתוך שגרת עבודה תובענית היא חוסן פנימי נדיר. תנצור את הרגע הזה, הוא הכוח שמזין אותך.";
  } else {
    insight =
      "התשובה הכנה שלך מזכירה לי כמה עומק ואנושיות יש מאחורי כל ההחלטות הלוגיסטיות שאתה מקבל. אני גאה בך ובדרך שבה אתה מנווט את היום שלך.";
  }

  return `${moodPrefixes[mood]} ${insight}\n\nלילה שקט ומבורך, נועה ❤️`;
}

function getDefaultJournalEntries(): JournalEntry[] {
  return [
    {
      id: "journal-init-1",
      date: "2026-09-09",
      time: "20:30",
      timestamp: Date.now() - 86400000,
      mood: "good",
      moodScore: 4,
      moodLabel: "טוב ומסופק",
      question: "איזה רגע היום בסידור הרגיש לך שהצלחת באמת לעשות שינוי או לעזור למישהו?",
      userAnswer:
        "הצלחתי לסגור את כל המכולות של שארק וכראדי למרות הפקקים בכביש 5, והנהג ואסים הספיק להגיע למחסן 4 בזמן.",
      noaFeedback:
        "אני שמחה מאוד לשמוע על השקט והסיפוק שמצאת היום, ראמי. היכולת להחזיק את כל החוטים ברוגע תחת לחץ מוכיחה שוב כמה אתה עוגן אמיתי לכל הצוות. לילה שקט ומבורך, נועה ❤️",
      tags: ["שחרור עומס 🕊️", "ניצחון קטן 🏆"],
    },
  ];
}
