import { createServerFn } from "@tanstack/react-start";
import { askNoaBrain } from "./gemini";

const MAKE_WEBHOOK_URL =
  process.env.MAKE_WEBHOOK_URL || "https://hook.eu1.make.com/yvywlj4kpryenbte86oedh4826glhb3u";

export interface SendMessagePayload {
  source?: string;
  chatId?: string;
  senderName?: string;
  messageBody?: string;
  messageText?: string;
  timestamp?: string;
}

export const sendMessageToMake = createServerFn({ method: "POST" })
  .validator((data: SendMessagePayload) => data)
  .handler(async ({ data }) => {
    const senderName = data.senderName || "ראמי";
    const messageText = data.messageBody || data.messageText || "";
    const chatId = data.chatId || "noa";

    console.log(`[Chat Action] התקבלה הודעה מ-${senderName}: ${messageText}`);

    const webhookPromise = fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: data.source || "pwa_chat_ui",
        chatId,
        senderName,
        messageBody: messageText,
        timestamp: Math.floor(Date.now() / 1000),
        isoTime: data.timestamp || new Date().toISOString(),
      }),
    }).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("[Make Webhook Error]:", message);
    });

    const aiReplyPromise = askNoaBrain(messageText, senderName);

    const [_, aiReply] = await Promise.all([webhookPromise, aiReplyPromise]);

    return {
      success: true,
      reply: aiReply,
      timestamp: new Date().toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });
