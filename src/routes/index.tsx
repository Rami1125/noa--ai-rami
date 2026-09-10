import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";

import { Sidebar } from "@/components/chat/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble, TypingIndicator } from "@/components/chat/MessageBubble";
import { Composer } from "@/components/chat/Composer";
import { CONVERSATIONS, INITIAL_MESSAGES, type Message } from "@/lib/chat-data";
import { sendMessageToMake } from "@/lib/chat.functions";
import { cn } from "@/lib/utils";

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
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [typing, setTyping] = useState(false);
  const [activeId, setActiveId] = useState("noa");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const send = useServerFn(sendMessageToMake);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
  }, [isDark]);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, typing]);

  const activeConversation = CONVERSATIONS.find((c) => c.id === activeId) ?? CONVERSATIONS[0]!;

  const handleSend = useCallback(
    async (text: string) => {
      const outgoing: Message = {
        id: `out-${Date.now()}`,
        author: "me",
        text,
        time: nowTime(),
        status: "sent",
      };
      setMessages((current) => [...current, outgoing]);
      setTyping(true);

      window.setTimeout(() => {
        setMessages((current) =>
          current.map((message) =>
            message.id === outgoing.id ? { ...message, status: "read" } : message,
          ),
        );
      }, 900);

      try {
        const result = await send({
          data: {
            source: "noa-web-pwa",
            senderName: SENDER_NAME,
            messageBody: text,
            timestamp: new Date().toISOString(),
          },
        });

        setMessages((current) => [
          ...current,
          {
            id: `in-${Date.now()}`,
            author: "noa",
            text: result.reply,
            time: nowTime(),
          },
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          {
            id: `err-${Date.now()}`,
            author: "noa",
            text: "לא הצלחתי לשלוח את ההודעה כרגע. נסה/י שוב 🙏",
            time: nowTime(),
          },
        ]);
      } finally {
        setTyping(false);
      }
    },
    [send],
  );

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
          className={cn(mobileChatOpen ? "hidden md:flex" : "flex")}
        />

        <main
          className={cn(
            "h-full min-w-0 flex-1 flex-col",
            mobileChatOpen ? "flex" : "hidden md:flex",
          )}
        >
          <ChatHeader
            title={activeConversation.name}
            status={activeId === "noa" ? "מחובר/ת כעת" : "נראתה לאחרונה היום"}
            onBack={() => setMobileChatOpen(false)}
          />

          <div
            ref={scrollRef}
            className="wa-doodle wa-scroll flex-1 overflow-y-auto px-3 py-4 sm:px-8"
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
              {typing ? <TypingIndicator /> : null}
            </div>
          </div>

          <Composer onSend={handleSend} disabled={typing} />
        </main>
      </div>
    </div>
  );
}
