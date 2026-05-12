"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { TASKS } from "@/lib/mock-data";

const TYPE_LABELS: Record<string, string> = {
  breathing:   "Breathing",
  journal:     "Journal",
  reflection:  "Reflection",
  movement:    "Movement",
  mindfulness: "Mindfulness",
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  breathing:   { bg: "var(--accent-recharge)", text: "#3a4a5e" },
  journal:     { bg: "var(--accent-dream)",    text: "#4a2a35" },
  reflection:  { bg: "var(--accent-move)",     text: "#4a3728" },
  mindfulness: { bg: "var(--accent-nourish)",  text: "#2d5016" },
  movement:    { bg: "var(--accent-move)",     text: "#4a3728" },
};

const MODE_KEY = "groundwork-task-mode";
type Mode = "phone" | "paper" | null;

const fadeTransition = { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const };

export default function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const task = TASKS[id];

  const [mode, setMode] = useState<Mode>(null);
  const [stepInputs, setStepInputs] = useState<string[]>([]);
  const [journalText, setJournalText] = useState("");
  const [flashing, setFlashing] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY) as Mode;
      if (saved === "phone" || saved === "paper") setMode(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (task) setStepInputs(task.steps.map(() => ""));
  }, [task]);

  if (!task) {
    return (
      <div className="flex justify-center min-h-screen" style={{ background: "var(--background)" }}>
        <div className="w-full max-w-[390px] flex flex-col items-center justify-center gap-4">
          <p style={{ color: "var(--muted)" }}>Task not found.</p>
          <button type="button" onClick={() => router.push("/today")} style={{ color: "var(--green)" }}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  const colors = TYPE_COLORS[task.type];

  const selectMode = (m: Mode) => {
    setMode(m);
    try { localStorage.setItem(MODE_KEY, m ?? ""); } catch { /* ignore */ }
  };

  const handleComplete = () => {
    if (completed) return;
    setFlashing(true);
    setTimeout(() => {
      setCompleted(true);
      setTimeout(() => router.push("/today"), 200);
    }, 450);
  };

  const updateStep = (i: number, val: string) => {
    setStepInputs((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  return (
    <div className="flex justify-center min-h-screen" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-[390px] min-h-screen flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-8 pb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: "var(--muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Today
          </button>
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{ background: colors.bg, color: colors.text }}
          >
            {TYPE_LABELS[task.type]}
          </span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 px-5 overflow-y-auto pb-32">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--foreground)" }}>
            {task.name}
          </h1>
          <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>{task.duration}</p>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>{task.description}</p>

          {/* Mode selector — two pills, neither selected by default */}
          <div className="flex gap-2 mb-8">
            {(["phone", "paper"] as const).map((m) => {
              const active = mode === m;
              const label = m === "phone" ? "Write on phone" : "I'll use paper";
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMode(m)}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    borderRadius: "9999px",
                    fontSize: "13px",
                    fontWeight: 500,
                    background: active ? "#1C1C1E" : "var(--card)",
                    color: active ? "#ffffff" : "var(--foreground)",
                    border: `1.5px solid ${active ? "#1C1C1E" : "var(--border)"}`,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Mode-specific step content */}
          <AnimatePresence mode="wait" initial={false}>
            {mode === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fadeTransition}
              >
                <div className="flex flex-col gap-5 mb-8">
                  {task.steps.map((step, i) => (
                    <div key={i}>
                      <div className="flex gap-4 items-start mb-2">
                        <span
                          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed pt-1" style={{ color: "var(--foreground)" }}>
                          {step}
                        </p>
                      </div>
                      <textarea
                        value={stepInputs[i] ?? ""}
                        onChange={(e) => updateStep(i, e.target.value)}
                        placeholder="Your response…"
                        rows={2}
                        style={{
                          width: "calc(100% - 44px)",
                          marginLeft: "44px",
                          marginTop: "4px",
                          background: "var(--card)",
                          color: "var(--foreground)",
                          border: "1.5px solid var(--border)",
                          borderRadius: "14px",
                          padding: "10px 14px",
                          fontSize: "14px",
                          lineHeight: "1.6",
                          fontFamily: "inherit",
                          resize: "none",
                          outline: "none",
                          display: "block",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Journal prompts for phone mode */}
                {task.journalPrompts && (
                  <div className="mb-6">
                    <p className="text-[13px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
                      Reflect
                    </p>
                    <div className="flex flex-col gap-3 mb-4">
                      {task.journalPrompts.map((prompt, i) => (
                        <div
                          key={i}
                          className="rounded-2xl px-4 py-3"
                          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                        >
                          <p className="text-sm" style={{ color: "var(--foreground)" }}>{prompt}</p>
                        </div>
                      ))}
                    </div>
                    <textarea
                      className="w-full rounded-2xl px-4 py-4 text-sm leading-relaxed resize-none outline-none"
                      style={{
                        background: "var(--card)",
                        color: "var(--foreground)",
                        border: "1.5px solid var(--border)",
                        fontFamily: "inherit",
                        minHeight: 120,
                      }}
                      placeholder="Write your thoughts here…"
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {mode === "paper" && (
              <motion.div
                key="paper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fadeTransition}
              >
                {/* Clean reading steps — no inputs */}
                <div className="flex flex-col gap-4 mb-6">
                  {task.steps.map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed pt-1" style={{ color: "var(--foreground)" }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Paper note */}
                <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
                  Take your time. Come back when you're done.
                </p>

                {/* Mark complete inline for paper mode */}
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={completed}
                  className={flashing ? "success-flash" : ""}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "16px",
                    fontSize: "16px",
                    fontWeight: 600,
                    background: completed ? "var(--border)" : "#1C1C1E",
                    color: completed ? "var(--muted)" : "#ffffff",
                    border: "none",
                    cursor: completed ? "default" : "pointer",
                    marginBottom: "32px",
                  }}
                >
                  {completed ? "Marked complete ✓" : flashing ? "Done! ✓" : "Mark complete"}
                </button>
              </motion.div>
            )}

            {/* No mode yet — show steps as neutral reading view */}
            {mode === null && (
              <motion.div
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fadeTransition}
              >
                <div className="flex flex-col gap-4 mb-8">
                  {task.steps.map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed pt-1" style={{ color: "var(--foreground)" }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed bottom CTA — shown for phone mode and no-mode; paper mode has its own inline button */}
        {mode !== "paper" && (
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-8 pt-4"
            style={{ background: "linear-gradient(to top, var(--background) 85%, transparent)" }}
          >
            <button
              type="button"
              onClick={handleComplete}
              disabled={completed}
              className={flashing ? "success-flash" : ""}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                fontSize: "16px",
                fontWeight: 600,
                background: completed ? "var(--border)" : "#1C1C1E",
                color: completed ? "var(--muted)" : "#ffffff",
                border: "none",
                cursor: completed ? "default" : "pointer",
              }}
            >
              {completed ? "Marked complete ✓" : flashing ? "Done! ✓" : "Mark complete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
