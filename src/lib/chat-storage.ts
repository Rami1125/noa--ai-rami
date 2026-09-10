import { INITIAL_CONVERSATION_MESSAGES, type Message } from "@/lib/chat-data";

const STORAGE_KEY_CHAT = "saban_chat_history_v1";
const STORAGE_KEY_ACTIVE_CONV = "saban_active_conversation_id";

/**
 * Loads the stored chat history from localStorage.
 * Falls back to INITIAL_CONVERSATION_MESSAGES if absent or corrupted.
 */
export function loadChatHistory(): Record<string, Message[]> {
  if (typeof window === "undefined") {
    return INITIAL_CONVERSATION_MESSAGES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT);
    if (!raw) {
      return INITIAL_CONVERSATION_MESSAGES;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return INITIAL_CONVERSATION_MESSAGES;
    }

    // Ensure all default conversations exist even if storage has partial keys
    const merged: Record<string, Message[]> = { ...INITIAL_CONVERSATION_MESSAGES };
    for (const key of Object.keys(parsed)) {
      if (Array.isArray(parsed[key])) {
        merged[key] = parsed[key];
      }
    }

    return merged;
  } catch (error) {
    console.warn("Could not read chat history from localStorage:", error);
    return INITIAL_CONVERSATION_MESSAGES;
  }
}

/**
 * Persists the chat history into localStorage.
 */
export function saveChatHistory(history: Record<string, Message[]>): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(history));
  } catch (error) {
    console.warn("Could not save chat history to localStorage:", error);
  }
}

/**
 * Resets chat history in localStorage back to default and returns defaults.
 */
export function resetChatHistory(): Record<string, Message[]> {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY_CHAT);
    } catch (error) {
      console.warn("Could not reset chat history in localStorage:", error);
    }
  }
  return INITIAL_CONVERSATION_MESSAGES;
}

/**
 * Loads the active conversation ID from localStorage.
 */
export function loadActiveConversationId(): string {
  if (typeof window === "undefined") return "noa";
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_CONV) || "noa";
  } catch {
    return "noa";
  }
}

/**
 * Saves the active conversation ID in localStorage.
 */
export function saveActiveConversationId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_CONV, id);
  } catch {
    // ignore
  }
}
