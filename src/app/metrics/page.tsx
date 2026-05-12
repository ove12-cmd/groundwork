"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { HabitIconSvg } from "@/components/HabitIcon";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { type Habit } from "@/lib/mock-data";
import { useActivePlan } from "@/lib/useActivePlan";

interface TrackingEntry { date: string; morning: number | null; evening: number | null; }

const RING_SIZE = 160;
const STROKE = 12;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type TimeRange = "14d" | "1m" | "3m" | "all";

const RANGE_LABELS: Record<TimeRange, string> = { "14d": "14 days", "1m": "1 month", "3m": "3 months", all: "All" };
const RANGE_SLICE: Record<TimeRange, number> = { "14d": 14, "1m": 30, "3m": 90, all: 90 };
const RANGE_TICK: Record<TimeRange, number> = { "14d": 2, "1m": 5, "3m": 15, all: 15 };

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// ── Tooltips ──────────────────────────────────────────────────────────────────

function TrackingTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "6px 12px", fontSize: 12 }}>
      <p style={{ color: "var(--muted)", marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 2 }}>
          {p.name === "morning" ? "☀️" : "🌙"} {p.value}/10
        </p>
      ))}
    </div>
  );
}

// ── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({ pct, totalDays }: { pct: number; totalDays: number }) {
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} fill="none" stroke="#1C1C1E" strokeWidth={STROKE}
          strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }} />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          style={{ transform: "rotate(90deg)", transformOrigin: "center",
            fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: 36, fontWeight: 700, fill: "var(--foreground)" }}>
          {pct}%
        </text>
      </svg>
      <p className="text-sm" style={{ color: "var(--muted)" }}>of {totalDays} days completed</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MetricsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>("1m");
  const { plan, completionPct } = useActivePlan();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitGrid, setHabitGrid] = useState<Record<string, boolean[]>>({});
  const [trackingData, setTrackingData] = useState<TrackingEntry[]>([]);
  const [weekDays, setWeekDays] = useState<{ label: string; done: boolean }[]>([]);

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Load 90-day tracking history from localStorage
    const entries: TrackingEntry[] = [];
    const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];
    const week: { label: string; done: boolean }[] = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      try {
        const mr = localStorage.getItem(`groundwork-track-${dateStr}-morning`);
        const er = localStorage.getItem(`groundwork-track-${dateStr}-evening`);
        const morning = mr ? JSON.parse(mr).value : null;
        const evening = er ? JSON.parse(er).value : null;
        if (morning !== null || evening !== null) entries.push({ date: dateStr, morning, evening });
        if (i < 7) week.push({ label: DAY_NAMES[d.getDay()], done: !!(morning || evening) });
      } catch { if (i < 7) week.push({ label: DAY_NAMES[d.getDay()], done: false }); }
    }
    setTrackingData(entries);
    setWeekDays(week);

    // Load habits + 7-day completion grid
    const raw = localStorage.getItem("groundwork-habits");
    const loadedHabits: Habit[] = raw ? JSON.parse(raw) : [];
    setHabits(loadedHabits);
    const grid: Record<string, boolean[]> = {};
    for (const habit of loadedHabits) {
      grid[habit.id] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        try {
          const log = localStorage.getItem(`groundwork-habit-log-${dateStr}`);
          const dayLog: Record<string, boolean> = log ? JSON.parse(log) : {};
          grid[habit.id].push(!!dayLog[habit.id]);
        } catch { grid[habit.id].push(false); }
      }
    }
    setHabitGrid(grid);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntry = trackingData.find(d => d.date === todayStr);

  const sliceCount = RANGE_SLICE[timeRange];
  const sliced = trackingData.slice(-sliceCount);
  const tickInterval = RANGE_TICK[timeRange];

  const chartData = sliced.map((d) => ({
    label: d.date.slice(5).replace("-", "/"),
    ...(d.morning !== null && { morning: d.morning }),
    ...(d.evening !== null && { evening: d.evening }),
  }));

  const morningEntries = sliced.filter(d => d.morning !== null);
  const eveningEntries = sliced.filter(d => d.evening !== null);
  const avgMorning = morningEntries.length > 0
    ? (morningEntries.reduce((s, d) => s + d.morning!, 0) / morningEntries.length).toFixed(1)
    : "—";
  const avgEvening = eveningEntries.length > 0
    ? (eveningEntries.reduce((s, d) => s + d.evening!, 0) / eveningEntries.length).toFixed(1)
    : "—";

  const milestones = [
    { label: "First day completed",   achieved: (plan?.completedDays ?? 0) >= 1 },
    { label: "3-day streak",          achieved: (plan?.completedDays ?? 0) >= 3 },
    { label: "7-day streak",          achieved: (plan?.completedDays ?? 0) >= 7 },
    { label: "Halfway through plan",  achieved: completionPct >= 50 },
    { label: `Complete all ${plan?.totalDays ?? 30} days`, achieved: completionPct >= 100 },
  ];

  return (
    <Shell>
      <div className="px-5 pt-8 pb-6">

        {/* Header + this week button */}
        <div className="flex items-start justify-between mb-1">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Your progress
          </p>
          <button
            type="button"
            onClick={() => router.push("/weekly-review")}
            className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"
            style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            This week
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <h1 className="text-2xl font-semibold mb-6"
          style={{ color: "var(--foreground)", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          Metrics
        </h1>

        {/* Tracking summary card */}
        <div className="rounded-2xl p-4 mb-6 grid grid-cols-4 gap-3"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {[
            { label: "Today ☀️", value: todayEntry?.morning ?? "—" },
            { label: "Today 🌙", value: todayEntry?.evening ?? "—" },
            { label: `Avg ☀️ (${RANGE_LABELS[timeRange]})`, value: avgMorning },
            { label: `Avg 🌙 (${RANGE_LABELS[timeRange]})`, value: avgEvening },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center gap-1">
              <p className="text-xl font-bold" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", color: "var(--foreground)" }}>
                {s.value}
              </p>
              <p className="text-[9px] leading-tight" style={{ color: "var(--muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress ring */}
        <div className="rounded-2xl p-6 mb-6 flex justify-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <ProgressRing pct={completionPct} totalDays={plan?.totalDays ?? 30} />
        </div>

        {/* 7-day streak */}
        <div className="rounded-2xl px-4 py-4 mb-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
            This week
          </p>
          {weekDays.every(d => !d.done) && (
            <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Log your morning or evening level to track your week.</p>
          )}
          <div className="flex justify-between">
            {weekDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: d.done ? "#1C1C1E" : "transparent",
                  border: `2px solid ${d.done ? "#1C1C1E" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {d.done && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily tracking chart */}
        <div className="rounded-2xl px-4 pt-4 pb-3 mb-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              Daily tracking
            </p>
            {/* Range selector */}
            <div className="flex gap-1">
              {(Object.keys(RANGE_LABELS) as TimeRange[]).map((r) => (
                <button key={r} type="button" onClick={() => setTimeRange(r)}
                  className="text-[10px] font-semibold px-2 py-1 rounded-full"
                  style={{ background: timeRange === r ? "#1C1C1E" : "transparent",
                    color: timeRange === r ? "#fff" : "var(--muted)", border: "none", cursor: "pointer" }}>
                  {RANGE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
                Your tracking data will appear here once you start logging your daily levels.
              </p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -28 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false}
                    interval={tickInterval - 1} />
                  <YAxis domain={[1, 10]} ticks={[1, 5, 10]} tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<TrackingTooltip />} />
                  <Line type="monotone" dataKey="morning" name="morning" stroke="#1C1C1E" strokeWidth={2} dot={false}
                    activeDot={{ r: 4, fill: "#1C1C1E", strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="evening" name="evening" stroke="#888" strokeWidth={2}
                    strokeDasharray="4 2" dot={false} activeDot={{ r: 4, fill: "#888", strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-1">
                {[{ color: "#1C1C1E", label: "Morning", dashed: false }, { color: "#888", label: "Evening", dashed: true }].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div style={{ width: 16, height: 2, background: l.color, borderRadius: 1,
                      backgroundImage: l.dashed ? `repeating-linear-gradient(90deg, ${l.color} 0 4px, transparent 4px 6px)` : undefined }} />
                    <span className="text-[10px]" style={{ color: "var(--muted)" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>


        {/* Habits 7-day grid */}
        <div className="rounded-2xl px-4 py-4 mb-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
            Habit consistency
          </p>
          {habits.length === 0 ? (
            <p className="text-sm py-1" style={{ color: "var(--muted)" }}>
              No habits tracked yet.{" "}
              <button type="button" onClick={() => router.push("/habits")}
                style={{ color: "var(--foreground)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                Add some →
              </button>
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {habits.map((habit) => {
                const grid = habitGrid[habit.id] ?? Array(7).fill(false);
                const completed = grid.filter(Boolean).length;
                const rate = Math.round((completed / 7) * 100);
                return (
                  <div key={habit.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span style={{ color: "var(--muted)" }}><HabitIconSvg icon={habit.icon} size={14} /></span>
                        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{habit.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {habit.streak > 0 && (
                          <span className="text-[10px]" style={{ color: "var(--muted)" }}>🔥 {habit.streak}</span>
                        )}
                        <span className="text-[10px] font-semibold" style={{ color: "var(--muted)" }}>{rate}%</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {grid.map((done, i) => (
                        <div key={i} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                          <div style={{ height: 20, borderRadius: 4,
                            background: done ? "#1C1C1E" : "var(--border)", width: "100%" }} />
                          <span className="text-[9px]" style={{ color: "var(--muted)" }}>{DAY_LABELS[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Milestones */}
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
          Milestones
        </p>
        <div className="flex flex-col gap-2 mb-6">
          {milestones.map((m) => (
            <div key={m.label} className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: "var(--card)", border: "1px solid var(--border)", opacity: m.achieved ? 1 : 0.45 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%",
                background: m.achieved ? "#1C1C1E" : "transparent",
                border: `2px solid ${m.achieved ? "#1C1C1E" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {m.achieved ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="11" width="14" height="11" rx="2" /><path d="M12 7a4 4 0 0 0-4 4" /><path d="M12 7a4 4 0 0 1 4 4" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Weekly reviews */}
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
          Weekly reviews
        </p>
        <div className="rounded-2xl px-4 py-5 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Your weekly reviews will appear here after your first week.</p>
        </div>

      </div>
    </Shell>
  );
}
