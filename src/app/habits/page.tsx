"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  type Habit,
  type HabitIcon,
  type HabitFrequency,
  getSuggestedHabits,
  MOCK_MY_HABITS,
  USER_PLANS,
  ACTIVE_PLAN_ID,
} from "@/lib/mock-data";
import { HabitIconSvg, HABIT_ICON_OPTIONS } from "@/components/HabitIcon";

const HABITS_KEY = "groundwork-habits";

function todayKey() {
  return `groundwork-habit-log-${new Date().toISOString().split("T")[0]}`;
}

export default function HabitsPage() {
  const router = useRouter();

  const activePlan = USER_PLANS.find((p) => p.id === ACTIVE_PLAN_ID) ?? USER_PLANS[0];
  const focusArea = activePlan.focusArea;

  const [myHabits, setMyHabits] = useState<Habit[]>([]);
  const [mounted, setMounted] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState<HabitIcon>("breath");
  const [newFreq, setNewFreq] = useState<HabitFrequency>("daily");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HABITS_KEY);
      setMyHabits(raw ? (JSON.parse(raw) as Habit[]) : MOCK_MY_HABITS);
    } catch {
      setMyHabits(MOCK_MY_HABITS);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(HABITS_KEY, JSON.stringify(myHabits));
    } catch { /* ignore */ }
  }, [myHabits, mounted]);

  const suggested = mounted
    ? getSuggestedHabits(focusArea).filter(
        (s) => !myHabits.some((h) => h.id === s.id)
      )
    : [];

  const addSuggested = (habit: Habit) => {
    setMyHabits((prev) => [...prev, { ...habit, streak: 0, completedToday: false }]);
  };

  const removeHabit = (id: string) => {
    setMyHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const saveCustom = () => {
    if (!newName.trim()) return;
    const habit: Habit = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      icon: newIcon,
      streak: 0,
      completedToday: false,
      type: "custom",
      frequency: newFreq,
    };
    setMyHabits((prev) => [...prev, habit]);
    setNewName("");
    setNewIcon("breath");
    setNewFreq("daily");
    setShowForm(false);
  };

  const freqLabel: Record<HabitFrequency, string> = {
    daily: "Daily",
    weekdays: "Weekdays",
  };

  return (
    <div
      className="flex justify-center min-h-screen"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-[390px] min-h-screen flex flex-col">
        <div className="px-5 pt-8 pb-32">

          {/* Header */}
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm font-medium mb-6"
            style={{ color: "var(--muted)" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <h1
            className="text-2xl font-bold mb-1"
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              color: "var(--foreground)",
            }}
          >
            Daily habits
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
            Personalized for your plan
          </p>

          {/* Suggested for you */}
          <p
            className="text-[11px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--muted)" }}
          >
            Suggested for you
          </p>

          {mounted && suggested.length === 0 ? (
            <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
              All suggestions added ✓
            </p>
          ) : (
            <div className="flex flex-col gap-2 mb-8">
              {suggested.map((habit) => (
                <div
                  key={habit.id}
                  className="rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span style={{ color: "var(--muted)", flexShrink: 0 }}>
                    <HabitIconSvg icon={habit.icon} size={18} />
                  </span>
                  <span
                    className="flex-1 text-sm font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    {habit.name}
                  </span>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--background)",
                      color: "var(--muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {freqLabel[habit.frequency]}
                  </span>
                  <button
                    type="button"
                    onClick={() => addSuggested(habit)}
                    className="flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: "#1C1C1E",
                      color: "#ffffff",
                    }}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* My habits */}
          <p
            className="text-[11px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--muted)" }}
          >
            My habits
          </p>

          {mounted && myHabits.length === 0 ? (
            <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
              No habits yet. Add some from the suggestions above.
            </p>
          ) : (
            <div className="flex flex-col gap-2 mb-8">
              {myHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span style={{ color: "var(--muted)", flexShrink: 0 }}>
                    <HabitIconSvg icon={habit.icon} size={18} />
                  </span>
                  <span
                    className="flex-1 text-sm font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    {habit.name}
                  </span>
                  {habit.streak > 0 && (
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      🔥 {habit.streak}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeHabit(habit.id)}
                    className="flex-shrink-0 text-lg leading-none"
                    style={{ color: "var(--muted)" }}
                    aria-label="Remove habit"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Custom habit form */}
          {showForm && (
            <div className="mb-8">
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Create a habit
              </p>

              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Habit name…"
                className="w-full rounded-2xl px-4 py-3 text-sm mb-4 outline-none"
                style={{
                  background: "var(--card)",
                  color: "var(--foreground)",
                  border: "1.5px solid var(--border)",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#1C1C1E";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              />

              {/* Icon picker */}
              <div className="flex flex-wrap gap-2 mb-4">
                {HABIT_ICON_OPTIONS.map((icon) => {
                  const selected = newIcon === icon;
                  return (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: 40,
                        height: 40,
                        background: selected ? "#1C1C1E" : "var(--card)",
                        color: selected ? "#ffffff" : "var(--muted)",
                        border: `1.5px solid ${selected ? "#1C1C1E" : "var(--border)"}`,
                        flexShrink: 0,
                      }}
                      aria-label={icon}
                    >
                      <HabitIconSvg icon={icon} size={18} />
                    </button>
                  );
                })}
              </div>

              {/* Frequency toggle */}
              <div className="flex gap-2 mb-5">
                {(["daily", "weekdays"] as HabitFrequency[]).map((freq) => {
                  const active = newFreq === freq;
                  return (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setNewFreq(freq)}
                      className="flex-1 py-2 rounded-full text-sm font-medium"
                      style={{
                        background: active ? "#1C1C1E" : "var(--card)",
                        color: active ? "#ffffff" : "var(--foreground)",
                        border: `1.5px solid ${active ? "#1C1C1E" : "var(--border)"}`,
                      }}
                    >
                      {freqLabel[freq]}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={saveCustom}
                className="w-full py-3 rounded-2xl text-sm font-semibold mb-3"
                style={{
                  background: "#1C1C1E",
                  color: "#ffffff",
                }}
              >
                Save habit
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNewName("");
                  setNewIcon("breath");
                  setNewFreq("daily");
                }}
                className="w-full text-sm font-medium py-1"
                style={{ color: "var(--muted)" }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Fixed bottom CTA */}
        {!showForm && (
          <div
            style={{
              position: "fixed",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: 390,
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full py-4 rounded-2xl text-sm font-semibold"
              style={{
                background: "var(--card)",
                color: "var(--foreground)",
                border: "1.5px solid var(--border)",
              }}
            >
              + Create custom habit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
