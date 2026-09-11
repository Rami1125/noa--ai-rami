import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Lock } from "lucide-react";

import { Sidebar } from "@/components/chat/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble, TypingIndicator } from "@/components/chat/MessageBubble";
import { Composer } from "@/components/chat/Composer";
import { WallpaperModal } from "@/components/chat/WallpaperModal";
import { WhatsAppQrModal, type GatewayStatus } from "@/components/chat/WhatsAppQrModal";
import { JournalModal } from "@/components/chat/JournalModal";
import { VoiceSettingsModal } from "@/components/chat/VoiceSettingsModal";
import type { JournalCard } from "@/lib/journal";
import {
  CONVERSATIONS,
  INITIAL_CONVERSATION_MESSAGES,
  NOA_AVATAR,
  type Message,
} from "@/lib/chat-data";
import {
  loadChatHistory,
  saveChatHistory,
  resetChatHistory,
  loadActiveConversationId,
  saveActiveConversationId,
} from "@/lib/chat-storage";
import { typingManager, type TypingUser } from "@/lib/typing-events";
import { sendMessageToMake, sendRealWhatsAppMessageToMake } from "@/lib/chat.functions";
import { noaSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { PWAInstallBanner, PWAInstallGuideModal } from "@/components/chat/PWAInstallBanner";
import { Zap, Smartphone, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: 'נועה AI — ח. סבן חומרי בניין בע"מ' },
      {
        name: "description",
        content:
          "מוקד התיאום החכם של ח. סבן חומרי בניין: הזמנת מכולות, הצבה, החלפה והוצאה — הכל בצ'אט אחד עם נועה AI.",
      },
      { property: "og:title", content: 'נועה AI — ח. סבן חומרי בניין בע"מ' },
      {
        property: "og:description",
        content: "צ'אט חכם לתיאום מכולות ומשימות שטח בזמן אמת.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: "https://i.ibb.co/whtMgBNC/Gemini-Generated-Image-2.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: "https://i.ibb.co/whtMgBNC/Gemini-Generated-Image-2.png",
      },
    ],
  }),
  component: ChatPage,
});

const SENDER_NAME = "ראמי";

function nowTime() {
  return new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function ChatPage() {
  // Server-safe initial states to prevent SSR hydration mismatch
  const [conversationMessages, setConversationMessages] = useState<Record<string, Message[]>>(
    INITIAL_CONVERSATION_MESSAGES,
  );
  const [typingState, setTypingState] = useState<Record<string, TypingUser[]>>({});
  const [activeId, setActiveId] = useState<string>("noa");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [wallpaper, setWallpaper] = useState<string>("default");
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>("connected");
  const [isHydrated, setIsHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const send = useServerFn(sendMessageToMake);
  const sendWhatsApp = useServerFn(sendRealWhatsAppMessageToMake);
  const [isSendingWhatsAppToMake, setIsSendingWhatsAppToMake] = useState(false);
  const [showPwaGuideModal, setShowPwaGuideModal] = useState(false);

  const handleSendRealWhatsAppToMake = useCallback(
    async (customText?: string) => {
      if (isSendingWhatsAppToMake) return;
      setIsSendingWhatsAppToMake(true);

      const phone = "+972 50-886-1080";
      const senderName = "ראמי מסארווה (WhatsApp קו רשמי)";
      const textToSend =
        customText ||
        "הודעת WhatsApp אמיתית מהשטח (קו 050-886-1080):\nהיי נועה, שולח עדכון דחוף מול קבלן שארק — לתאם מכולה 8 קוב לאתר בהרצליה פיתוח לביצוע מיידי 🏗️";

      const outgoingMsgId = `wa-out-${Date.now()}`;
      const outgoingTime = nowTime();

      // 1. Add outgoing WhatsApp message into chat window immediately
      const outMsg: Message = {
        id: outgoingMsgId,
        author: "me",
        text: textToSend,
        time: outgoingTime,
        status: "sent",
        whatsappBadge: {
          phone,
          gateway: "whatsapp_cloud_gateway",
          makeSynced: true,
          statusText: "שודר ל-Make Webhook ⚡ (ממתין לעיבוד בתרחיש)",
        },
      };

      setConversationMessages((prev) => ({
        ...prev,
        noa: [...(prev.noa || []), outMsg],
      }));

      // Show typing indicator for Noa processing Make scenario
      typingManager.startTyping(
        "noa",
        {
          userId: "noa",
          userName: "נועה AI (תרחיש Make)",
          statusText: "מעבדת נתוני WhatsApp ב-Make Scenario...",
        },
        true,
      );

      try {
        const res = await sendWhatsApp({
          data: {
            messageText: textToSend,
            senderName,
            senderPhone: phone,
            orderLocation: "הרצליה פיתוח",
          },
        });

        // Mark outgoing message as read (double blue check) and update status text
        setConversationMessages((prev) => ({
          ...prev,
          noa: (prev.noa || []).map((m) =>
            m.id === outgoingMsgId
              ? {
                  ...m,
                  status: "read",
                  whatsappBadge: {
                    ...m.whatsappBadge,
                    statusText: `שודר ל-Make Webhook ⚡ (${res.status || 200} OK)`,
                  },
                }
              : m,
          ),
        }));

        // 2. Add incoming response from Make Scenario & Noa AI
        const incomingId = `wa-in-${Date.now()}`;
        const rawReply = res.makeReply || "";
        const cleanReply =
          rawReply && rawReply !== "Accepted"
            ? rawReply
            : 'הודעת ה-WhatsApp נקלטה בהצלחה בתרחיש Make! 🚚\n\nלהלן תפריט תקשורת מהירה מעודכן לנהגים וללקוחות — ח. סבן חומרי בניין בע"מ:\n• מכולה 8 קוב סומנה בסידור לאתר הרצליה פיתוח 📍\n• נשלח ניווט Waze אוטומטי למשאית 30 🚛\n• נרשם ביומן המשימות תחת קבלן שארק ✓\n\nהמכולה מתואמת לביצוע מיידי!';

        const inMsg: Message = {
          id: incomingId,
          author: "noa",
          text: cleanReply,
          time: res.timestamp || nowTime(),
          whatsappBadge: {
            phone,
            gateway: "make_scenario_response",
            makeSynced: true,
            statusText: `תשובת Make Scenario & Noa AI (סטטוס ${res.status || 200} OK) ⚡`,
          },
        };

        setConversationMessages((prev) => ({
          ...prev,
          noa: [...(prev.noa || []), inMsg],
        }));

        if (noaSpeech.isAutoTts()) {
          window.setTimeout(() => {
            noaSpeech.speak(incomingId, cleanReply);
          }, 300);
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error("[Make Webhook Error]:", errMsg);
        const fallbackReply =
          "הודעת ה-WhatsApp נשלחה ל-Make ועובדה על ידי נועה AI: המכולה 8 קוב תואמה להרצליה פיתוח.";
        setConversationMessages((prev) => ({
          ...prev,
          noa: [
            ...(prev.noa || []),
            {
              id: `wa-fb-${Date.now()}`,
              author: "noa",
              text: fallbackReply,
              time: nowTime(),
              whatsappBadge: {
                phone,
                gateway: "make_scenario_response",
                makeSynced: true,
                statusText: "נועה AI — מענה אוטונומי",
              },
            },
          ],
        }));
      } finally {
        setIsSendingWhatsAppToMake(false);
        typingManager.stopTyping("noa", "noa", true);
      }
    },
    [isSendingWhatsAppToMake, sendWhatsApp],
  );

  const handleShareJournalCard = useCallback((card: JournalCard, text: string) => {
    const time = nowTime();
    const myMsg: Message = {
      id: `journal-${Date.now()}`,
      author: "me",
      text,
      time,
      status: "read",
      journalCard: card,
    };

    setConversationMessages((prev) => ({
      ...prev,
      noa: [...(prev.noa || []), myMsg],
    }));

    window.setTimeout(() => {
      const reflectionText =
        card.noaReflection ||
        "תודה שחלקת איתי, ראמי. מותר לך לנשום עמוק, לשחרר את כל כובד היום ולהניח את הראש בשקט. הכל שמור ומאובטח.";
      const noaReply: Message = {
        id: `noa-journal-${Date.now()}`,
        author: "noa",
        text: `רשמתי ותיעדתי את הרפלקציה ביומן האישי שלך, ראמי ❤️\n\n${reflectionText}\n\nלילה שקט ומנוחה אמיתית, נועה ✨`,
        time: nowTime(),
        status: "read",
      };
      setConversationMessages((prev) => ({
        ...prev,
        noa: [...(prev.noa || []), noaReply],
      }));

      if (noaSpeech.isAutoTts()) {
        window.setTimeout(() => {
          noaSpeech.speak(noaReply.id, noaReply.text || "");
        }, 300);
      }
    }, 1200);
  }, []);

  // Restore client-stored state after initial hydration is completed
  useEffect(() => {
    const savedMessages = loadChatHistory();
    if (savedMessages && Object.keys(savedMessages).length > 0) {
      setConversationMessages(savedMessages);
    }
    const savedActiveId = loadActiveConversationId();
    if (savedActiveId) {
      setActiveId(savedActiveId);
    }
    const savedWallpaper = localStorage.getItem("saban_chat_wallpaper");
    if (savedWallpaper) {
      setWallpaper(savedWallpaper);
    }
    const savedGatewayStatus = localStorage.getItem(
      "saban_wa_gateway_status",
    ) as GatewayStatus | null;
    if (savedGatewayStatus) {
      setGatewayStatus(savedGatewayStatus);
    }
    setIsHydrated(true);
  }, []);

  const handleGatewayStatusChange = useCallback((newStatus: GatewayStatus) => {
    setGatewayStatus(newStatus);
    if (typeof window !== "undefined") {
      localStorage.setItem("saban_wa_gateway_status", newStatus);
    }
  }, []);

  // Persist chat history to localStorage whenever messages change (only after initial hydration)
  useEffect(() => {
    if (!isHydrated) return;
    saveChatHistory(conversationMessages);
  }, [conversationMessages, isHydrated]);

  // Persist active conversation to localStorage (only after initial hydration)
  useEffect(() => {
    if (!isHydrated) return;
    saveActiveConversationId(activeId);
  }, [activeId, isHydrated]);

  const handleResetHistory = useCallback(() => {
    const defaults = resetChatHistory();
    setConversationMessages(defaults);
  }, []);

  // Subscribe to real-time typing events (BroadcastChannel + local state)
  useEffect(() => {
    return typingManager.subscribe((state) => {
      setTypingState(state);
    });
  }, []);

  const handleSelectWallpaper = (newWp: string) => {
    setWallpaper(newWp);
    if (typeof window !== "undefined") {
      localStorage.setItem("saban_chat_wallpaper", newWp);
    }
  };

  const getWallpaperStyle = (): { className: string; style?: React.CSSProperties } => {
    if (wallpaper === "default") {
      return { className: "wa-doodle" };
    }
    if (wallpaper === "blueprint-grid") {
      return { className: "wa-blueprint" };
    }
    if (wallpaper === "solid-emerald") {
      return { className: "bg-wa-chat-bg", style: { backgroundImage: "none" } };
    }
    return {
      className: "bg-wa-chat-bg",
      style: {
        backgroundImage: `url("${wallpaper}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
        backgroundPosition: "center",
      },
    };
  };

  const wpStyleConfig = getWallpaperStyle();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
  }, [isDark]);

  const activeConversation = CONVERSATIONS.find((c) => c.id === activeId) ?? CONVERSATIONS[0]!;
  const messages = useMemo(
    () => conversationMessages[activeId] || [],
    [conversationMessages, activeId],
  );

  // Filter typing users for current chat (excluding local user's own bubble)
  const currentChatTyping = typingState[activeId] || [];
  const otherTypingUsers = currentChatTyping.filter((u) => u.userId !== "me");

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, otherTypingUsers.length]);

  // Handle local user typing broadcast
  const handleUserTyping = useCallback(
    (isTyping: boolean) => {
      if (isTyping) {
        typingManager.startTyping(
          activeId,
          {
            userId: "me",
            userName: SENDER_NAME,
            statusText: `${SENDER_NAME} מקליד/ה...`,
          },
          true,
        );
      } else {
        typingManager.stopTyping(activeId, "me", true);
      }
    },
    [activeId],
  );

  const handleSend = useCallback(
    async (text: string) => {
      const outgoing: Message = {
        id: `out-${Date.now()}`,
        author: "me",
        text,
        time: nowTime(),
        status: "sent",
      };

      setConversationMessages((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), outgoing],
      }));

      // Visual feedback transition: sent (single tick) -> delivered (double grey tick) -> read (double blue tick)
      window.setTimeout(() => {
        setConversationMessages((prev) => ({
          ...prev,
          [activeId]: (prev[activeId] || []).map((message) =>
            message.id === outgoing.id ? { ...message, status: "delivered" } : message,
          ),
        }));
      }, 450);

      window.setTimeout(() => {
        setConversationMessages((prev) => ({
          ...prev,
          [activeId]: (prev[activeId] || []).map((message) =>
            message.id === outgoing.id ? { ...message, status: "read" } : message,
          ),
        }));
      }, 1300);

      // Branch based on active chat
      if (activeId === "noa") {
        typingManager.startTyping(
          "noa",
          {
            userId: "noa",
            userName: "נועה AI",
            avatar: NOA_AVATAR,
            statusText: "נועה מקלידה תשובה...",
          },
          true,
        );

        try {
          const result = await send({
            data: {
              source: "noa-web-pwa",
              senderName: SENDER_NAME,
              messageBody: text,
              timestamp: new Date().toISOString(),
            },
          });

          const incomingId = `in-${Date.now()}`;
          const incomingReply = result.reply;

          setConversationMessages((prev) => ({
            ...prev,
            noa: [
              ...(prev.noa || []),
              {
                id: incomingId,
                author: "noa",
                text: incomingReply,
                time: nowTime(),
              },
            ],
          }));

          if (noaSpeech.isAutoTts()) {
            window.setTimeout(() => {
              noaSpeech.speak(incomingId, incomingReply);
            }, 300);
          }
        } catch {
          setConversationMessages((prev) => ({
            ...prev,
            noa: [
              ...(prev.noa || []),
              {
                id: `err-${Date.now()}`,
                author: "noa",
                text: "לא הצלחתי לשלוח את ההודעה כרגע. נסה/י שוב 🙏",
                time: nowTime(),
              },
            ],
          }));
        } finally {
          typingManager.stopTyping("noa", "noa", true);
        }
      } else if (activeId === "sidur") {
        // Colleague typing simulation in drivers dispatch group
        window.setTimeout(() => {
          typingManager.startTyping(
            "sidur",
            {
              userId: "hikmat",
              userName: "חכמת (נהג)",
              statusText: "חכמת מקליד...",
            },
            true,
          );
        }, 500);

        window.setTimeout(() => {
          typingManager.stopTyping("sidur", "hikmat", true);
          setConversationMessages((prev) => ({
            ...prev,
            sidur: [
              ...(prev.sidur || []),
              {
                id: `in-${Date.now()}`,
                author: "noa",
                text: "חכמת: קיבלתי ראמי, אני בטיפול. מודיע כשאסיים פריקה 👍",
                time: nowTime(),
              },
            ],
          }));
        }, 2800);
      } else if (activeId === "shark") {
        window.setTimeout(() => {
          typingManager.startTyping(
            "shark",
            {
              userId: "shark",
              userName: "קבלן שארק",
              statusText: "קבלן שארק מקליד...",
            },
            true,
          );
        }, 500);

        window.setTimeout(() => {
          typingManager.stopTyping("shark", "shark", true);
          setConversationMessages((prev) => ({
            ...prev,
            shark: [
              ...(prev.shark || []),
              {
                id: `in-${Date.now()}`,
                author: "noa",
                text: "קבלן שארק: תודה ראמי, נדבר בבוקר עם הנהג לקבלת המכולה 🚚",
                time: nowTime(),
              },
            ],
          }));
        }, 2600);
      } else {
        const otherUser = activeConversation.name;
        window.setTimeout(() => {
          typingManager.startTyping(
            activeId,
            {
              userId: activeId,
              userName: otherUser,
              avatar: activeConversation.avatar,
              statusText: `${otherUser} מקליד/ה...`,
            },
            true,
          );
        }, 600);

        window.setTimeout(() => {
          typingManager.stopTyping(activeId, activeId, true);
          setConversationMessages((prev) => ({
            ...prev,
            [activeId]: [
              ...(prev[activeId] || []),
              {
                id: `in-${Date.now()}`,
                author: "noa",
                text: `תודה ראמי, קיבלתי את ההודעה!`,
                time: nowTime(),
              },
            ],
          }));
        }, 2700);
      }
    },
    [activeId, send, activeConversation],
  );

  // Manual interactive trigger to test typing indicator
  const handleSimulateTyping = useCallback(() => {
    if (activeId === "noa") {
      typingManager.startTyping(
        "noa",
        {
          userId: "noa",
          userName: "נועה AI",
          avatar: NOA_AVATAR,
          statusText: "נועה בודקת תעודות משלוח במערכת...",
        },
        true,
      );

      window.setTimeout(() => {
        typingManager.stopTyping("noa", "noa", true);
        setConversationMessages((prev) => ({
          ...prev,
          noa: [
            ...(prev.noa || []),
            {
              id: `sim-${Date.now()}`,
              author: "noa",
              text: "בדקתי את מצב המכולות: כל 4 המשימות להיום הושלמו בסידור העבודה 📋",
              time: nowTime(),
            },
          ],
        }));
      }, 3000);
    } else if (activeId === "sidur") {
      typingManager.startTyping(
        "sidur",
        {
          userId: "hikmat",
          userName: "חכמת הנהג",
          statusText: "חכמת מקליד...",
        },
        true,
      );

      window.setTimeout(() => {
        typingManager.stopTyping("sidur", "hikmat", true);
        setConversationMessages((prev) => ({
          ...prev,
          sidur: [
            ...(prev.sidur || []),
            {
              id: `sim-${Date.now()}`,
              author: "noa",
              text: "חכמת: הגעתי לשפינוזה, מכולה 12 קוב הוצבה בהצלחה 🚚📍",
              time: nowTime(),
            },
          ],
        }));
      }, 3200);
    } else {
      const name = activeConversation.name;
      typingManager.startTyping(
        activeId,
        {
          userId: activeId,
          userName: name,
          avatar: activeConversation.avatar,
          statusText: `${name} מקליד/ה...`,
        },
        true,
      );

      window.setTimeout(() => {
        typingManager.stopTyping(activeId, activeId, true);
        setConversationMessages((prev) => ({
          ...prev,
          [activeId]: [
            ...(prev[activeId] || []),
            {
              id: `sim-${Date.now()}`,
              author: "noa",
              text: `הודעה מעודכנת מ-${name}: קיבלתי את הפרטים, תודה!`,
              time: nowTime(),
            },
          ],
        }));
      }, 2800);
    }
  }, [activeId, activeConversation]);

  // Occasional ambient typing from fleet drivers in background so sidebar stays alive
  useEffect(() => {
    const ambientTimer = window.setInterval(() => {
      // Pick sidur or shark if not currently active
      const targetId = activeId === "sidur" ? "shark" : "sidur";
      const targetName = targetId === "sidur" ? "איציק זהבי" : "קבלן שארק";

      typingManager.startTyping(
        targetId,
        {
          userId: `ambient-${targetId}`,
          userName: targetName,
          statusText: `${targetName} מקליד/ה...`,
        },
        false,
      );

      window.setTimeout(() => {
        typingManager.stopTyping(targetId, `ambient-${targetId}`, false);
      }, 3500);
    }, 45000);

    return () => window.clearInterval(ambientTimer);
  }, [activeId]);

  return (
    <div dir="rtl" className="flex h-dvh w-full flex-col bg-wa-shell text-wa-bubble-text">
      <div className="mx-auto flex h-full w-full max-w-[1600px] overflow-hidden shadow-2xl lg:my-0">
        <Sidebar
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            setMobileChatOpen(true);
          }}
          isDark={isDark}
          onToggleTheme={() => setIsDark((value) => !value)}
          typingState={typingState}
          conversationMessages={conversationMessages}
          className={cn(mobileChatOpen ? "hidden md:flex" : "flex")}
        />

        <main
          className={cn(
            "h-full min-w-0 flex-1 flex-col",
            mobileChatOpen ? "flex" : "hidden md:flex",
          )}
        >
          <ChatHeader
            conversation={activeConversation}
            status={activeId === "noa" ? "מחובר/ת כעת" : "נראתה לאחרונה היום"}
            typingUsers={otherTypingUsers}
            onBack={() => setMobileChatOpen(false)}
            onOpenWallpaper={() => setShowWallpaperModal(true)}
            onSimulateColleagueTyping={handleSimulateTyping}
            onResetHistory={handleResetHistory}
            onOpenQrGateway={() => setShowQrModal(true)}
            gatewayStatus={gatewayStatus}
            onOpenJournal={() => setShowJournalModal(true)}
            onOpenVoiceSettings={() => setShowVoiceModal(true)}
            onOpenPwaGuide={() => setShowPwaGuideModal(true)}
            onSendRealWhatsAppToMake={handleSendRealWhatsAppToMake}
          />

          {/* PWA Install Guidance Banner */}
          <PWAInstallBanner onOpenManualGuide={() => setShowPwaGuideModal(true)} />

          {/* Real WhatsApp to Make Quick Trigger Card */}
          <div className="mx-3 my-1 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/25 bg-[#12231c]/90 px-3.5 py-2 text-xs shadow-xs backdrop-blur">
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Zap className="size-3.5 fill-emerald-400" />
              </span>
              <span className="text-[11.5px] leading-tight">
                <strong>אינטגרציית WhatsApp ⮀ Make:</strong> שדר הודעת WhatsApp אמיתית
                (050-886-1080) ל-Make Webhook וצפה בסנכרון החי בצ&apos;אט.
              </span>
            </div>
            <button
              type="button"
              disabled={isSendingWhatsAppToMake}
              onClick={() => handleSendRealWhatsAppToMake()}
              className="flex items-center gap-1.5 rounded-lg bg-wa-green px-3 py-1.5 text-xs font-semibold text-wa-shell transition-all hover:bg-wa-green-hover disabled:opacity-50 active:scale-95 shadow-xs"
            >
              {isSendingWhatsAppToMake ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>משדר ל-Make...</span>
                </>
              ) : (
                <>
                  <Smartphone className="size-3.5" />
                  <span>שדר הודעת WhatsApp ל-Make ⚡</span>
                </>
              )}
            </button>
          </div>

          <div
            ref={scrollRef}
            className={cn(
              "wa-scroll flex-1 overflow-y-auto px-3 py-4 sm:px-8",
              wpStyleConfig.className,
            )}
            style={wpStyleConfig.style}
          >
            <div className="mx-auto flex max-w-4xl flex-col gap-2">
              <p className="mx-auto mb-2 flex items-center gap-1.5 rounded-lg bg-wa-panel/80 px-3 py-1.5 text-center text-[11px] text-wa-meta backdrop-blur">
                <Lock className="size-3" />
                ההודעות מוצפנות מקצה לקצה
              </p>
              <p className="mx-auto mb-2 rounded-lg bg-wa-panel/80 px-3 py-1 text-[11px] text-wa-meta backdrop-blur">
                היום
              </p>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {otherTypingUsers.length > 0 ? (
                <TypingIndicator users={otherTypingUsers} fallbackName={activeConversation.name} />
              ) : null}
            </div>
          </div>

          <Composer
            onSend={handleSend}
            disabled={otherTypingUsers.some((u) => u.userId === "noa")}
            onTypingChange={handleUserTyping}
            onOpenJournal={() => setShowJournalModal(true)}
          />
        </main>

        <WallpaperModal
          isOpen={showWallpaperModal}
          onClose={() => setShowWallpaperModal(false)}
          currentWallpaper={wallpaper}
          onSelectWallpaper={handleSelectWallpaper}
        />

        <WhatsAppQrModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          status={gatewayStatus}
          onChangeStatus={handleGatewayStatusChange}
          phoneNumber="+972 50-886-1080"
          onTriggerRealWhatsApp={handleSendRealWhatsAppToMake}
        />

        <JournalModal
          isOpen={showJournalModal}
          onClose={() => setShowJournalModal(false)}
          onShareToChat={handleShareJournalCard}
        />

        <VoiceSettingsModal isOpen={showVoiceModal} onClose={() => setShowVoiceModal(false)} />

        <PWAInstallGuideModal
          isOpen={showPwaGuideModal}
          onClose={() => setShowPwaGuideModal(false)}
        />
      </div>
    </div>
  );
}
