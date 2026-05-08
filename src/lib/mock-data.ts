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

export const JOURNAL_PROMPT =
  "You showed up today. What's one thing that felt hard, and one thing that felt a little easier than before?";

export const STREAK = 4;
