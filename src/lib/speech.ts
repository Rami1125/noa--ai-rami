/**
 * מנוע הקראת קול נשי בעברית עבור נועה AI — SabanOS
 * משתמש ב-Web Speech API עם העדפה חכמה לקולות נשיים בעברית
 * כגון Carmit (Apple), Hila (Microsoft), Google עברית, וכוונון Pitch/Rate לגוון נשי חם וטבעי.
 */

type SpeechListener = () => void;

class NoaSpeechService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentMessageId: string | null = null;
  private isSpeakingState = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private listeners: Set<SpeechListener> = new Set();
  private autoTtsEnabled = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const savedAuto = localStorage.getItem("noa_auto_tts");
        this.autoTtsEnabled = savedAuto === "true";
      } catch {
        // localStorage not available
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initBestHebrewVoice();
          this.notify();
        };
        this.initBestHebrewVoice();
      }
    }
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public isAutoTts(): boolean {
    return this.autoTtsEnabled;
  }

  public setAutoTts(enabled: boolean) {
    this.autoTtsEnabled = enabled;
    try {
      localStorage.setItem("noa_auto_tts", String(enabled));
    } catch {
      // ignore
    }
    this.notify();
  }

  public getCurrentMessageId(): string | null {
    return this.currentMessageId;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    return this.selectedVoice;
  }

  /**
   * מאתר את כל הקולות בעברית הקיימים במכשיר/דפדפן
   */
  public getHebrewVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    const voices = window.speechSynthesis.getVoices();
    return voices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith("he") ||
        v.lang.toLowerCase().startsWith("iw") ||
        v.name.toLowerCase().includes("hebrew") ||
        v.name.includes("עברית") ||
        v.name.toLowerCase().includes("carmit") ||
        v.name.toLowerCase().includes("hila"),
    );
  }

  /**
   * בחירת הקול הנשי הטוב ביותר בעברית
   * סדר עדיפויות:
   * 1. Hila (קול נשי טבעי של Microsoft Edge/Windows)
   * 2. Carmit (קול נשי בעברית של Apple iOS / macOS / Safari)
   * 3. Google עברית / Hebrew (קול ברירת מחדל נשי ב-Chrome / Android)
   * 4. כל קול עברית אחר
   */
  private initBestHebrewVoice() {
    if (!this.isSupported()) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    const hebrewVoices = this.getHebrewVoices();

    // 1. חיפוש Hila (קול נשי של Microsoft)
    const hila = hebrewVoices.find(
      (v) =>
        v.name.toLowerCase().includes("hila") ||
        (v.name.toLowerCase().includes("female") && v.lang.startsWith("he")),
    );
    if (hila) {
      this.selectedVoice = hila;
      return;
    }

    // 2. חיפוש Carmit (קול נשי של אפל)
    const carmit = hebrewVoices.find((v) => v.name.toLowerCase().includes("carmit"));
    if (carmit) {
      this.selectedVoice = carmit;
      return;
    }

    // 3. חיפוש Google עברית (Chrome / Android)
    const googleHe = hebrewVoices.find(
      (v) =>
        v.name.toLowerCase().includes("google") &&
        (v.lang.startsWith("he") || v.lang.startsWith("iw")),
    );
    if (googleHe) {
      this.selectedVoice = googleHe;
      return;
    }

    // 4. קול עברית כלשהו
    if (hebrewVoices.length > 0) {
      this.selectedVoice = hebrewVoices[0];
      return;
    }

    // 5. ברירת מחדל
    this.selectedVoice = null;
  }

  public setVoice(voice: SpeechSynthesisVoice) {
    this.selectedVoice = voice;
    this.notify();
  }

  /**
   * מנקה ומכין את הטקסט להקראה טבעית ונעימה בעברית
   * מסיר אימוג'ים, קישורים, תגיות, כוכביות, ומנרמל מונחים וראשי תיבות מקצועיים
   */
  public cleanTextForSpeech(rawText: string): string {
    if (!rawText) return "";

    let text = rawText;

    // הסרת חתימת נועה או תרגומה לסיום נעים
    text = text.replace(/נועה\s*❤️\s*\|\s*סידור\s*ח\.\s*סבן/g, "נועה, סידור ח. סבן");
    text = text.replace(/נועה\s*❤️\s*\|\s*המאמנת\s*האישית\s*שלך/g, "נועה, המאמנת האישית שלך");

    // החלפת ראשי תיבות ומונחי בנייה לקריאה שוטפת
    text = text.replace(/מק["״]ט/g, "מקט ");
    text = text.replace(/קו["״]ב/g, "קוב ");
    text = text.replace(/ח["״]כ/g, "חבר כנסת ");
    text = text.replace(/קומקס/g, "קומקס ");
    text = text.replace(/ח\.\s*סבן/g, "ח סבן ");
    text = text.replace(/מ["״]ר/g, "מטר רבוע ");
    text = text.replace(/ק["״]ג/g, "קילוגרם ");
    text = text.replace(/ס["״]מ/g, "סנטימטר ");
    text = text.replace(/מ["״]מ/g, "מילימטר ");

    // הסרת קישורים
    text = text.replace(/https?:\/\/\S+/g, "קישור מצורף");

    // החלפת תבליטים ואימוג'ים ברווח
    text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, " ");
    const symbolsToRemove = [
      "🔹",
      "🔸",
      "▪️",
      "▫️",
      "▶️",
      "✔️",
      "✅",
      "❌",
      "⚠️",
      "🚨",
      "💡",
      "🌙",
      "🌿",
      "👤",
      "📋",
      "📦",
      "🏗️",
      "🧱",
      "🚛",
      "🚚",
      "📍",
      "⏰",
      "📞",
      "❤️",
      "🔐",
      "🔒",
    ];
    for (const sym of symbolsToRemove) {
      text = text.replaceAll(sym, " ");
    }

    // הסרת כוכביות, סולמיות, קווים
    text = text.replace(/[*#_~`]/g, " ");

    // הסרת קווים מפרידים עודפים
    text = text.replace(/[-—]{2,}/g, " ");

    // נרמול רווחים ושורות
    text = text.replace(/\s+/g, " ").trim();

    return text;
  }

  /**
   * מקריא טקסט בקול נשי בעברית
   */
  public speak(messageId: string, rawText: string, onEnd?: () => void) {
    if (!this.isSupported()) {
      console.warn("Speech synthesis not supported in this browser.");
      return;
    }

    // אם כבר מקריא את אותה הודעה - מפסיק
    if (this.currentMessageId === messageId && this.isSpeakingState) {
      this.stop();
      return;
    }

    // עצירת הקראה קודמת
    this.stop();

    const clean = this.cleanTextForSpeech(rawText);
    if (!clean) return;

    // וידוא קול
    if (!this.selectedVoice) {
      this.initBestHebrewVoice();
    }

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "he-IL";

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // כוונון מדויק לגוון נשי נעים, צלול וטבעי:
    // pitch מעט מוגבה (1.12) מעניק מנעד קול נשי חם, ו-rate (0.97) מעניק קצב דיבור ברור ולא מהיר
    utterance.pitch = 1.12;
    utterance.rate = 0.97;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isSpeakingState = true;
      this.currentMessageId = messageId;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.currentMessageId = null;
      this.currentUtterance = null;
      this.notify();
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      this.isSpeakingState = false;
      this.currentMessageId = null;
      this.currentUtterance = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * עוצר כל הקראה פעילה
   */
  public stop() {
    if (!this.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    this.isSpeakingState = false;
    this.currentMessageId = null;
    this.currentUtterance = null;
    this.notify();
  }
}

export const noaSpeech = new NoaSpeechService();
