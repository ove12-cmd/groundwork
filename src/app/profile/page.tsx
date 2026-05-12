"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { createClient } from "@/lib/supabase/client";
import type { PlanStatus } from "@/lib/mock-data";

const STORAGE_KEY = "groundwork-notif";

interface PlanSummary {
  id: string;
  name: string;
  focusArea: string;
  totalDays: number;
  completedDays: number;
  status: PlanStatus;
  goal: string | null;
  createdAt: string;
  isActive: boolean;
}

function IOSToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      style={{
        width: 44, height: 26, borderRadius: 13,
        background: enabled ? "#1C1C1E" : "var(--border)",
        position: "relative", border: "none", padding: 0,
        cursor: "pointer", flexShrink: 0, transition: "background 0.2s ease",
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: enabled ? 21 : 3,
        width: 20, height: 20, borderRadius: "50%", background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.18)", transition: "left 0.2s ease", display: "block",
      }} />
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifTime, setNotifTime] = useState("09:00");
  const [hydrated, setHydrated] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);

  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [planLoading, setPlanLoading] = useState(true);

  // Streak from localStorage check-in data
  const [streak, setStreak] = useState(0);
  const [checkIns, setCheckIns] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("groundwork-user-name");
      if (stored) { const n = stored.split(" ")[0]; setFirstName(n.charAt(0).toUpperCase() + n.slice(1)); }
    } catch { /* ignore */ }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { enabled, time } = JSON.parse(raw) as { enabled: boolean; time: string };
        setNotifEnabled(!!enabled);
        setNotifTime(time ?? "09:00");
      }
    } catch { /* ignore */ }

    // Compute streak and total check-ins from tracking localStorage
    let streakCount = 0;
    let totalCheckIns = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      try {
        const m = localStorage.getItem(`groundwork-track-${dateStr}-morning`);
        const e = localStorage.getItem(`groundwork-track-${dateStr}-evening`);
        if (m) totalCheckIns++;
        if (e) totalCheckIns++;
        if (m || e) { if (i === streakCount) streakCount++; }
        else if (i > 0) break;
      } catch { break; }
    }
    setStreak(streakCount);
    setCheckIns(totalCheckIns);

    setHydrated(true);

    // Load plans from Supabase
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setPlanLoading(false); return; }
      supabase.from("plans").select("id, name, focus_area, total_days, completed_days, status, goal, created_at, is_active")
        .eq("user_id", user.id).order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data?.length) {
            setPlans(data.map(p => ({
              id: p.id,
              name: p.name,
              focusArea: p.focus_area ?? "",
              totalDays: p.total_days ?? 30,
              completedDays: p.completed_days ?? 0,
              status: p.status as PlanStatus,
              goal: p.goal ?? null,
              createdAt: p.created_at,
              isActive: p.is_active,
            })));
          }
          setPlanLoading(false);
        });
    });
  }, []);

  const toggleNotif = () => {
    const next = !notifEnabled;
    setNotifEnabled(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: next, time: notifTime }));
  };

  const updateTime = (t: string) => {
    setNotifTime(t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: notifEnabled, time: t }));
  };

  const activePlan = plans.find(p => p.isActive) ?? plans[0] ?? null;
  const currentDay = activePlan
    ? Math.max(1, Math.min(activePlan.totalDays, Math.floor((Date.now() - new Date(activePlan.createdAt).getTime()) / 86_400_000) + 1))
    : 0;

  // Subtitle logic
  const subtitle = planLoading
    ? null
    : plans.length === 0
      ? null
      : plans.length === 1
        ? `${activePlan!.focusArea} · ${activePlan!.totalDays}-day plan`
        : `${plans.length} plans · Your wellness journey`;

  return (
    <Shell>
      <div className="px-5 pt-8 pb-4">

        <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--foreground)" }}>
          {firstName ? firstName : "Profile"}
        </h1>
        {subtitle && (
          <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{subtitle}</p>
        )}
        {!subtitle && <div className="mb-8" />}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Day",       value: currentDay },
            { label: "Streak",    value: streak },
            { label: "Check-ins", value: checkIns },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl px-3 py-4 text-center"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="text-2xl font-bold mb-1" style={{ color: "var(--green)" }}>{stat.value}</p>
              <p className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Goal — only when exactly 1 plan and goal exists */}
        {!planLoading && plans.length === 1 && activePlan?.goal && (
          <div className="rounded-2xl px-4 py-4 mb-8"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
              Your goal
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
              &ldquo;{activePlan.goal}&rdquo;
            </p>
          </div>
        )}

        {/* Notifications */}
        <p className="text-[13px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
          Notifications
        </p>
        <div className="rounded-2xl px-4 mb-2 overflow-hidden"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Daily reminder</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {hydrated && notifEnabled ? `Enabled · ${notifTime}` : "Off"}
              </p>
            </div>
            {hydrated && <IOSToggle enabled={notifEnabled} onToggle={toggleNotif} />}
          </div>
          {hydrated && notifEnabled && (
            <div className="pb-4 pt-1" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
                Reminder time
              </p>
              <input type="time" value={notifTime} onChange={(e) => updateTime(e.target.value)}
                style={{
                  background: "var(--background)", color: "var(--foreground)",
                  border: "1.5px solid var(--border)", borderRadius: 12,
                  padding: "10px 14px", fontSize: 15, fontFamily: "inherit",
                  width: "100%", outline: "none", WebkitAppearance: "none",
                }} />
            </div>
          )}
        </div>

        {/* Plan settings — only when exactly 1 plan */}
        {!planLoading && plans.length === 1 && activePlan && (
          <>
            <p className="text-[13px] font-semibold uppercase tracking-widest mb-3 mt-6" style={{ color: "var(--muted)" }}>
              Plan settings
            </p>
            {[
              { label: "Plan duration", detail: `${activePlan.totalDays} days` },
              { label: "Focus area",    detail: activePlan.focusArea },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between px-4 py-4 rounded-2xl mb-2"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: "var(--muted)" }}>{item.detail}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--border)" }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Multiple plans — link to plan overview */}
        {!planLoading && plans.length > 1 && (
          <>
            <p className="text-[13px] font-semibold uppercase tracking-widest mb-3 mt-6" style={{ color: "var(--muted)" }}>
              Your plans
            </p>
            <button type="button" onClick={() => router.push("/plan")}
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl mb-2"
              style={{ background: "var(--card)", border: "1px solid var(--border)", cursor: "pointer" }}>
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                View all plans
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--border)" }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        <button type="button" onClick={() => router.push("/onboarding")}
          className="w-full py-4 rounded-2xl text-base font-semibold mt-6"
          style={{ background: "var(--card)", color: "var(--foreground)", border: "1.5px solid var(--border)" }}>
          Start a new plan
        </button>

        <button type="button"
          onClick={async () => { await createClient().auth.signOut(); router.push("/auth"); }}
          className="w-full py-4 rounded-2xl text-base font-semibold mt-3"
          style={{ background: "transparent", color: "#c0392b", border: "1.5px solid var(--border)" }}>
          Log out
        </button>
      </div>
    </Shell>
  );
}
