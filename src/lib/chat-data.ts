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
