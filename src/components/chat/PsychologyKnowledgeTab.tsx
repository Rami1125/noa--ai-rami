import { useState, useEffect } from "react";
import {
  Brain,
  Shield,
  Wind,
  Search,
  Sparkles,
  AlertTriangle,
  Play,
  Square,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  PSYCHOLOGICAL_FRAMEWORKS,
  PSYCHOLOGICAL_EXERCISES,
  COGNITIVE_DISTORTIONS,
  SOS_DISPATCH_PROTOCOL,
  type PsychologyCategory,
  type PsychologicalFramework,
} from "@/lib/psychology";
import { cn } from "@/lib/utils";

type PsychologyKnowledgeTabProps = {
  onAskNoa?: (prompt: string) => void;
};

export function PsychologyKnowledgeTab({ onAskNoa }: PsychologyKnowledgeTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    PsychologyCategory | "all" | "distortions" | "sos"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFrameworkId, setExpandedFrameworkId] = useState<string | null>("stoicism-control");

  // Breathing timer state
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");

  useEffect(() => {
    if (!activeExerciseId) return;

    const interval = window.setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExerciseId]);

  useEffect(() => {
    if (!activeExerciseId) return;

    if (activeExerciseId === "physiological-sigh") {
      // 2s inhale, 1s top-up inhale, 5s exhale
      const cycle = timerSeconds % 8;
      if (cycle < 3) {
        setBreathingPhase("inhale");
      } else {
        setBreathingPhase("exhale");
      }
    } else if (activeExerciseId === "box-breathing") {
      // 4s inhale, 4s hold, 4s exhale, 4s hold
      const cycle = timerSeconds % 16;
      if (cycle < 4) {
        setBreathingPhase("inhale");
      } else if (cycle < 8) {
        setBreathingPhase("hold");
      } else if (cycle < 12) {
        setBreathingPhase("exhale");
      } else {
        setBreathingPhase("hold");
      }
    }
  }, [timerSeconds, activeExerciseId]);

  const filteredFrameworks = PSYCHOLOGICAL_FRAMEWORKS.filter((f) => {
    const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.dispatchApplication.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.coreConcepts.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleStartExercise = (exerciseId: string) => {
    if (activeExerciseId === exerciseId) {
      setActiveExerciseId(null);
      setTimerSeconds(0);
    } else {
      setActiveExerciseId(exerciseId);
      setTimerSeconds(0);
      setBreathingPhase("inhale");
    }
  };

  return (
    <div className="space-y-6 text-wa-bubble-text">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-wa-panel-alt to-wa-panel p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40">
              <Brain className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  מאגר ידע פסיכולוגי וחוסן מנטלי — נועה AI
                </h3>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                  גרסה 2.0
                </span>
              </div>
              <p className="mt-1 text-xs text-wa-meta leading-relaxed">
                כלים מוכחים מעולמות ה-CBT, סטואיציזם, וויסות סומטי (פולי-וגאל) ותקשורת מקרבת (NVC),
                המכוילים במיוחד עבור ראמי וסדרני ח. סבן תחת עומסי שיחות, פקקים ובלת״מים.
              </p>
            </div>
          </div>

          {onAskNoa && (
            <button
              type="button"
              onClick={() =>
                onAskNoa(
                  "נועה, ספרי לי על המאגר הפסיכולוגי שלך ואיזה כלים מנטליים את מציעה לסדרן עבודה",
                )
              }
              className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 shrink-0"
            >
              <Sparkles className="size-3.5" />
              <span>שוחח עם נועה על המאגר</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Quick Breathing Guide */}
      <div className="rounded-2xl border border-wa-divider bg-wa-panel-alt/70 p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Wind className="size-4 text-emerald-400" />
            <h4 className="text-sm font-semibold">איפוס מהיר של מערכת העצבים (וויסות סומטי)</h4>
          </div>
          {activeExerciseId && (
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{timerSeconds} שניות</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PSYCHOLOGICAL_EXERCISES.slice(0, 2).map((ex) => {
            const isActive = activeExerciseId === ex.id;
            return (
              <div
                key={ex.id}
                className={cn(
                  "flex flex-col justify-between rounded-xl border p-3.5 transition-all",
                  isActive
                    ? "border-emerald-500/50 bg-emerald-950/20 shadow-sm"
                    : "border-wa-divider/80 bg-wa-panel hover:border-wa-divider",
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      <span>{ex.emoji}</span>
                      <span className="font-semibold">{ex.title}</span>
                    </div>
                    <span className="rounded bg-wa-hover px-1.5 py-0.5 text-[10px] font-mono text-wa-meta">
                      {ex.duration}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-wa-meta leading-relaxed">{ex.purpose}</p>

                  {isActive && (
                    <div className="my-3 flex flex-col items-center justify-center rounded-xl bg-black/30 p-3 border border-emerald-500/20">
                      <div
                        className={cn(
                          "flex size-20 items-center justify-center rounded-full transition-all duration-1000",
                          breathingPhase === "inhale"
                            ? "scale-120 bg-emerald-500/25 border-2 border-emerald-400 text-emerald-300"
                            : breathingPhase === "hold"
                              ? "scale-110 bg-amber-500/25 border-2 border-amber-400 text-amber-300"
                              : "scale-85 bg-sky-500/25 border-2 border-sky-400 text-sky-300",
                        )}
                      >
                        <span className="text-xs font-bold">
                          {breathingPhase === "inhale"
                            ? "שאיפה עמוקה 🫁"
                            : breathingPhase === "hold"
                              ? "החזק אוויר ⏱️"
                              : "נשיפה אטית 🌬️"}
                        </span>
                      </div>
                      <span className="mt-2 text-[10px] text-wa-meta">
                        {ex.id === "physiological-sigh"
                          ? "2 שאיפות רצופות דרך האף + נשיפה ארוכה בפה"
                          : "4 שניות שאיפה, 4 החזקה, 4 נשיפה, 4 החזקה"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-wa-divider/40">
                  <button
                    type="button"
                    onClick={() => handleStartExercise(ex.id)}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                      isActive
                        ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                        : "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30",
                    )}
                  >
                    {isActive ? (
                      <>
                        <Square className="size-3 fill-current" />
                        <span>עצור תרגיל</span>
                      </>
                    ) : (
                      <>
                        <Play className="size-3 fill-current" />
                        <span>התחל תרגול מודרך</span>
                      </>
                    )}
                  </button>

                  {onAskNoa && (
                    <button
                      type="button"
                      onClick={() =>
                        onAskNoa(`נועה, בואי נעשה יחד את תרגיל ה${ex.title} להרגעת הלחץ מהסידור 🫁`)
                      }
                      className="text-[11px] text-wa-meta hover:text-wa-green transition-colors"
                    >
                      תרגל עם נועה בצ׳אט
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category filters & Search */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-2.5 size-3.5 text-wa-meta" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש במאגר (לדוג' פקקים, שליטה, CBT)..."
              className="w-full rounded-xl border border-wa-divider bg-wa-panel px-8 py-1.5 text-xs text-wa-bubble-text placeholder-wa-meta/70 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors shrink-0",
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-wa-panel text-wa-meta hover:bg-wa-hover",
              )}
            >
              הכל
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("stoicism")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors shrink-0",
                selectedCategory === "stoicism"
                  ? "bg-indigo-600 text-white"
                  : "bg-wa-panel text-wa-meta hover:bg-wa-hover",
              )}
            >
              🛡️ סטואיציזם
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("cbt")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors shrink-0",
                selectedCategory === "cbt"
                  ? "bg-indigo-600 text-white"
                  : "bg-wa-panel text-wa-meta hover:bg-wa-hover",
              )}
            >
              🧠 CBT
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("nvc")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors shrink-0",
                selectedCategory === "nvc"
                  ? "bg-indigo-600 text-white"
                  : "bg-wa-panel text-wa-meta hover:bg-wa-hover",
              )}
            >
              🤝 קבלנים (NVC)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("distortions")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors shrink-0",
                selectedCategory === "distortions"
                  ? "bg-indigo-600 text-white"
                  : "bg-wa-panel text-wa-meta hover:bg-wa-hover",
              )}
            >
              ⚖️ עיוותי חשיבה
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("sos")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors shrink-0",
                selectedCategory === "sos"
                  ? "bg-indigo-600 text-white"
                  : "bg-wa-panel text-wa-meta hover:bg-wa-hover",
              )}
            >
              🚨 פרוטוקול SOS
            </button>
          </div>
        </div>
      </div>

      {/* SOS Protocol View */}
      {(selectedCategory === "sos" || selectedCategory === "all") && (
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-wa-panel to-wa-panel p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                <AlertTriangle className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-200">{SOS_DISPATCH_PROTOCOL.title}</h4>
                <p className="text-[11px] text-wa-meta">{SOS_DISPATCH_PROTOCOL.subtitle}</p>
              </div>
            </div>
            {onAskNoa && (
              <button
                type="button"
                onClick={() =>
                  onAskNoa(
                    "נועה, יש עומס מטורף וטלפונים בלי סוף, אני מרגיש מוצף... תני לי פרוטוקול SOS מהיר 🚨",
                  )
                }
                className="flex items-center gap-1 rounded-lg bg-rose-500/20 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/30 transition-colors"
              >
                <MessageSquare className="size-3" />
                <span>הפעל SOS בצ׳אט</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {SOS_DISPATCH_PROTOCOL.steps.map((st) => (
              <div
                key={st.step}
                className="rounded-xl border border-rose-500/20 bg-wa-panel/80 p-3"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                  <span className="flex size-5 items-center justify-center rounded-full bg-rose-500/20 text-[10px]">
                    {st.step}
                  </span>
                  <span>{st.title}</span>
                </div>
                <p className="mt-1.5 text-[11px] text-wa-meta leading-relaxed">{st.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cognitive Distortions View */}
      {(selectedCategory === "distortions" || selectedCategory === "all") && (
        <div className="rounded-2xl border border-amber-500/30 bg-wa-panel-alt/60 p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-amber-400" />
              <h4 className="text-sm font-semibold">
                עיוותי חשיבה נפוצים בסידור עבודה ואיך נועה מפרקת אותם (CBT)
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COGNITIVE_DISTORTIONS.slice(0, 4).map((dist) => (
              <div
                key={dist.name}
                className="rounded-xl border border-wa-divider bg-wa-panel p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300">{dist.hebrewName}</span>
                  <span className="text-[10px] text-wa-meta font-mono">{dist.name}</span>
                </div>
                <div className="rounded-lg bg-rose-500/10 p-2 border border-rose-500/20 text-[11px] text-rose-200">
                  <span className="font-semibold block mb-0.5">המחשבה המלחיצה:</span>
                  &ldquo;{dist.dispatchExample}&rdquo;
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20 text-[11px] text-emerald-200">
                  <span className="font-semibold block mb-0.5">המסגור מחדש של נועה:</span>
                  {dist.noaReframing}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theoretical Frameworks */}
      {selectedCategory !== "distortions" && selectedCategory !== "sos" && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <Sparkles className="size-4 text-indigo-400" />
            <span>מודלים פסיכולוגיים מיושמים לניהול עומס</span>
          </h4>

          <div className="space-y-3">
            {filteredFrameworks.map((fw: PsychologicalFramework) => {
              const isExpanded = expandedFrameworkId === fw.id;
              return (
                <div
                  key={fw.id}
                  className="rounded-2xl border border-wa-divider bg-wa-panel transition-all overflow-hidden"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedFrameworkId(isExpanded ? null : fw.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpandedFrameworkId(isExpanded ? null : fw.id);
                      }
                    }}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-wa-hover/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{fw.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-wa-bubble-text">{fw.title}</h5>
                          <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                            {fw.categoryLabel}
                          </span>
                        </div>
                        <p className="text-xs text-wa-meta">{fw.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-wa-meta" />
                      ) : (
                        <ChevronDown className="size-4 text-wa-meta" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-wa-divider/60 bg-wa-panel-alt/40 p-4 space-y-4">
                      {/* Application in dispatch */}
                      <div className="rounded-xl bg-indigo-950/30 border border-indigo-500/20 p-3">
                        <span className="text-xs font-bold text-indigo-300 block mb-1">
                          🏗️ יישום מעשי בסידור ח. סבן:
                        </span>
                        <p className="text-xs text-wa-bubble-text leading-relaxed">
                          {fw.dispatchApplication}
                        </p>
                      </div>

                      {/* Core concepts */}
                      <div>
                        <span className="text-xs font-bold text-wa-meta block mb-1.5">
                          עקרונות ליבה:
                        </span>
                        <ul className="space-y-1 text-xs text-wa-bubble-text">
                          {fw.coreConcepts.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-indigo-400 mt-0.5">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actionable steps */}
                      <div>
                        <span className="text-xs font-bold text-wa-meta block mb-1.5">
                          צעדי פעולה מיידיים:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {fw.actionableSteps.map((st, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 rounded-lg bg-wa-panel p-2 border border-wa-divider/70 text-xs"
                            >
                              <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                              <span>{st}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mantra & Ask Noa */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-wa-divider/40">
                        <div className="text-xs font-semibold text-amber-300 italic">
                          &ldquo;{fw.mantra}&rdquo;
                        </div>

                        {onAskNoa && (
                          <button
                            type="button"
                            onClick={() =>
                              onAskNoa(
                                `נועה, בואי נדבר על ${fw.title} ואיך ליישם את זה עכשיו מול העומס בסידור 🛡️`,
                              )
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 px-3 py-1.5 text-xs font-medium transition-colors shrink-0"
                          >
                            <MessageSquare className="size-3.5" />
                            <span>שאל את נועה על מודל זה</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
