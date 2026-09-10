export type TypingUser = {
  userId: string;
  userName: string;
  avatar?: string;
  statusText?: string;
  conversationId: string;
  timestamp: number;
};

export type TypingEventPayload = {
  type: "typing_start" | "typing_stop";
  conversationId: string;
  userId: string;
  userName: string;
  avatar?: string;
  statusText?: string;
  timestamp: number;
};

type TypingListener = (state: Record<string, TypingUser[]>) => void;

class TypingEventManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<TypingListener> = new Set();
  private typingState: Record<string, TypingUser[]> = {};
  private autoClearTimers: Map<string, number> = new Map();

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel("saban_realtime_typing_channel");
        this.channel.onmessage = (event: MessageEvent<TypingEventPayload>) => {
          this.handleEvent(event.data);
        };
      } catch {
        this.channel = null;
      }
    }

    // Storage fallback for cross-tab sync if BroadcastChannel is blocked
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === "saban_realtime_typing_event" && e.newValue) {
          try {
            const payload = JSON.parse(e.newValue) as TypingEventPayload;
            this.handleEvent(payload);
          } catch {
            // ignore
          }
        }
      });
    }
  }

  private notify() {
    const clone = { ...this.typingState };
    this.listeners.forEach((listener) => listener(clone));
  }

  private handleEvent(payload: TypingEventPayload) {
    const { type, conversationId, userId, userName, avatar, statusText, timestamp } = payload;
    const key = `${conversationId}:${userId}`;

    // Clear any existing timer
    if (this.autoClearTimers.has(key)) {
      window.clearTimeout(this.autoClearTimers.get(key));
      this.autoClearTimers.delete(key);
    }

    const currentList = this.typingState[conversationId] || [];

    if (type === "typing_stop") {
      this.typingState[conversationId] = currentList.filter((u) => u.userId !== userId);
      this.notify();
      return;
    }

    if (type === "typing_start") {
      const exists = currentList.some((u) => u.userId === userId);
      const newUser: TypingUser = {
        userId,
        userName,
        avatar,
        statusText: statusText || "מקליד/ה...",
        conversationId,
        timestamp: timestamp || Date.now(),
      };

      this.typingState[conversationId] = exists
        ? currentList.map((u) => (u.userId === userId ? newUser : u))
        : [...currentList, newUser];

      // Auto clear after 4.5 seconds of inactivity in case stop wasn't received
      const timer = window.setTimeout(() => {
        this.stopTyping(conversationId, userId, false);
      }, 4500);
      this.autoClearTimers.set(key, timer);

      this.notify();
    }
  }

  public startTyping(
    conversationId: string,
    user: { userId: string; userName: string; avatar?: string; statusText?: string },
    broadcast: boolean = true,
  ) {
    const payload: TypingEventPayload = {
      type: "typing_start",
      conversationId,
      userId: user.userId,
      userName: user.userName,
      avatar: user.avatar,
      statusText: user.statusText,
      timestamp: Date.now(),
    };

    this.handleEvent(payload);

    if (broadcast) {
      this.broadcast(payload);
    }
  }

  public stopTyping(conversationId: string, userId: string, broadcast: boolean = true) {
    const payload: TypingEventPayload = {
      type: "typing_stop",
      conversationId,
      userId,
      userName: "",
      timestamp: Date.now(),
    };

    this.handleEvent(payload);

    if (broadcast) {
      this.broadcast(payload);
    }
  }

  private broadcast(payload: TypingEventPayload) {
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch {
        // ignore
      }
    }
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("saban_realtime_typing_event", JSON.stringify(payload));
      } catch {
        // ignore
      }
    }
  }

  public subscribe(listener: TypingListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.typingState });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getTyping(conversationId: string): TypingUser[] {
    return this.typingState[conversationId] || [];
  }
}

export const typingManager = new TypingEventManager();
