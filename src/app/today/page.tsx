"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { PLAN_DAYS, TODAY_DAY, JOURNAL_PROMPT } from "@/lib/mock-data";

const TYPE_LABELS: Record<string, string> = {
  breathing: "Breathing",
  journal: "Journal",
  reflection: "Reflection",
  movement: "Movement",
  mindfulness: "Mindfulness",
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  breathing:    { bg: "var(--accent-recharge)", text: "#3a4a5e" },
  journal:      { bg: "var(--accent-dream)",    text: "#4a2a35" },
  reflection:   { bg: "var(--accent-move)",     text: "#4a3728" },
  mindfulness:  { bg: "var(--accent-nourish)",  text: "#2d5016" },
  movement:     { bg: "var(--accent-move)",     text: "#4a3728" },
};

const TODAY_DATE = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default function TodayPage() {
  const router = useRouter();
  const todayData = PLAN_DAYS.find((d) => d.day === TODAY_DAY)!;
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  // track which task was just checked for the check-pop animation
  const [justChecked, setJustChecked] = useState<string | null>(null);
  const justCheckedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = todayData.tasks.length;
  const done = Object.values(checked).filter(Boolean).length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  const toggle = (id: string) => {
    const nowChecked = !checked[id];
    setChecked((prev) => ({ ...prev, [id]: nowChecked }));
    if (nowChecked) {
      if (justCheckedTimer.current) clearTimeout(justCheckedTimer.current);
      setJustChecked(id);
      justCheckedTimer.current = setTimeout(() => setJustChecked(null), 400);
    }
  };

  return (
    <Shell>
      <div className="px-5 pt-8 pb-4">
        {/* Date + day counter */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
            {TODAY_DATE}
          </p>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "var(--card)", color: "var(--green)", border: "1px solid var(--border)" }}
          >
            Day {TODAY_DAY} of 30
          </span>
        </div>

        <h1 className="text-2xl font-semibold mb-1 mt-2" style={{ color: "var(--foreground)" }}>
          Good morning.
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          Small steps, taken consistently, change everything.
        </p>

        {/* Progress bar — CSS transition smoothly animates width */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2" style={{ color: "var(--muted)" }}>
            <span>Today's progress</span>
            <span>{done}/{total} done</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "var(--green)",
                transition: "width 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
        </div>

        {/* Theme card */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: "var(--accent-recharge)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#3a4a5e" }}>
            Today's theme
          </p>
          <p className="text-lg font-semibold" style={{ color: "#1a2a3a" }}>
            {todayData.theme}
          </p>
        </div>

        {/* Task checklist */}
        <p className="text-[13px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
          Tasks
        </p>
        <div className="flex flex-col gap-3 mb-6">
          {todayData.tasks.map((task) => {
            const isChecked = !!checked[task.id];
            const colors = TYPE_COLORS[task.type];
            const wasJustChecked = justChecked === task.id;
            return (
              <div
                key={task.id}
                className="rounded-2xl px-4 py-4"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  opacity: isChecked ? 0.55 : 1,
                  transform: isChecked ? "translateX(4px)" : "translateX(0)",
                  transition: "opacity 0.3s ease, transform 0.3s ease",
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox with check-pop animation */}
                  <button
                    type="button"
                    onClick={() => toggle(task.id)}
                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: isChecked ? "var(--green)" : "var(--border)",
                      background: isChecked ? "var(--green)" : "transparent",
                      transition: "background 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    {isChecked && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                        className={wasJustChecked ? "check-pop" : ""}
                      >
                        <polyline
                          points="2 6 5 9 10 3"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => router.push(`/task/${task.id}`)}
                  >
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{
                        color: "var(--foreground)",
                        textDecoration: isChecked ? "line-through" : "none",
                        transition: "text-decoration 0.15s ease",
                      }}
                    >
                      {task.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {TYPE_LABELS[task.type]}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                        {task.duration}
                      </span>
                    </div>
                  </button>

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "var(--border)", marginTop: 2 }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Journal card */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
            End-of-day journal
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--foreground)" }}>
            "{JOURNAL_PROMPT}"
          </p>
          <button
            type="button"
            onClick={() => router.push("/checkin")}
            className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--green)", color: "#ffffff" }}
          >
            Open journal
          </button>
        </div>
      </div>
    </Shell>
  );
}
