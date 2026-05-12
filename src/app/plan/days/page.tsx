"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PLAN_DAYS, AI_PLAN_KEY, type AIPlan } from "@/lib/mock-data";

const PHASE_COLORS: Record<string, string> = {
  Awareness: "var(--accent-recharge)",
  Tools:     "var(--accent-nourish)",
  Integration: "var(--accent-move)",
};
const PHASE_TEXT: Record<string, string> = {
  Awareness:   "#3a4a5e",
  Tools:       "#2d5016",
  Integration: "#4a3728",
};

const WEEK_SIZE = 7;

function chunkWeeks<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function PlanDaysPage() {
  const router = useRouter();
  const [weekIndex, setWeekIndex] = useState(0);
  const [weeks, setWeeks] = useState(() => chunkWeeks(PLAN_DAYS, WEEK_SIZE));
  const [aiPlan, setAiPlan] = useState<AIPlan | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AI_PLAN_KEY);
      if (raw) {
        const plan: AIPlan = JSON.parse(raw);
        setAiPlan(plan);
        if (plan.days?.length) setWeeks(chunkWeeks(plan.days, WEEK_SIZE));
      }
    } catch { /* fall back to mock */ }
  }, []);

  const TOTAL_WEEKS = weeks.length;

  const isFirstWeek = weekIndex === 0;
  const isLastWeek = weekIndex === TOTAL_WEEKS - 1;
  const weekDays = weeks[weekIndex];

  const handleNext = () => {
    if (isLastWeek) {
      router.push("/today");
    } else {
      setWeekIndex((i) => i + 1);
    }
  };

  return (
    <div
      className="flex justify-center"
      style={{ background: "var(--background)", height: "100dvh" }}
    >
      <div className="w-full max-w-[390px] flex flex-col" style={{ height: "100%" }}>

        {/* Static header — never animates */}
        <div className="flex-none px-5 pt-8 pb-2">
          <button
            type="button"
            onClick={() => router.push("/plan")}
            className="flex items-center gap-1 mb-6 text-sm font-medium"
            style={{ color: "var(--muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Plan overview
          </button>

          <div className="flex items-end justify-between mb-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              {aiPlan?.planName ?? "Day by day"}
            </p>
            <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
              Week {weekIndex + 1} of {TOTAL_WEEKS}
            </span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>
            Week {weekIndex + 1}
          </h1>
        </div>

        {/* Animated slide area — overflow-hidden clips the entering/exiting panels */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={weekIndex}
              initial={{ x: "60%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-30%", opacity: 0 }}
              transition={{ type: "tween", ease: [0.32, 0, 0.18, 1], duration: 0.3 }}
              style={{ position: "absolute", inset: 0, overflowY: "auto" }}
            >
              <div className="px-5 pt-4 pb-6">

                {/* Day cards */}
                <div className="flex flex-col gap-2 mb-6">
                  {weekDays.map((day) => (
                    <div
                      key={day.day}
                      className="rounded-2xl px-4 py-3 flex items-start gap-3"
                      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                    >
                      <span
                        className="text-sm font-bold mt-0.5 min-w-[28px]"
                        style={{ color: "var(--green)" }}
                      >
                        {day.day}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                          {day.theme}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {day.tasks.map((t) => (
                            <span
                              key={t.id}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                              style={{
                                background: PHASE_COLORS[day.phase],
                                color: PHASE_TEXT[day.phase],
                              }}
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: PHASE_COLORS[day.phase] }}
                      />
                    </div>
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-2">
                  {!isFirstWeek && (
                    <button
                      type="button"
                      onClick={() => setWeekIndex((i) => i - 1)}
                      className="flex-1 py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1.5"
                      style={{ background: "transparent", color: "var(--foreground)", border: "1.5px solid var(--border)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      Previous: Week {weekIndex}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1.5"
                    style={{ background: "#1C1C1E", color: "#ffffff", border: "none" }}
                  >
                    {isLastWeek ? "Done" : `Next: Week ${weekIndex + 2}`}
                    {!isLastWeek && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </button>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav spacer */}
        <div className="flex-none" style={{ height: 72 }} />
      </div>
    </div>
  );
}
