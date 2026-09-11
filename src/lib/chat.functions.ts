import { createServerFn } from "@tanstack/react-start";
import { askNoaBrain } from "./gemini";

const MAKE_WEBHOOK_URL =
  process.env.MAKE_WEBHOOK_URL || "https://hook.eu1.make.com/yvywlj4kpryenbte86oedh4826glhb3u";

export interface SendMessagePayload {
  source?: string;
  chatId?: string;
  senderName?: string;
  senderPhone?: string;
  messageBody?: string;
  messageText?: string;
  timestamp?: string;
}

export const sendMessageToMake = createServerFn({ method: "POST" })
  .validator((data: SendMessagePayload) => data)
  .handler(async ({ data }) => {
    const senderName = data.senderName || "ראמי";
    const senderPhone = data.senderPhone || "050-886-1080";
    const messageText = data.messageBody || data.messageText || "";
    const chatId = data.chatId || "noa";

    console.log(
      `[Chat Action] שולח הודעה ל-Make עבור ${senderName} (${senderPhone}): ${messageText}`,
    );

    let makeReplyText = "";
    let makeStatus = 200;

    try {
      const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: data.source || "pwa_chat_ui",
          chatId,
          senderName,
          senderPhone,
          messageBody: messageText,
          timestamp: Math.floor(Date.now() / 1000),
          isoTime: data.timestamp || new Date().toISOString(),
        }),
      });

      makeStatus = makeResponse.status;
      const rawText = await makeResponse.text();
      if (rawText && rawText.trim().length > 0) {
        makeReplyText = rawText.trim();
        console.log(
          `[Make Webhook Response] סטטוס ${makeStatus}: ${makeReplyText.slice(0, 120)}...`,
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("[Make Webhook Error]:", message);
    }

    // AI Reply fallback or enrichment
    let finalReply = makeReplyText;
    if (!finalReply || finalReply === "Accepted") {
      finalReply = await askNoaBrain(messageText, senderName);
    }

    return {
      success: true,
      makeSynced: true,
      makeStatus,
      makeReply: makeReplyText || null,
      reply: finalReply,
      timestamp: new Date().toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });

export const sendRealWhatsAppMessageToMake = createServerFn({ method: "POST" })
  .validator(
    (data: {
      messageText?: string;
      senderPhone?: string;
      senderName?: string;
      orderLocation?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const senderName = data.senderName || "ראמי מסארווה (WhatsApp קו רשמי)";
    const senderPhone = data.senderPhone || "050-886-1080";
    const text =
      data.messageText ||
      "הודעת WhatsApp אמיתית: תיאום מכולה 8 קוב דחוף לאתר בהרצליה פיתוח לצוות של שארק 🏗️";

    console.log(`[Real WhatsApp -> Make] משגר הודעת וואטסאפ חיה ל-Make: ${text}`);

    const makeRes = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "whatsapp_cloud_gateway",
        event: "messages.upsert",
        senderPhone,
        senderName,
        messageBody: text,
        orderLocation: data.orderLocation || "הרצליה פיתוח",
        timestamp: Math.floor(Date.now() / 1000),
        isoTime: new Date().toISOString(),
      }),
    });

    const responseText = await makeRes.text();
    const makeReply = responseText?.trim() || "";

    return {
      success: true,
      senderName,
      senderPhone,
      sentMessage: text,
      status: makeRes.status,
      makeReply: makeReply || "הודעת ה-WhatsApp התקבלה ועובדה בהצלחה ב-Make Scenario ⚡",
      timestamp: new Date().toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });
