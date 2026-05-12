"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PHASES, PENDING_ONBOARDING_KEY, type UserPlan, type PlanStatus } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

const LOADING_MESSAGES = [
  "Reading your responses…",
  "Understanding your patterns…",
  "Designing your first week…",
  "Building daily tasks for you…",
  "Adding habits that fit your life…",
  "Putting the finishing touches…",
];

function PlanGeneratingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed inset-0 flex justify-center items-center" style={{ background: "var(--background)", zIndex: 60 }}>
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="loading-dot" style={{ animationDelay: `${i * 0.22}s` }} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={msgIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }} className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
            {LOADING_MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Usually takes 15–20 seconds</p>
      </div>
    </div>
  );
}

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

const STATUS_LABEL: Record<PlanStatus, string> = {
  active: "Active",
  completed: "Completed",
  "in-progress": "In progress",
};

function PlanCard({
  plan,
  isSelected,
  onClick,
  onMenu,
}: {
  plan: UserPlan;
  isSelected: boolean;
  onClick: () => void;
  onMenu: () => void;
}) {
  const pct = Math.round((plan.completedDays / plan.totalDays) * 100);
  return (
    <div
      className="flex-shrink-0 rounded-2xl p-4 flex flex-col gap-3"
      style={{
        width: 160,
        background: "var(--card)",
        border: `1.5px solid ${isSelected ? "#1C1C1E" : "var(--border)"}`,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
          {plan.name}
        </p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMenu(); }}
          className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full"
          style={{ color: "var(--muted)", background: "transparent", border: "none" }}
          aria-label="Plan options"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      </div>

      <p className="text-[11px]" style={{ color: "var(--muted)" }}>{plan.focusArea}</p>

      {/* Progress bar */}
      <div>
        <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: "#1C1C1E" }}
          />
        </div>
        <p className="text-[10px] font-medium" style={{ color: "var(--muted)" }}>{pct}% complete</p>
      </div>

      <span
        className="self-start text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{
          background: plan.status === "active" ? "#1C1C1E" : "var(--border)",
          color: plan.status === "active" ? "#ffffff" : "var(--muted)",
        }}
      >
        {STATUS_LABEL[plan.status]}
      </span>
    </div>
  );
}

const SHEET_ACTIONS = [
  { id: "active",   label: "Set as active" },
  { id: "complete", label: "Mark as complete" },
  { id: "delete",   label: "Delete plan",    danger: true },
];

export default function PlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [sheetPlanId, setSheetPlanId] = useState<string | null>(null);
  const [planSummaries, setPlanSummaries] = useState<Record<string, string | null>>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setPlanLoading(false); return; }

      // Generate plan from pending onboarding data if present
      const pendingRaw = localStorage.getItem(PENDING_ONBOARDING_KEY);
      if (pendingRaw) {
        setGenerating(true);
        try {
          const { focus, goal, questionsAndAnswers, duration } = JSON.parse(pendingRaw);
          const res = await fetch("/api/onboarding/generate-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ focus, goal, questionsAndAnswers, duration }),
          });
          if (res.ok) {
            const plan = await res.json();
            await supabase.from("plans").insert({
              user_id: user.id,
              name: plan.planName ?? focus ?? "My Plan",
              focus_area: focus,
              summary: plan.summary,
              goal,
              total_days: duration ?? 30,
              completed_days: 0,
              status: "active",
              plan_days: plan.days,
              habits: plan.habits,
              is_active: true,
            });
          }
        } catch { /* ignore, load existing plans below */ } finally {
          localStorage.removeItem(PENDING_ONBOARDING_KEY);
          setGenerating(false);
        }
      }

      supabase.from("plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data?.length) {
            const mapped: UserPlan[] = data.map((p) => ({
              id: p.id,
              name: p.name,
              focusArea: p.focus_area as UserPlan["focusArea"],
              totalDays: p.total_days,
              completedDays: p.completed_days,
              status: p.status as PlanStatus,
            }));
            setPlans(mapped);
            const active = data.find((p) => p.is_active) ?? data[0];
            setActivePlanId(active.id);
            setSelectedPlanId(active.id);
            const summaries: Record<string, string | null> = {};
            data.forEach(p => { summaries[p.id] = p.summary ?? p.goal ?? null; });
            setPlanSummaries(summaries);
          }
          setPlanLoading(false);
        });
    });
  }, []);

  if (generating) return <PlanGeneratingScreen />;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? plans[0] ?? null;
  const sheetPlan = plans.find((p) => p.id === sheetPlanId) ?? null;

  const handleSheetAction = (actionId: string) => {
    if (!sheetPlanId) return;
    if (actionId === "active") {
      setActivePlanId(sheetPlanId);
      setSelectedPlanId(sheetPlanId);
      setPlans((prev) =>
        prev.map((p) => ({ ...p, status: p.id === sheetPlanId ? "active" : p.status === "active" ? "in-progress" : p.status }))
      );
    } else if (actionId === "complete") {
      setPlans((prev) =>
        prev.map((p) => (p.id === sheetPlanId ? { ...p, status: "completed" } : p))
      );
    } else if (actionId === "delete") {
      const supabase = createClient();
      supabase.from("plans").delete().eq("id", sheetPlanId).then(() => {});
      setPlans((prev) => prev.filter((p) => p.id !== sheetPlanId));
      if (activePlanId === sheetPlanId) {
        const remaining = plans.filter((p) => p.id !== sheetPlanId);
        if (remaining.length) setActivePlanId(remaining[0].id);
      }
    }
    setSheetPlanId(null);
  };

  return (
    <div className="flex justify-center" style={{ background: "var(--background)", height: "100dvh" }}>
      <div className="w-full max-w-[390px] flex flex-col" style={{ height: "100%" }}>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pt-8 pb-44">

          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              My Plans
            </p>
            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New plan
            </button>
          </div>

          {planLoading ? (
            <div className="flex flex-col gap-3">
              <div className="skeleton rounded-2xl h-8 w-48" />
              <div className="skeleton rounded-2xl h-5 w-32 mb-4" />
              {[1, 2, 3].map(i => <div key={i} className="skeleton rounded-2xl h-24" />)}
            </div>
          ) : !selectedPlan ? (
            <div className="flex flex-col items-center text-center gap-3 pt-12">
              <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>No plan yet</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>Create your first personalised plan to get started.</p>
              <button type="button" onClick={() => router.push("/onboarding")}
                className="mt-2 px-5 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: "#1C1C1E", color: "#fff", border: "none", cursor: "pointer" }}>
                Create a plan
              </button>
            </div>
          ) : (<>
          {/* Horizontal scrollable plan cards */}
          {plans.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 mb-6 -mx-5 pl-5" style={{ scrollbarWidth: "none" }}>
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isSelected={plan.id === selectedPlanId}
                  onClick={() => setSelectedPlanId(plan.id)}
                  onMenu={() => setSheetPlanId(plan.id)}
                />
              ))}
            </div>
          )}

          {/* Selected plan overview */}
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
            Your Plan
          </p>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--foreground)" }}>
            {selectedPlan.focusArea} — {selectedPlan.totalDays} Days
          </h1>
          {selectedPlanId && planSummaries[selectedPlanId] && (
            <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--muted)" }}>
              {planSummaries[selectedPlanId]}
            </p>
          )}

          {/* Phase cards */}
          <div className="flex flex-col gap-3">
            {PHASES.map((phase, i) => (
              <div
                key={phase.name}
                className="rounded-2xl p-4 card-rise"
                style={{ background: PHASE_COLORS[phase.name], animationDelay: `${i * 120}ms` }}
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
          </>)}
        </div>

        {/* Fixed bottom CTA */}
        {selectedPlan && !planLoading && (
          <div
            className="fixed left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pt-4 pb-4"
            style={{ bottom: 72, background: "linear-gradient(to top, var(--background) 70%, transparent)" }}
          >
            <button
              type="button"
              onClick={() => router.push(`/plan/days?planId=${selectedPlanId}`)}
              className="w-full py-4 rounded-2xl text-base font-semibold"
              style={{ background: "#1C1C1E", color: "#ffffff" }}
            >
              Days overview
            </button>
          </div>
        )}
      </div>

      {/* Action sheet */}
      <AnimatePresence>
        {sheetPlanId && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSheetPlanId(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                zIndex: 100,
              }}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", ease: [0.32, 0, 0.18, 1], duration: 0.28 }}
              style={{
                position: "fixed",
                bottom: 0,
                left: "50%",
                x: "-50%",
                width: "100%",
                maxWidth: 390,
                background: "var(--card)",
                borderRadius: "20px 20px 0 0",
                zIndex: 101,
                paddingBottom: "env(safe-area-inset-bottom, 16px)",
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
              </div>

              {sheetPlan && (
                <p className="px-6 pb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  {sheetPlan.name}
                </p>
              )}

              <div className="flex flex-col pb-4">
                {SHEET_ACTIONS.map((action, i) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleSheetAction(action.id)}
                    className="w-full px-6 py-4 text-left text-base font-medium"
                    style={{
                      color: action.danger ? "#c0392b" : "var(--foreground)",
                      background: "transparent",
                      border: "none",
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              <div style={{ borderTop: "8px solid var(--border)" }}>
                <button
                  type="button"
                  onClick={() => setSheetPlanId(null)}
                  className="w-full px-6 py-4 text-base font-semibold"
                  style={{ color: "var(--foreground)", background: "transparent", border: "none" }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
