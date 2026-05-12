"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Day } from "@/lib/mock-data";

const PHASE_COLORS: Record<string, string> = {
  Awareness:   "var(--accent-recharge)",
  Tools:       "var(--accent-nourish)",
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

function PlanDaysContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");

  const [weekIndex, setWeekIndex] = useState(0);
  const [weeks, setWeeks] = useState<Day[][]>([]);
  const [planName, setPlanName] = useState("Day by day");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }

      const q = supabase
        .from("plans")
        .select("id, name, focus_area, plan_days")
        .eq("user_id", user.id);

      if (planId) q.eq("id", planId);
      else q.eq("is_active", true);

      q.limit(1).maybeSingle().then(({ data }) => {
        if (data?.plan_days?.length) {
          setWeeks(chunkWeeks(data.plan_days as Day[], WEEK_SIZE));
          setPlanName(data.name ?? data.focus_area ?? "Day by day");
        }
        setLoading(false);
      });
    });
  }, [planId]);

  const TOTAL_WEEKS = weeks.length;
  const isFirstWeek = weekIndex === 0;
  const isLastWeek = weekIndex === TOTAL_WEEKS - 1;
  const weekDays = weeks[weekIndex] ?? [];

  return (
    <div className="flex justify-center" style={{ background: "var(--background)", height: "100dvh" }}>
      <div className="w-full max-w-[390px] flex flex-col" style={{ height: "100%" }}>

        {/* Header */}
        <div className="flex-none px-5 pt-8 pb-2">
          <button type="button" onClick={() => router.push("/plan")}
            className="flex items-center gap-1 mb-6 text-sm font-medium"
            style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Plan overview
          </button>

          <div className="flex items-end justify-between mb-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              {planName}
            </p>
            {TOTAL_WEEKS > 0 && (
              <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                Week {weekIndex + 1} of {TOTAL_WEEKS}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>
            {TOTAL_WEEKS > 0 ? `Week ${weekIndex + 1}` : "Your plan"}
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {loading ? (
            <div className="px-5 pt-4 flex flex-col gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton rounded-2xl h-16" />
              ))}
            </div>
          ) : weeks.length === 0 ? (
            <div className="px-5 pt-8 flex flex-col items-center text-center gap-3">
              <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>No plan days yet</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>Complete onboarding to generate your personalised plan.</p>
              <button type="button" onClick={() => router.push("/onboarding")}
                className="mt-2 px-5 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: "#1C1C1E", color: "#fff", border: "none", cursor: "pointer" }}>
                Start onboarding
              </button>
            </div>
          ) : (
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
                  <div className="flex flex-col gap-2 mb-6">
                    {weekDays.map((day) => {
                      const phase = day.phase ?? "Awareness";
                      return (
                        <div key={day.day} className="rounded-2xl px-4 py-3 flex items-start gap-3"
                          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                          <span className="text-sm font-bold mt-0.5 min-w-[28px]" style={{ color: "var(--green)" }}>
                            {day.day}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                              {day.theme}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {day.tasks.map((t) => (
                                <span key={t.id ?? t.name}
                                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                                  style={{
                                    background: PHASE_COLORS[phase] ?? "var(--accent-recharge)",
                                    color: PHASE_TEXT[phase] ?? "#3a4a5e",
                                  }}>
                                  {t.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: PHASE_COLORS[phase] ?? "var(--accent-recharge)" }} />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    {!isFirstWeek && (
                      <button type="button" onClick={() => setWeekIndex(i => i - 1)}
                        className="flex-1 py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1.5"
                        style={{ background: "transparent", color: "var(--foreground)", border: "1.5px solid var(--border)", cursor: "pointer" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Week {weekIndex}
                      </button>
                    )}
                    <button type="button"
                      onClick={() => isLastWeek ? router.push("/today") : setWeekIndex(i => i + 1)}
                      className="flex-1 py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1.5"
                      style={{ background: "#1C1C1E", color: "#ffffff", border: "none", cursor: "pointer" }}>
                      {isLastWeek ? "Done" : `Week ${weekIndex + 2}`}
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
          )}
        </div>

        <div className="flex-none" style={{ height: 72 }} />
      </div>
    </div>
  );
}

export default function PlanDaysPage() {
  return (
    <Suspense>
      <PlanDaysContent />
    </Suspense>
  );
}
