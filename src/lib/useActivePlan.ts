"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AI_PLAN_KEY, FOCUS_AREA_TRACKING_LABEL,
  type Day, type FocusArea, type HabitIcon, type HabitFrequency,
} from "@/lib/mock-data";

export interface ActivePlan {
  id: string;
  name: string;
  focusArea: string;
  summary: string | null;
  totalDays: number;
  completedDays: number;
  habits: Array<{ name: string; icon: HabitIcon; frequency: HabitFrequency }>;
  days: Day[];
  createdAt: string;
}

export interface UseActivePlanResult {
  loading: boolean;
  plan: ActivePlan | null;
  currentDay: number;
  todayData: Day | null;
  trackingLabel: string;
  completionPct: number;
}

export function useActivePlan(): UseActivePlanResult {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<ActivePlan | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("plans")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (data) {
            setPlan({
              id: data.id,
              name: data.name,
              focusArea: data.focus_area ?? "Social Anxiety",
              summary: data.summary ?? data.goal ?? null,
              totalDays: data.total_days ?? 30,
              completedDays: data.completed_days ?? 0,
              habits: Array.isArray(data.habits) ? data.habits : [],
              days: Array.isArray(data.plan_days) ? data.plan_days : [],
              createdAt: data.created_at,
            });
            setLoading(false);
            return;
          }
        }

        // Fallback: localStorage (pre-auth or no Supabase plan)
        const raw = localStorage.getItem(AI_PLAN_KEY);
        if (raw) {
          const p = JSON.parse(raw);
          setPlan({
            id: "local",
            name: p.planName ?? p.focusArea ?? "My Plan",
            focusArea: p.focusArea ?? "Social Anxiety",
            summary: p.summary ?? null,
            totalDays: p.totalDays ?? 30,
            completedDays: 0,
            habits: Array.isArray(p.habits) ? p.habits : [],
            days: Array.isArray(p.days) ? p.days : [],
            createdAt: p.createdAt ?? new Date().toISOString(),
          });
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const currentDay = plan
    ? Math.max(
        1,
        Math.min(
          plan.totalDays,
          Math.floor((Date.now() - new Date(plan.createdAt).getTime()) / 86_400_000) + 1
        )
      )
    : 1;

  const todayData = plan?.days.length
    ? (plan.days.find((d) => d.day === currentDay) ?? plan.days[currentDay - 1] ?? null)
    : null;

  const trackingLabel =
    FOCUS_AREA_TRACKING_LABEL[plan?.focusArea as FocusArea] ?? "Level";

  const completionPct = plan
    ? Math.round((plan.completedDays / plan.totalDays) * 100)
    : 0;

  return { loading, plan, currentDay, todayData, trackingLabel, completionPct };
}
