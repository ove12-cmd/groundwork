"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JOURNAL_PROMPT, STREAK } from "@/lib/mock-data";

const MOODS = [
  { value: 1, emoji: "😔", label: "Rough" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
];

export default function CheckinPage() {
  const router = useRouter();
  const [mood, setMood] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!mood) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className="flex justify-center min-h-screen"
        style={{ background: "var(--background)" }}
      >
        <div className="w-full max-w-[390px] min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
            style={{ background: "var(--accent-nourish)" }}
          >
            🌱
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--foreground)" }}>
              Great work today.
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Every day you show up is a day you grow.
            </p>
          </div>

          <div
            className="w-full rounded-2xl px-6 py-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
              Current streak
            </p>
            <p className="text-4xl font-bold" style={{ color: "var(--green)" }}>
              {STREAK + 1}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>days in a row</p>
          </div>

          <button
            onClick={() => router.push("/today")}
            className="w-full py-4 rounded-2xl text-base font-semibold"
            style={{ background: "var(--green)", color: "#ffffff" }}
          >
            Back to today
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex justify-center min-h-screen"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-[390px] min-h-screen flex flex-col px-5 pt-8 pb-10">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 mb-8 text-sm font-medium self-start"
          style={{ color: "var(--muted)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Today
        </button>

        <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--foreground)" }}>
          How are you feeling?
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          Honest check-in, no judgment.
        </p>

        {/* Mood selector */}
        <div className="flex justify-between mb-8">
          {MOODS.map((m) => {
            const active = mood === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center gap-1.5${active ? " mood-selected" : ""}`}
              >
                <span
                  className="text-2xl w-12 h-12 flex items-center justify-center rounded-2xl"
                  style={{
                    background: active ? "var(--green)" : "var(--card)",
                    border: active ? "2px solid var(--green)" : "1.5px solid var(--border)",
                  }}
                >
                  {m.emoji}
                </span>
                <span className="text-[10px] font-medium" style={{ color: active ? "var(--green)" : "var(--muted)" }}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Journal prompt */}
        <div
          className="rounded-2xl px-4 py-4 mb-4"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
            Today's prompt
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
            "{JOURNAL_PROMPT}"
          </p>
        </div>

        {/* Textarea */}
        <textarea
          className="w-full rounded-2xl px-4 py-4 text-sm leading-relaxed resize-none outline-none mb-6"
          style={{
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1.5px solid var(--border)",
            fontFamily: "inherit",
            minHeight: 140,
          }}
          placeholder="Write freely…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex-1" />

        <button
          onClick={handleSubmit}
          disabled={!mood}
          className="w-full py-4 rounded-2xl text-base font-semibold"
          style={{
            background: mood ? "var(--green)" : "var(--border)",
            color: mood ? "#ffffff" : "var(--muted)",
            cursor: mood ? "pointer" : "not-allowed",
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
