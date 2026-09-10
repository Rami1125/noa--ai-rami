export const NOA_AVATAR = "https://i.ibb.co/whtMgBNC/Gemini-Generated-Image-2.png";

export type ContainerAction = "placement" | "swap" | "removal";

export type TaskCard = {
  title: string;
  customer: string;
  address: string;
  wazeQuery: string;
  containerType: string;
  action: ContainerAction;
  scheduledFor: string;
};

export type Message = {
  id: string;
  author: "me" | "noa";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  card?: TaskCard;
};

export type Conversation = {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  preview: string;
  time: string;
  unread: number;
  muted?: boolean;
  kind: "all" | "group";
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: "noa",
    name: "נועה AI — ח. סבן חומרי בניין",
    avatar: NOA_AVATAR,
    initials: "נ",
    preview: "ההזמנה נקלטה, שלחתי לנהג את הניווט 📥",
    time: "09:41",
    unread: 0,
    kind: "all",
  },
  {
    id: "sidur",
    name: "עדכונים מהסידור",
    initials: "ס",
    preview: "רמי: מחסן 30 סגור היום עד 12:00",
    time: "09:12",
    unread: 3,
    kind: "group",
  },
  {
    id: "shark",
    name: "קבלן שארק (מחסן 30)",
    initials: "ש",
    preview: "צריך מכולה 12 קוב מחר בבוקר",
    time: "08:55",
    unread: 1,
    kind: "all",
  },
  {
    id: "vered",
    name: "ורד אידלסון",
    initials: "ו",
    preview: "תודה! קיבלתי את החשבונית",
    time: "אתמול",
    unread: 0,
    kind: "all",
  },
  {
    id: "lina",
    name: "לינה",
    initials: "ל",
    preview: "אשלח את פרטי האתר בהמשך היום",
    time: "אתמול",
    unread: 0,
    muted: true,
    kind: "all",
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    author: "noa",
    text: "בוקר טוב ראמי ☀️ יש לנו 4 משימות פתוחות להיום. רוצה שאעבור עליהן?",
    time: "08:30",
  },
  {
    id: "m2",
    author: "me",
    text: "כן, ותזמיני מכולה 12 קוב לשארק במחסן 30",
    time: "08:32",
    status: "read",
  },
  {
    id: "m3",
    author: "noa",
    text: "מעולה, פתחתי משימה חדשה 👇",
    time: "08:33",
    card: {
      title: "הזמנת מכולה #1042",
      customer: "קבלן שארק",
      address: "האורגים 30, חולון",
      wazeQuery: "האורגים 30 חולון",
      containerType: "מכולה 12 קוב",
      action: "placement",
      scheduledFor: "היום, 11:00",
    },
  },
];

export const ACTION_LABELS: Record<ContainerAction, { emoji: string; label: string }> = {
  placement: { emoji: "📥", label: "הצבה" },
  swap: { emoji: "🔄", label: "החלפה" },
  removal: { emoji: "📤", label: "הוצאה" },
};

export const EMOJIS = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😊",
  "😍",
  "😘",
  "😎",
  "🤔",
  "😅",
  "👍",
  "🙏",
  "👏",
  "💪",
  "🔥",
  "✅",
  "❌",
  "⚠️",
  "🚚",
  "🏗️",
  "📥",
  "🔄",
  "📤",
  "📦",
  "📍",
  "🕐",
  "💰",
  "📄",
  "🎯",
  "❤️",
];

export type QuickCommandCategory = "all" | "containers" | "warehouses" | "status";

export type QuickCommand = {
  id: string;
  emoji: string;
  label: string;
  category: QuickCommandCategory;
  prompt: string;
  action: "send" | "insert";
  description: string;
};

export const QUICK_COMMAND_CATEGORIES: { id: QuickCommandCategory; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "containers", label: "מכולות 8 קו״ב" },
  { id: "warehouses", label: "מחסנים" },
  { id: "status", label: "סידור ופקדונות" },
];

export const QUICK_DISPATCH_COMMANDS: QuickCommand[] = [
  {
    id: "today-schedule",
    emoji: "📋",
    label: "סידור עבודה להיום",
    category: "status",
    prompt: "נועה, מה תמונת המצב של סידור העבודה להיום?",
    action: "send",
    description: "סקירת משימות וסידור עבודה יומי",
  },
  {
    id: "containers-status",
    emoji: "🚛",
    label: "סטטוס מכולות",
    category: "containers",
    prompt: "נועה, תני לי סטטוס של מכולות הפסולת 8 קו״ב הפתוחות לפי קבלנים",
    action: "send",
    description: "בדיקת מכולות פעילות בשטח",
  },
  {
    id: "place-container",
    emoji: "📥",
    label: "הצבת מכולה 8 קו״ב",
    category: "containers",
    prompt: "📥 הצבת מכולה 8 קו״ב בכתובת: ",
    action: "insert",
    description: "הזנת כתובת להצבת מכולה חדשה",
  },
  {
    id: "swap-container",
    emoji: "🔄",
    label: "החלפת מכולה",
    category: "containers",
    prompt: "🔄 החלפת מכולה 8 קו״ב בכתובת/לקבלן: ",
    action: "insert",
    description: "הזנת פרטים להחלפת מכולה",
  },
  {
    id: "remove-container",
    emoji: "📤",
    label: "הוצאת מכולה",
    category: "containers",
    prompt: "📤 הוצאת מכולה 8 קו״ב מכתובת: ",
    action: "insert",
    description: "הזנת פרטי פינוי והוצאת מכולה",
  },
  {
    id: "warehouse-4",
    emoji: "🏗️",
    label: "מחסן 4 החרש",
    category: "warehouses",
    prompt: "נועה, מה הסטטוס של מחסן 4 החרש והעמסות החומרים?",
    action: "send",
    description: "בדיקת העמסות במחסן החרש הראשי",
  },
  {
    id: "warehouse-1",
    emoji: "🧱",
    label: "מחסן 1 התלמיד",
    category: "warehouses",
    prompt: "נועה, מה מצב המלאי והמשלוחים במחסן 1 התלמיד?",
    action: "send",
    description: "בדיקת חומרים במחסן התלמיד",
  },
  {
    id: "shark-contractor",
    emoji: "🦈",
    label: "שארק (מחסן 30)",
    category: "containers",
    prompt: "נועה, תני לי ריכוז מכולות פעילות של קבלן שארק (מחסן 30)",
    action: "send",
    description: "ריכוז מכולות קבלן שארק",
  },
  {
    id: "karadi-contractor",
    emoji: "🚜",
    label: "כראדי (מחסן 32)",
    category: "containers",
    prompt: "נועה, תני לי ריכוז מכולות פעילות של קבלן כראדי (מחסן 32)",
    action: "send",
    description: "ריכוז מכולות קבלן כראדי",
  },
  {
    id: "sharon-contractor",
    emoji: "🚚",
    label: "שי שרון (מחסן 40)",
    category: "containers",
    prompt: "נועה, תני לי ריכוז מכולות פעילות של קבלן שי שרון (מחסן 40)",
    action: "send",
    description: "ריכוז מכולות קבלן שי שרון",
  },
  {
    id: "deposits-rules",
    emoji: "📦",
    label: "פקדונות סבן",
    category: "status",
    prompt: "נועה, תזכירי לי מה חוקי הפקדון על בלות (מק״ט 60002) ומשטחי מלט (מק״ט 60060)",
    action: "send",
    description: "חישוב וחוקי פקדונות משטחים ובלות",
  },
];
