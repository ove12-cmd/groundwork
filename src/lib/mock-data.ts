export type FocusArea =
  | "Social Anxiety"
  | "Depression"
  | "Anxiety"
  | "Anger"
  | "Confidence"
  | "Self-esteem";

export type TaskType = "breathing" | "journal" | "reflection" | "movement" | "mindfulness";

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  duration: string;
  description: string;
  steps: string[];
  journalPrompts?: string[];
}

export interface Day {
  day: number;
  theme: string;
  tasks: Task[];
  phase: "Awareness" | "Tools" | "Integration";
}

export const TASKS: Record<string, Task> = {
  "breathing-box": {
    id: "breathing-box",
    name: "Box Breathing",
    type: "breathing",
    duration: "5 min",
    description: "Regulate your nervous system with this simple 4-count breathing pattern.",
    steps: [
      "Find a comfortable seated position. Close your eyes or soften your gaze.",
      "Breathe in slowly through your nose for 4 counts.",
      "Hold your breath for 4 counts — stay calm, don't tense.",
      "Exhale slowly through your mouth for 4 counts.",
      "Hold empty for 4 counts.",
      "Repeat this cycle 4 times. Notice how your body settles.",
    ],
  },
  "social-scan": {
    id: "social-scan",
    name: "Body Scan in Social Context",
    type: "mindfulness",
    duration: "8 min",
    description: "Tune into how your body holds social tension and practice releasing it.",
    steps: [
      "Sit comfortably. Close your eyes.",
      "Think of a mild social situation that makes you uneasy.",
      "Notice where you feel tension — jaw, chest, shoulders, stomach.",
      "Breathe into each area of tension for 2 breaths.",
      "Imagine the tension dissolving with each exhale.",
      "Open your eyes. Notice what's different.",
    ],
  },
  "trigger-journal": {
    id: "trigger-journal",
    name: "Trigger Mapping",
    type: "journal",
    duration: "10 min",
    description: "Identify the specific situations, thoughts, or feelings that activate your anxiety.",
    steps: [
      "Open your journal or use the space below.",
      "Think of a recent moment when you felt socially anxious.",
      "Answer the prompts below honestly — there's no wrong answer.",
    ],
    journalPrompts: [
      "What was the situation? Who was there, what were you doing?",
      "What was the first feeling or thought that arose?",
      "Where did you feel it in your body?",
      "What story were you telling yourself in that moment?",
    ],
  },
  "thought-reframe": {
    id: "thought-reframe",
    name: "Thought Reframe",
    type: "reflection",
    duration: "7 min",
    description: "Examine a negative automatic thought and gently shift your perspective.",
    steps: [
      "Write down a thought you had today that felt heavy or self-critical.",
      "Rate how much you believe it right now (0–100%).",
      "Ask: What's the evidence FOR this thought?",
      "Ask: What's the evidence AGAINST it?",
      "Write a more balanced version of the thought.",
      "Rate how much you believe the original thought now.",
    ],
  },
  "anchor-breath": {
    id: "anchor-breath",
    name: "Anchor Breathing",
    type: "breathing",
    duration: "4 min",
    description: "A quick grounding tool you can use anywhere — even in public.",
    steps: [
      "Feel your feet on the floor. Press down gently.",
      "Take one slow breath in for 4 counts.",
      "Exhale for 6 counts — longer exhale activates calm.",
      "Repeat 3 times. Keep your face relaxed.",
      "This is your anchor — remember it for real situations.",
    ],
  },
  "values-reflection": {
    id: "values-reflection",
    name: "Values Reflection",
    type: "reflection",
    duration: "12 min",
    description: "Reconnect with what matters to you, independent of others' opinions.",
    steps: [
      "List 5 things that genuinely matter to you in life.",
      "For each, write why it matters — not why it should, but why it does.",
      "Ask: Am I living in alignment with these values?",
      "Identify one small action this week that honors a value.",
    ],
    journalPrompts: [
      "Which value feels most alive in you right now?",
      "Which one feels neglected? What's in the way?",
    ],
  },
  "exposure-ladder": {
    id: "exposure-ladder",
    name: "Exposure Ladder",
    type: "mindfulness",
    duration: "10 min",
    description: "Build a gradual ladder of social challenges from easiest to hardest.",
    steps: [
      "Think of your goal social situation (e.g., speaking in a meeting).",
      "Rate the anxiety it creates: 0–10.",
      "List 5 smaller steps that lead up to it, from least to most anxiety-provoking.",
      "Plan to attempt the easiest step this week.",
      "Remember: discomfort is growth, not danger.",
    ],
  },
  "morning-intention": {
    id: "morning-intention",
    name: "Morning Intention",
    type: "reflection",
    duration: "5 min",
    description: "Start your day with a clear, grounded intention.",
    steps: [
      "Take 3 slow breaths before you look at your phone.",
      "Ask yourself: What is one thing I want to bring to today?",
      "Write it down in one sentence.",
      "Read it aloud to yourself once.",
    ],
    journalPrompts: [
      "My intention for today is...",
      "One way I'll take care of myself today is...",
    ],
  },
};

export const PLAN_DAYS: Day[] = [
  { day: 1, theme: "Meeting Yourself", phase: "Awareness", tasks: [TASKS["breathing-box"], TASKS["trigger-journal"], TASKS["anchor-breath"]] },
  { day: 2, theme: "Understanding Your Patterns", phase: "Awareness", tasks: [TASKS["social-scan"], TASKS["trigger-journal"]] },
  { day: 3, theme: "The Body Knows", phase: "Awareness", tasks: [TASKS["social-scan"], TASKS["anchor-breath"], TASKS["morning-intention"]] },
  { day: 4, theme: "Naming the Story", phase: "Awareness", tasks: [TASKS["thought-reframe"], TASKS["trigger-journal"]] },
  { day: 5, theme: "What You Really Want", phase: "Awareness", tasks: [TASKS["values-reflection"], TASKS["morning-intention"]] },
  { day: 6, theme: "Rest and Integrate", phase: "Awareness", tasks: [TASKS["breathing-box"], TASKS["morning-intention"]] },
  { day: 7, theme: "Awareness Check-in", phase: "Awareness", tasks: [TASKS["trigger-journal"], TASKS["thought-reframe"]] },
  { day: 8, theme: "Tools for the Moment", phase: "Tools", tasks: [TASKS["anchor-breath"], TASKS["breathing-box"]] },
  { day: 9, theme: "Challenging the Inner Critic", phase: "Tools", tasks: [TASKS["thought-reframe"], TASKS["values-reflection"]] },
  { day: 10, theme: "Building Your Ladder", phase: "Tools", tasks: [TASKS["exposure-ladder"], TASKS["morning-intention"]] },
  { day: 11, theme: "The Real You in Public", phase: "Tools", tasks: [TASKS["exposure-ladder"], TASKS["anchor-breath"], TASKS["trigger-journal"]] },
  { day: 12, theme: "Grounding in Values", phase: "Tools", tasks: [TASKS["values-reflection"], TASKS["morning-intention"]] },
  { day: 13, theme: "Practice Run", phase: "Tools", tasks: [TASKS["exposure-ladder"], TASKS["thought-reframe"]] },
  { day: 14, theme: "Tools Check-in", phase: "Tools", tasks: [TASKS["trigger-journal"], TASKS["breathing-box"]] },
  { day: 15, theme: "Living It", phase: "Integration", tasks: [TASKS["morning-intention"], TASKS["exposure-ladder"]] },
  { day: 16, theme: "Compassion in Action", phase: "Integration", tasks: [TASKS["values-reflection"], TASKS["anchor-breath"]] },
  { day: 17, theme: "New Lens", phase: "Integration", tasks: [TASKS["thought-reframe"], TASKS["morning-intention"]] },
  { day: 18, theme: "Expanding the Circle", phase: "Integration", tasks: [TASKS["exposure-ladder"], TASKS["social-scan"]] },
  { day: 19, theme: "Staying with Discomfort", phase: "Integration", tasks: [TASKS["anchor-breath"], TASKS["trigger-journal"]] },
  { day: 20, theme: "Who You Are Becoming", phase: "Integration", tasks: [TASKS["values-reflection"], TASKS["morning-intention"]] },
];

export const TODAY_DAY = 4;

export const PHASES = [
  {
    name: "Awareness" as const,
    days: "Days 1–7",
    description: "Build honest insight into your patterns, triggers, and the stories you carry. No fixing yet — just seeing clearly.",
  },
  {
    name: "Tools" as const,
    days: "Days 8–14",
    description: "Learn and practice concrete techniques — breathwork, reframing, exposure — to respond differently in the moment.",
  },
  {
    name: "Integration" as const,
    days: "Days 15–20",
    description: "Weave your new skills into everyday life. Face real situations with the confidence you've built.",
  },
];

export type PlanStatus = "active" | "completed" | "in-progress";

export interface UserPlan {
  id: string;
  name: string;
  focusArea: FocusArea;
  totalDays: number;
  completedDays: number;
  status: PlanStatus;
}

export const USER_PLANS: UserPlan[] = [
  {
    id: "plan-1",
    name: "Social Anxiety",
    focusArea: "Social Anxiety",
    totalDays: 30,
    completedDays: 14,
    status: "active",
  },
  {
    id: "plan-2",
    name: "Building Confidence",
    focusArea: "Confidence",
    totalDays: 21,
    completedDays: 21,
    status: "completed",
  },
  {
    id: "plan-3",
    name: "Managing Anxiety",
    focusArea: "Anxiety",
    totalDays: 30,
    completedDays: 8,
    status: "in-progress",
  },
];

export const ACTIVE_PLAN_ID = "plan-1";

export const JOURNAL_PROMPT =
  "You showed up today. What's one thing that felt hard, and one thing that felt a little easier than before?";

// ── Daily tracking ─────────────────────────────────────────────────────────────

export interface TrackingEntry {
  date: string;   // YYYY-MM-DD
  morning: number; // 1–10
  evening: number; // 1–10
}

export const FOCUS_AREA_TRACKING_LABEL: Partial<Record<FocusArea, string>> = {
  "Social Anxiety": "Anxiety level",
  Anxiety:          "Anxiety level",
  Depression:       "Mood level",
  Anger:            "Anger level",
  Confidence:       "Confidence level",
  "Self-esteem":    "Confidence level",
};

function genTrackingData(): TrackingEntry[] {
  const today = new Date();
  return Array.from({ length: 90 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (89 - i));
    const base = 7.5 - (i / 89) * 3;
    return {
      date:    d.toISOString().split("T")[0],
      morning: Math.max(1, Math.min(10, Math.round(base + Math.sin(i * 0.7) * 1.5))),
      evening: Math.max(1, Math.min(10, Math.round(base - 0.5 + Math.sin(i * 0.7 + 1.8) * 1.5))),
    };
  });
}
export const TRACKING_DATA = genTrackingData();

// ── Habits ─────────────────────────────────────────────────────────────────────

export type HabitIcon = "breath" | "phone" | "heart" | "walk" | "wind" | "sun" | "moon" | "book" | "star" | "drop";
export type HabitFrequency = "daily" | "weekdays";

export interface Habit {
  id: string;
  name: string;
  icon: HabitIcon;
  streak: number;
  completedToday: boolean;
  type: "ai" | "custom";
  frequency: HabitFrequency;
}

export const AI_SUGGESTED_HABITS: Partial<Record<FocusArea, Habit[]>> = {
  "Social Anxiety": [
    { id: "sa-1", name: "5 min morning breathing",          icon: "breath", streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "sa-2", name: "No phone first 30 min after waking", icon: "phone",  streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "sa-3", name: "One moment of gratitude before bed", icon: "heart",  streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "sa-4", name: "10 min walk outside",               icon: "walk",   streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "sa-5", name: "3 deep breaths before stress",      icon: "wind",   streak: 0, completedToday: false, type: "ai", frequency: "daily" },
  ],
  Anxiety: [
    { id: "anx-1", name: "5 min morning breathing",        icon: "breath", streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "anx-2", name: "Grounding exercise before sleep", icon: "moon",   streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "anx-3", name: "10 min walk outside",            icon: "walk",   streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "anx-4", name: "No caffeine after 2pm",          icon: "drop",   streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "anx-5", name: "Write one worry, then let it go", icon: "book",   streak: 0, completedToday: false, type: "ai", frequency: "daily" },
  ],
  Depression: [
    { id: "dep-1", name: "Sunlight within 1 hr of waking", icon: "sun",    streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "dep-2", name: "One moment of gratitude",         icon: "heart",  streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "dep-3", name: "10 min walk outside",             icon: "walk",   streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "dep-4", name: "Write 3 things you noticed",      icon: "book",   streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "dep-5", name: "5 min stretching in the morning", icon: "wind",   streak: 0, completedToday: false, type: "ai", frequency: "daily" },
  ],
  Confidence: [
    { id: "con-1", name: "Write one thing you did well",         icon: "star",  streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "con-2", name: "2 min positive self-talk",             icon: "heart", streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "con-3", name: "Do one thing outside your comfort zone", icon: "sun", streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "con-4", name: "Read for 15 minutes",                  icon: "book",  streak: 0, completedToday: false, type: "ai", frequency: "daily" },
    { id: "con-5", name: "Morning intention setting",            icon: "moon",  streak: 0, completedToday: false, type: "ai", frequency: "daily" },
  ],
};

export function getSuggestedHabits(focusArea: FocusArea): Habit[] {
  return (AI_SUGGESTED_HABITS[focusArea] ?? AI_SUGGESTED_HABITS["Social Anxiety"])!;
}

export const MOCK_MY_HABITS: Habit[] = [
  { id: "sa-1", name: "5 min morning breathing",          icon: "breath", streak: 5, completedToday: false, type: "ai", frequency: "daily" },
  { id: "sa-3", name: "One moment of gratitude before bed", icon: "heart", streak: 7, completedToday: false, type: "ai", frequency: "daily" },
  { id: "sa-4", name: "10 min walk outside",               icon: "walk",  streak: 3, completedToday: false, type: "ai", frequency: "daily" },
];

export const MOCK_HABIT_COMPLETIONS: Record<string, boolean[]> = {
  "sa-1": [true, true, false, true, true, true, false],
  "sa-3": [true, true, true,  true, false, true, true],
  "sa-4": [true, false, true, true, true, false, true],
};

// ── Weekly reviews ──────────────────────────────────────────────────────────────

export interface WeeklyReview {
  id: string;
  weekNumber: number;
  dateRange: string;
  opening: string;
  tasksCompleted: number;
  habitStreak: number;
  avgMorning: number;
  avgEvening: number;
  journalEntries: number;
  taskTypes: string[];
  moodArc: number[];
  morningArc: number[];
  eveningArc: number[];
  highlights: string[];
  focusNext: string;
  overallScore: number;
}

export const WEEKLY_REVIEWS: WeeklyReview[] = [
  {
    id: "w1",
    weekNumber: 1,
    dateRange: "Apr 28 – May 4",
    opening: "You showed up every single day this week — that's not nothing, it's everything. Your first week brought real moments of self-awareness, and the courage to keep going even when it felt uncomfortable.",
    tasksCompleted: 9,
    habitStreak: 3,
    avgMorning: 6.8,
    avgEvening: 5.9,
    journalEntries: 2,
    taskTypes: ["Breathing", "Journal", "Reflection"],
    moodArc: [3, 3, 4, 3, 4, 4, 5],
    morningArc: [7, 6, 7, 6, 5, 6, 6],
    eveningArc: [6, 5, 6, 5, 5, 6, 6],
    highlights: [
      "You completed your breathing exercise 5 out of 7 days — a strong start.",
      "Your evening anxiety score dropped from 7 to 5 by end of week.",
      "You wrote in your journal twice — more than most people do in week 1.",
    ],
    focusNext: "Try to extend your breathing habit to every single day. Even 3 minutes counts.",
    overallScore: 72,
  },
  {
    id: "w2",
    weekNumber: 2,
    dateRange: "May 1 – May 7",
    opening: "Week two and you're still here — that's the hardest part already done. You're building something real. Your numbers are moving in the right direction, and your consistency is starting to show.",
    tasksCompleted: 12,
    habitStreak: 5,
    avgMorning: 5.9,
    avgEvening: 5.1,
    journalEntries: 3,
    taskTypes: ["Breathing", "Mindfulness", "Reflection", "Journal"],
    moodArc: [4, 4, 5, 4, 5, 5, 6],
    morningArc: [6, 6, 5, 5, 6, 6, 5],
    eveningArc: [5, 5, 5, 4, 5, 5, 5],
    highlights: [
      "Your morning anxiety averaged 5.9 this week, down from 6.8 last week.",
      "You hit a 5-day habit streak — your longest yet.",
      "You completed 12 tasks, 33% more than last week.",
    ],
    focusNext: "Your afternoon slumps are showing in the data. Try a 2-minute grounding exercise at 3pm.",
    overallScore: 81,
  },
];

// ── AI-generated plan ──────────────────────────────────────────────────────────

export const AI_PLAN_KEY = "groundwork-ai-plan";

export interface AIPlan {
  planName: string;
  focusArea: string;
  summary: string;
  totalDays: number;
  habits: Array<{ name: string; icon: HabitIcon; frequency: HabitFrequency }>;
  days: Day[];
  createdAt: string;
}

export const STREAK = 4;

/** Days the user has fully completed (mock — days 1-4 done, today in progress). */
export const COMPLETED_DAYS: number[] = [1, 2, 3, 4];

/** Count consecutive completed days ending at `today`. */
export function computeStreak(completedDays: number[], today: number): number {
  let streak = 0;
  for (let d = today; d >= 1; d--) {
    if (completedDays.includes(d)) streak++;
    else break;
  }
  return streak;
}

/** Sum total tasks across all completed days. */
export function computeTasksDone(completedDays: number[], planDays: Day[]): number {
  return planDays
    .filter((d) => completedDays.includes(d.day))
    .reduce((sum, d) => sum + d.tasks.length, 0);
}
