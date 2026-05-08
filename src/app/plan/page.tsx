"use client";

import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { PLAN_DAYS, PHASES } from "@/lib/mock-data";

const PHASE_COLORS: Record<string, string> = {
  Awareness: "var(--accent-recharge)",
  Tools: "var(--accent-nourish)",
  Integration: "var(--accent-move)",
};

const PHASE_TEXT: Record<string, string> = {
  Awareness: "#4a5568",
  Tools: "#2d5016",
  Integration: "#4a3728",
};

export default function PlanPage() {
  const router = useRouter();

  return (
    <Shell>
      <div className="px-5 pt-8 pb-4">
        <button
          onClick={() => router.push("/onboarding")}
          className="flex items-center gap-1 mb-6 text-sm font-medium"
          style={{ color: "var(--muted)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--green)" }}>
          Your Plan
        </p>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--foreground)" }}>
          Social Anxiety — 30 Days
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          "I want to feel less anxious in social situations"
        </p>

        {/* Phase cards — stagger fade in one by one */}
        <div className="flex flex-col gap-3 mb-8">
          {PHASES.map((phase, i) => (
            <div
              key={phase.name}
              className="rounded-2xl p-4 card-rise"
              style={{
                background: PHASE_COLORS[phase.name],
                animationDelay: `${i * 120}ms`,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold" style={{ color: PHASE_TEXT[phase.name] }}>
                  {phase.name}
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.4)", color: PHASE_TEXT[phase.name] }}
                >
                  {phase.days}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: PHASE_TEXT[phase.name], opacity: 0.85 }}>
                {phase.description}
              </p>
            </div>
          ))}
        </div>

        {/* Day list */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
          Day by day
        </p>

        {PHASES.map((phase) => (
          <div key={phase.name} className="mb-6">
            <div
              className="text-[11px] font-semibold uppercase tracking-widest mb-3 px-2 py-1 rounded-lg inline-block"
              style={{ background: PHASE_COLORS[phase.name], color: PHASE_TEXT[phase.name] }}
            >
              {phase.name} · {phase.days}
            </div>
            <div className="flex flex-col gap-2">
              {PLAN_DAYS.filter((d) => d.phase === phase.name).map((day) => (
                <div
                  key={day.day}
                  className="rounded-2xl px-4 py-3 flex items-start gap-3"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <span className="text-sm font-semibold mt-0.5 min-w-[28px]" style={{ color: "var(--green)" }}>
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
                          style={{ background: "var(--background)", color: "var(--muted)", border: "1px solid var(--border)" }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky CTA */}
      <div
        className="fixed bottom-[64px] left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-3 pt-2"
        style={{ background: "linear-gradient(to top, var(--background) 80%, transparent)" }}
      >
        <button
          onClick={() => router.push("/today")}
          className="w-full py-4 rounded-2xl text-base font-semibold"
          style={{ background: "var(--green)", color: "#ffffff" }}
        >
          Start my plan
        </button>
      </div>
    </Shell>
  );
}
