"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FocusArea } from "@/lib/mock-data";

const FOCUS_AREAS: FocusArea[] = [
  "Social Anxiety",
  "Depression",
  "Anxiety",
  "Anger",
  "Confidence",
  "Self-esteem",
];

const DURATIONS = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex justify-center"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-[390px] flex flex-col items-center justify-center gap-6 loading-fade-in">
        <div
          className="w-16 h-16 rounded-[20px] flex items-center justify-center"
          style={{ background: "var(--accent-nourish)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2d5016" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22V12" />
            <path d="M12 12C12 12 7 10 5 6c3-1 8 1 7 6z" />
            <path d="M12 12C12 12 17 10 19 6c-3-1-8 1-7 6z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>
            Building your plan…
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Personalizing your journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="loading-dot" style={{ animationDelay: "0ms" }} />
          <span className="loading-dot" style={{ animationDelay: "200ms" }} />
          <span className="loading-dot" style={{ animationDelay: "400ms" }} />
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [focus, setFocus] = useState<FocusArea | null>(null);
  const [lastSelected, setLastSelected] = useState<FocusArea | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const [loading, setLoading] = useState(false);

  const canSubmit = goal.trim().length > 0 && focus !== null;

  const handleSelectFocus = (area: FocusArea) => {
    const next = focus === area ? null : area;
    setFocus(next);
    if (next !== null) setLastSelected(next);
  };

  const handleBuildPlan = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => router.push("/plan"), 2000);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex justify-center min-h-screen" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-[390px] min-h-screen flex flex-col px-6 pt-16 pb-10">

        {/* Greeting */}
        <div className="mb-10">
          <p className="text-sm font-medium mb-2" style={{ color: "var(--green)" }}>Welcome</p>
          <h1 className="text-[28px] font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
            What would you like to work on?
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            Write it in your own words. There's no right answer — just what feels true for you.
          </p>
        </div>

        {/* Goal input */}
        <div className="mb-8">
          <textarea
            className="w-full rounded-2xl px-4 py-4 text-[15px] leading-relaxed resize-none outline-none"
            style={{
              background: "var(--card)",
              color: "var(--foreground)",
              border: `1.5px solid ${goal.trim().length > 0 ? "var(--green)" : "var(--border)"}`,
              minHeight: 120,
              fontFamily: "inherit",
              transition: "border-color 0.2s ease",
            }}
            placeholder="e.g. I want to feel less anxious in social situations…"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={4}
          />
        </div>

        {/* Focus area — single-select pills with spring */}
        <div className="mb-8">
          <p className="text-[13px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            Focus area
          </p>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map((area) => {
              const active = focus === area;
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleSelectFocus(area)}
                  className={active && lastSelected === area ? "pill-spring" : ""}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "9999px",
                    fontSize: "14px",
                    fontWeight: 500,
                    background: active ? "var(--green)" : "var(--card)",
                    color: active ? "#ffffff" : "var(--foreground)",
                    border: `1.5px solid ${active ? "var(--green)" : "var(--border)"}`,
                    transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
                    cursor: "pointer",
                  }}
                  onAnimationEnd={() => {
                    if (active) setLastSelected(null);
                  }}
                >
                  {area}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-10">
          <p className="text-[13px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            Plan duration
          </p>
          <div className="flex gap-2">
            {DURATIONS.map((d) => {
              const active = duration === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDuration(d.value)}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                  style={{
                    background: active ? "var(--green)" : "var(--card)",
                    color: active ? "#ffffff" : "var(--foreground)",
                    border: `1.5px solid ${active ? "var(--green)" : "var(--border)"}`,
                    transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
                    cursor: "pointer",
                  }}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1" />

        {/* CTA — greyed until goal + focus filled; pulses while loading */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleBuildPlan}
          className={canSubmit ? "" : ""}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "16px",
            fontSize: "16px",
            fontWeight: 600,
            background: canSubmit ? "var(--green)" : "var(--border)",
            color: canSubmit ? "#ffffff" : "var(--muted)",
            cursor: canSubmit ? "pointer" : "not-allowed",
            border: "none",
            transition: "background 0.2s ease, color 0.2s ease",
          }}
        >
          Build my plan
        </button>

        {!canSubmit && (
          <p className="text-center text-xs mt-3" style={{ color: "var(--muted)" }}>
            {goal.trim().length === 0 && focus === null
              ? "Add your goal and pick a focus area to continue"
              : goal.trim().length === 0
              ? "Write your goal to continue"
              : "Pick a focus area to continue"}
          </p>
        )}
      </div>
    </div>
  );
}
