"use client";

import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { WEEKLY_REVIEWS, type WeeklyReview } from "@/lib/mock-data";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function WeeklyReviewPage() {
  const router = useRouter();
  const review: WeeklyReview = WEEKLY_REVIEWS[WEEKLY_REVIEWS.length - 1];

  const moodData = review.moodArc.map((v, i) => ({ day: DAY_LABELS[i], v }));
  const arcData = review.morningArc.map((v, i) => ({
    day: DAY_LABELS[i],
    m: v,
    e: review.eveningArc[i],
  }));

  return (
    <div className="flex justify-center min-h-screen" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-[390px] min-h-screen">
        <div className="px-5 pt-8 pb-10">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-7">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1.5"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--muted)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            <span
              className="rounded-full px-3 py-1 text-sm font-bold"
              style={{ background: "#1C1C1E", color: "#fff" }}
            >
              {review.overallScore}
            </span>
          </div>

          {/* Header */}
          <div className="mb-6">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: "var(--muted)" }}
            >
              Week {review.weekNumber}
            </p>
            <h1
              className="text-2xl font-bold"
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                color: "var(--foreground)",
              }}
            >
              Week {review.weekNumber} · {review.dateRange}
            </h1>
          </div>

          {/* Opening paragraph card */}
          <div
            className="rounded-2xl p-5 mb-5"
            style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--muted)" }}
            >
              AI summary
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
              {review.opening}
            </p>
          </div>

          {/* Key stats row */}
          <div
            className="rounded-2xl p-4 mb-5"
            style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}
          >
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                    color: "var(--foreground)",
                  }}
                >
                  {review.tasksCompleted}
                </span>
                <span className="text-[10px] text-center" style={{ color: "var(--muted)" }}>Tasks</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                    color: "var(--foreground)",
                  }}
                >
                  {review.habitStreak}🔥
                </span>
                <span className="text-[10px] text-center" style={{ color: "var(--muted)" }}>Streak</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                    color: "var(--foreground)",
                  }}
                >
                  {review.avgMorning}
                </span>
                <span className="text-[10px] text-center" style={{ color: "var(--muted)" }}>Morning</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                    color: "var(--foreground)",
                  }}
                >
                  {review.avgEvening}
                </span>
                <span className="text-[10px] text-center" style={{ color: "var(--muted)" }}>Evening</span>
              </div>
            </div>
          </div>

          {/* What you worked on */}
          <div className="mb-5">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--muted)" }}
            >
              What you worked on
            </p>
            <div className="flex flex-wrap gap-2">
              {review.taskTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: "var(--card)",
                    border: "1.5px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Mood arc chart */}
          <div
            className="rounded-2xl px-4 pt-4 pb-2 mb-5"
            style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--muted)" }}
            >
              Mood arc
            </p>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={moodData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted)" }}
                />
                <YAxis hide />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#1C1C1E"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Morning vs Evening chart */}
          <div
            className="rounded-2xl px-4 pt-4 pb-2 mb-5"
            style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--muted)" }}
            >
              Morning vs Evening
            </p>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={arcData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted)" }}
                />
                <YAxis hide />
                <Line
                  type="monotone"
                  dataKey="m"
                  stroke="#1C1C1E"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="e"
                  stroke="#888"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#1C1C1E",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span className="text-[10px]" style={{ color: "var(--muted)" }}>Morning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#888",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span className="text-[10px]" style={{ color: "var(--muted)" }}>Evening</span>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-5">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--muted)" }}
            >
              Highlights
            </p>
            {review.highlights.map((highlight, i) => (
              <div
                key={i}
                className="rounded-2xl px-4 py-3 mb-2 flex items-start gap-3"
                style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}
              >
                <span
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#1C1C1E",
                    marginTop: 1,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-sm leading-snug" style={{ color: "var(--foreground)" }}>
                  {highlight}
                </p>
              </div>
            ))}
          </div>

          {/* Focus next week */}
          <div
            className="rounded-2xl p-4 mb-5"
            style={{ background: "var(--accent-recharge)", border: "1.5px solid var(--border)" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--muted)" }}
            >
              Focus for next week
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
              {review.focusNext}
            </p>
          </div>

          {/* Share progress button */}
          <button
            type="button"
            onClick={() => {}}
            className="w-full py-4 rounded-2xl text-base font-semibold"
            style={{
              border: "1.5px solid var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
              cursor: "pointer",
            }}
          >
            Share progress →
          </button>

        </div>
      </div>
    </div>
  );
}
