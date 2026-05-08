"use client";

import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { STREAK, TODAY_DAY } from "@/lib/mock-data";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <Shell>
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--foreground)" }}>
          Profile
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          Social Anxiety · 30-day plan
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Day", value: TODAY_DAY },
            { label: "Streak", value: STREAK },
            { label: "Tasks done", value: 11 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl px-3 py-4 text-center"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <p className="text-2xl font-bold mb-1" style={{ color: "var(--green)" }}>
                {stat.value}
              </p>
              <p className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Goal */}
        <div
          className="rounded-2xl px-4 py-4 mb-4"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
            Your goal
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
            "I want to feel less anxious in social situations"
          </p>
        </div>

        {/* Settings list */}
        <p className="text-[13px] font-semibold uppercase tracking-widest mb-3 mt-6" style={{ color: "var(--muted)" }}>
          Settings
        </p>
        {[
          { label: "Notifications", detail: "Daily at 9:00 AM" },
          { label: "Plan duration", detail: "30 days" },
          { label: "Focus area", detail: "Social Anxiety" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-4 py-4 rounded-2xl mb-2"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {item.label}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--muted)" }}>{item.detail}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--border)" }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        ))}

        <button
          onClick={() => router.push("/onboarding")}
          className="w-full py-4 rounded-2xl text-base font-semibold mt-6"
          style={{ background: "var(--card)", color: "var(--foreground)", border: "1.5px solid var(--border)" }}
        >
          Start a new plan
        </button>
      </div>
    </Shell>
  );
}
