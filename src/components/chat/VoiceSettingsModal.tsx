import { useState, useEffect } from "react";
import { Volume2, VolumeX, Square, Play, Check, Sparkles, X, Radio } from "lucide-react";
import { noaSpeech } from "@/lib/speech";
import { cn } from "@/lib/utils";

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceSettingsModal({ isOpen, onClose }: VoiceSettingsModalProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoTts, setAutoTts] = useState(false);
  const isSupported = noaSpeech.isSupported();

  useEffect(() => {
    if (!isOpen) return;

    const updateState = () => {
      setVoices(noaSpeech.getHebrewVoices());
      setSelectedVoice(noaSpeech.getSelectedVoice());
      setIsSpeaking(noaSpeech.isSpeaking());
      setAutoTts(noaSpeech.isAutoTts());
    };

    updateState();
    return noaSpeech.subscribe(updateState);
  }, [isOpen]);

  if (!isOpen) return null;

  const sampleText =
    "שלום ראמי, אני נועה מסידור העבודה של ח. סבן. אני מדברת בעברית מלאה בקול נשי חם וטבעי, וזמינה לעזור לך בכל משימה בשטח, בניהול המכולות ובסיכום היום.";

  const handleTestVoice = () => {
    if (isSpeaking) {
      noaSpeech.stop();
    } else {
      noaSpeech.speak("test-sample", sampleText);
    }
  };

  const handleToggleAuto = () => {
    const next = !autoTts;
    setAutoTts(next);
    noaSpeech.setAutoTts(next);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="wa-pop relative w-full max-w-md overflow-hidden rounded-2xl bg-wa-panel border border-wa-divider shadow-2xl text-wa-bubble-text">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-wa-divider px-5 py-4 bg-wa-topbar">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-wa-green/15 text-wa-green">
              <Volume2 className="size-5" />
            </div>
            <div>
              <h2 id="voice-modal-title" className="text-base font-bold text-wa-bubble-text">
                הקראת קול נשי — נועה AI
              </h2>
              <p className="text-xs text-wa-meta">עברית מלאה ומותאמת אישית • ח. סבן</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              noaSpeech.stop();
              onClose();
            }}
            aria-label="סגור"
            className="rounded-full p-1.5 text-wa-meta transition-colors hover:bg-wa-hover hover:text-wa-bubble-text"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-5 text-sm">
          {!isSupported ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
              דפדפן זה אינו תומך בהקראה קולית (SpeechSynthesis). מומלץ להשתמש ב-Chrome, Edge או
              Safari.
            </div>
          ) : null}

          {/* Test voice card */}
          <div className="rounded-xl border border-wa-divider/60 bg-wa-bubble-in/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-semibold text-wa-bubble-text">
                <Sparkles className="size-4 text-wa-green" />
                <span>בדיקת גוון הקול הנשי</span>
              </div>
              {isSpeaking ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-wa-green">
                  <span className="size-1.5 rounded-full bg-wa-green animate-ping" />
                  מקריאה כעת...
                </span>
              ) : null}
            </div>

            <p className="text-xs text-wa-meta leading-relaxed mb-3.5 bg-wa-panel/60 p-2.5 rounded-lg border border-wa-divider/30">
              "{sampleText}"
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestVoice}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-xs",
                  isSpeaking
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                    : "bg-wa-green text-wa-shell hover:opacity-90 active:scale-98",
                )}
              >
                {isSpeaking ? (
                  <>
                    <Square className="size-3.5 fill-current" />
                    <span>עצירת השמעה</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 fill-current" />
                    <span>השמעת דוגמת קול בעברית</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Auto TTS setting */}
          <div className="flex items-center justify-between rounded-xl border border-wa-divider/60 bg-wa-bubble-in/30 p-3.5">
            <div className="space-y-0.5">
              <p className="font-semibold text-xs text-wa-bubble-text">הקראה אוטומטית של הודעות</p>
              <p className="text-[11px] text-wa-meta">
                נועה תקריא אוטומטית בקול נשי כל תשובה שהיא שולחת
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoTts}
              onClick={handleToggleAuto}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                autoTts ? "bg-wa-green" : "bg-wa-divider",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  autoTts ? "-translate-x-5" : "translate-x-0",
                )}
              />
            </button>
          </div>

          {/* Detected Voice Information */}
          <div className="rounded-xl border border-wa-divider/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-wa-meta">מנוע קול מזוהה:</span>
              <span className="font-bold text-wa-green">
                {selectedVoice?.name || "קול עברית מערכתי (טבעי)"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-wa-meta">שפה:</span>
              <span className="font-mono text-wa-bubble-text">
                {selectedVoice?.lang || "he-IL"} (עברית)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-wa-meta">גוון:</span>
              <span className="text-wa-bubble-text font-medium">נשי חם • מותאם שטח ותפעול</span>
            </div>

            {voices.length > 1 ? (
              <div className="pt-2 border-t border-wa-divider/30">
                <p className="text-[11px] text-wa-meta mb-1.5">קולות עברית נוספים זמינים במכשיר:</p>
                <div className="space-y-1">
                  {voices.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => noaSpeech.setVoice(v)}
                      className={cn(
                        "w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg border transition-colors text-start",
                        selectedVoice?.name === v.name
                          ? "border-wa-green/50 bg-wa-green/10 text-wa-green font-medium"
                          : "border-wa-divider/30 hover:bg-wa-hover text-wa-meta",
                      )}
                    >
                      <span className="truncate">{v.name}</span>
                      {selectedVoice?.name === v.name ? (
                        <Check className="size-3.5 shrink-0" />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick instructions */}
          <div className="flex items-start gap-2 text-[11px] text-wa-meta bg-wa-panel/40 p-2.5 rounded-lg">
            <Radio className="size-3.5 text-wa-green shrink-0 mt-0.5" />
            <span>
              תוכל להקריא כל הודעה של נועה בכל רגע בלחיצה על כפתור הרמקול 🔊 המופיע לצד שמה בכל בועת
              הודעה בצ'אט.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-wa-divider bg-wa-topbar px-5 py-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              noaSpeech.stop();
              onClose();
            }}
            className="rounded-xl bg-wa-green px-5 py-2 text-xs font-bold text-wa-shell hover:opacity-90 transition-opacity"
          >
            אישור וסיום
          </button>
        </div>
      </div>
    </div>
  );
}
