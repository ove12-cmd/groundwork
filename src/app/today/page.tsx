"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { HabitIconSvg } from "@/components/HabitIcon";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import {
  JOURNAL_PROMPT, WEEKLY_REVIEWS,
  type Habit,
} from "@/lib/mock-data";
import { useActivePlan } from "@/lib/useActivePlan";

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  breathing: "Breathing", journal: "Journal", reflection: "Reflection",
  movement: "Movement",   mindfulness: "Mindfulness",
};
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  breathing:   { bg: "var(--accent-recharge)", text: "#3a4a5e" },
  journal:     { bg: "var(--accent-dream)",    text: "#4a2a35" },
  reflection:  { bg: "var(--accent-move)",     text: "#4a3728" },
  mindfulness: { bg: "var(--accent-nourish)",  text: "#2d5016" },
  movement:    { bg: "var(--accent-move)",     text: "#4a3728" },
};

const TODAY_DATE = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

const RING_SIZE = 64;
const STROKE = 6;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const WEEK_DOTS = [true, true, true, false, true, false, false];
const MOOD_SPARKLINE = [{ v: 2 }, { v: 3 }, { v: 2 }, { v: 4 }, { v: 3 }, { v: 4 }, { v: 5 }];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Tracker card ──────────────────────────────────────────────────────────────

function TrackerCard({
  session, label, selected, logged, isActive, onSelect, onLog,
}: {
  session: "morning" | "evening";
  label: string;
  selected: number | null;
  logged: { value: number; time: string } | null;
  isActive: boolean;
  onSelect: (v: number) => void;
  onLog: () => void;
}) {
  const emoji = session === "morning" ? "☀️" : "🌙";
  const title = session === "morning" ? "Morning" : "Evening";

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "var(--card)", border: `1.5px solid ${isActive ? "#1C1C1E" : "var(--border)"}` }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{emoji}</span>
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{title}</span>
        </div>
        {isActive && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#1C1C1E", color: "#fff" }}>
            Now
          </span>
        )}
      </div>
      <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>{label}</p>

      {logged ? (
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              fontSize: 30, fontWeight: 700, color: "var(--foreground)",
            }}
          >
            {logged.value}
          </span>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="6" fill="#1C1C1E" />
              <polyline points="2.5 6 5 8.5 9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs" style={{ color: "var(--muted)" }}>Logged {logged.time}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between mb-3">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onSelect(n)}
                style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: selected === n ? "#1C1C1E" : "transparent",
                  color: selected === n ? "#fff" : "var(--muted)",
                  border: `1.5px solid ${selected === n ? "#1C1C1E" : "var(--border)"}`,
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onLog}
            disabled={selected === null}
            className="w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: selected !== null ? "#1C1C1E" : "var(--border)",
              color: selected !== null ? "#fff" : "var(--muted)",
              border: "none",
              cursor: selected !== null ? "pointer" : "not-allowed",
            }}
          >
            Log
          </button>
        </>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TodayPage() {
  const router = useRouter();
  const { plan, currentDay, todayData, trackingLabel, completionPct } = useActivePlan();

  // Task state
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [justChecked, setJustChecked] = useState<string | null>(null);
  const justCheckedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tracker state
  const [morningValue, setMorningValue] = useState<number | null>(null);
  const [eveningValue, setEveningValue] = useState<number | null>(null);
  const [morningLogged, setMorningLogged] = useState<{ value: number; time: string } | null>(null);
  const [eveningLogged, setEveningLogged] = useState<{ value: number; time: string } | null>(null);

  // Habits state
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLog, setHabitLog] = useState<Record<string, boolean>>({});

  // Weekly review banner
  const [showReviewBanner, setShowReviewBanner] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("groundwork-user-name");
      if (stored) setFirstName(stored.split(" ")[0]);
    } catch { /* ignore */ }

    const today = new Date().toISOString().split("T")[0];
    try {
      const m = localStorage.getItem(`groundwork-track-${today}-morning`);
      if (m) setMorningLogged(JSON.parse(m));
      const e = localStorage.getItem(`groundwork-track-${today}-evening`);
      if (e) setEveningLogged(JSON.parse(e));
    } catch { /* ignore */ }

    try {
      const h = localStorage.getItem("groundwork-habits");
      setHabits(h ? JSON.parse(h) : []);
      const log = localStorage.getItem(`groundwork-habit-log-${today}`);
      setHabitLog(log ? JSON.parse(log) : {});
    } catch { setHabits([]); }

    try {
      const latest = WEEKLY_REVIEWS[WEEKLY_REVIEWS.length - 1];
      if (latest) {
        const dismissed = localStorage.getItem(`groundwork-review-dismissed-${latest.id}`);
        setShowReviewBanner(!dismissed);
      }
    } catch { /* ignore */ }

    setHydrated(true);
  }, []);

  const total = todayData?.tasks.length ?? 0;
  const done = Object.values(checked).filter(Boolean).length;
  const progress = total > 0 ? (done / total) * 100 : 0;
  const totalDays = plan?.totalDays ?? 30;
  const hour = new Date().getHours();

  const toggle = (id: string) => {
    const nowChecked = !checked[id];
    setChecked((prev) => ({ ...prev, [id]: nowChecked }));
    if (nowChecked) {
      if (justCheckedTimer.current) clearTimeout(justCheckedTimer.current);
      setJustChecked(id);
      justCheckedTimer.current = setTimeout(() => setJustChecked(null), 400);
    }
  };

  const logTracker = (session: "morning" | "evening", value: number) => {
    const today = new Date().toISOString().split("T")[0];
    const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const entry = { value, time };
    try { localStorage.setItem(`groundwork-track-${today}-${session}`, JSON.stringify(entry)); } catch { /* ignore */ }
    if (session === "morning") { setMorningLogged(entry); setMorningValue(null); }
    else { setEveningLogged(entry); setEveningValue(null); }
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    const next = { ...habitLog, [id]: !habitLog[id] };
    setHabitLog(next);
    try { localStorage.setItem(`groundwork-habit-log-${today}`, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const dismissReviewBanner = () => {
    const latest = WEEKLY_REVIEWS[WEEKLY_REVIEWS.length - 1];
    if (latest) {
      try { localStorage.setItem(`groundwork-review-dismissed-${latest.id}`, "true"); } catch { /* ignore */ }
    }
    setShowReviewBanner(false);
  };

  const latestReview = WEEKLY_REVIEWS[WEEKLY_REVIEWS.length - 1];

  return (
    <Shell>
      <div className="px-5 pt-8 pb-4">

        {/* Weekly review banner */}
        {hydrated && showReviewBanner && latestReview && (
          <div
            className="rounded-2xl px-4 py-3 mb-5 flex items-center justify-between"
            style={{ background: "#1C1C1E", color: "#fff" }}
          >
            <div>
              <p className="text-xs font-semibold opacity-60 mb-0.5">Week {latestReview.weekNumber} review is ready</p>
              <button
                type="button"
                onClick={() => router.push("/weekly-review")}
                className="text-sm font-semibold"
                style={{ color: "#fff", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Read it →
              </button>
            </div>
            <button
              type="button"
              onClick={dismissReviewBanner}
              style={{ color: "rgba(255,255,255,0.5)", background: "none", border: "none", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Date + day counter */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>{TODAY_DATE}</p>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "var(--card)", color: "var(--green)", border: "1px solid var(--border)" }}
          >
            Day {currentDay} of {totalDays}
          </span>
        </div>

        <h1 className="text-2xl font-semibold mb-1 mt-2" style={{ color: "var(--foreground)" }}>
          {greeting()}{firstName ? ` ${firstName}.` : ""}
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          Small steps, taken consistently, change everything.
        </p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2" style={{ color: "var(--muted)" }}>
            <span>Today's progress</span>
            <span>{done}/{total} done</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: "var(--green)", transition: "width 0.5s cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
          </div>
        </div>

        {/* Progress snapshot */}
        <button
          type="button"
          onClick={() => router.push("/metrics")}
          className="w-full rounded-2xl px-4 py-3 mb-5 text-left"
          style={{ background: "var(--card)", border: "1px solid var(--border)", cursor: "pointer" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>Progress</span>
            <span className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>View all →</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
                <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} fill="none" stroke="#1C1C1E" strokeWidth={STROKE}
                  strokeLinecap="round" strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE - (completionPct / 100) * CIRCUMFERENCE} />
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
                  style={{ transform: "rotate(90deg)", transformOrigin: "center", fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: 14, fontWeight: 700, fill: "var(--foreground)" }}>
                  {completionPct}%
                </text>
              </svg>
              <span className="text-[10px]" style={{ color: "var(--muted)" }}>Plan</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="flex gap-1">
                {WEEK_DOTS.map((d, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: d ? "#1C1C1E" : "transparent", border: `1.5px solid ${d ? "#1C1C1E" : "var(--border)"}` }} />
                ))}
              </div>
              <span className="text-[10px]" style={{ color: "var(--muted)" }}>This week</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5">
              <ResponsiveContainer width="100%" height={36}>
                <LineChart data={MOOD_SPARKLINE} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <Line type="monotone" dataKey="v" stroke="#1C1C1E" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
              <span className="text-[10px]" style={{ color: "var(--muted)" }}>Mood</span>
            </div>
          </div>
        </button>

        {/* Tracker cards */}
        <div className="flex flex-col gap-3 mb-5">
          <TrackerCard
            session="morning" label={trackingLabel}
            selected={morningValue} logged={morningLogged}
            isActive={hour < 13}
            onSelect={setMorningValue}
            onLog={() => morningValue !== null && logTracker("morning", morningValue)}
          />
          <TrackerCard
            session="evening" label={trackingLabel}
            selected={eveningValue} logged={eveningLogged}
            isActive={hour >= 17}
            onSelect={setEveningValue}
            onLog={() => eveningValue !== null && logTracker("evening", eveningValue)}
          />
        </div>

        {/* Tasks section */}
        <div className="rounded-2xl p-4 mb-5" style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              My Today's Tasks
            </p>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--foreground)", opacity: 0.7 }}>
            You've got this. {total} {total === 1 ? "task" : "tasks"} today.
          </p>

          {!todayData ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="skeleton rounded-xl h-16" />
              ))}
            </div>
          ) : done === total && total > 0 ? (
            <div className="py-4 flex flex-col items-center text-center gap-2">
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", color: "var(--foreground)" }}>
                All done for today 🎉
              </p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>Check in with your journal before you go.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(todayData?.tasks ?? []).map((task) => {
                const isChecked = !!checked[task.id];
                const colors = TYPE_COLORS[task.type];
                const wasJustChecked = justChecked === task.id;
                return (
                  <div key={task.id} className="rounded-xl px-4 py-4"
                    style={{ background: "var(--background)", border: "1px solid var(--border)", borderLeft: "3px solid #1C1C1E",
                      opacity: isChecked ? 0.5 : 1, transform: isChecked ? "translateX(4px)" : "translateX(0)",
                      transition: "opacity 0.3s ease, transform 0.3s ease" }}>
                    <div className="flex items-start gap-3">
                      <button type="button" onClick={() => toggle(task.id)}
                        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: isChecked ? "#1C1C1E" : "var(--border)", background: isChecked ? "#1C1C1E" : "transparent" }}>
                        {isChecked && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className={wasJustChecked ? "check-pop" : ""}>
                            <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <button type="button" className="flex-1 text-left" onClick={() => router.push(`/task/${task.id}`)}>
                        <p className="text-sm font-semibold mb-1"
                          style={{ color: "var(--foreground)", textDecoration: isChecked ? "line-through" : "none", transition: "text-decoration 0.15s ease" }}>
                          {task.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: colors.bg, color: colors.text }}>
                            {TYPE_LABELS[task.type]}
                          </span>
                          <span className="text-[11px]" style={{ color: "var(--muted)" }}>{task.duration}</span>
                        </div>
                      </button>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--border)", marginTop: 2 }}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily habits */}
        <div className="rounded-2xl p-4 mb-5" style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}>
          <p className="text-[13px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            Daily habits
          </p>

          {!hydrated || habits.length === 0 ? (
            <p className="text-sm py-1 mb-3" style={{ color: "var(--muted)" }}>
              No habits yet.{" "}
              <button type="button" onClick={() => router.push("/habits")}
                style={{ color: "var(--foreground)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                Add some →
              </button>
            </p>
          ) : (
            <div className="flex flex-col gap-3 mb-3">
              {habits.map((habit) => {
                const isDone = !!habitLog[habit.id];
                return (
                  <div key={habit.id} className="flex items-center gap-3"
                    style={{ opacity: isDone ? 0.5 : 1, transition: "opacity 0.2s ease" }}>
                    <button type="button" onClick={() => toggleHabit(habit.id)}
                      className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: isDone ? "#1C1C1E" : "var(--border)", background: isDone ? "#1C1C1E" : "transparent" }}>
                      {isDone && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span className="flex items-center justify-center" style={{ color: "var(--muted)" }}>
                      <HabitIconSvg icon={habit.icon} size={15} />
                    </span>
                    <span className="flex-1 text-sm font-medium"
                      style={{ color: "var(--foreground)", textDecoration: isDone ? "line-through" : "none" }}>
                      {habit.name}
                    </span>
                    {habit.streak > 0 && (
                      <span className="text-[10px]" style={{ color: "var(--muted)" }}>🔥 {habit.streak}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button type="button" onClick={() => router.push("/habits")}
            className="flex items-center gap-1 text-xs font-medium mt-1"
            style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add habit
          </button>
        </div>

        {/* Journal card */}
        <div className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
            End-of-day journal
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--foreground)" }}>
            "{JOURNAL_PROMPT}"
          </p>
          <button type="button" onClick={() => router.push("/checkin")}
            className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--green)", color: "#ffffff" }}>
            Open journal
          </button>
        </div>

      </div>
    </Shell>
  );
}
