"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { FocusArea } from "@/lib/mock-data";
import { AI_PLAN_KEY } from "@/lib/mock-data";
import BottomNav from "@/components/BottomNav";

// ── Types ─────────────────────────────────────────────────────────────────────

type LocalFocus = FocusArea | "write-myself";
interface Question { text: string; options: string[] }

// ── Static fallback questions (shown if API fails) ────────────────────────────

const FALLBACK_QUESTIONS: Record<string, Question[]> = {
  "Social Anxiety": [
    { text: "Which situations feel hardest for you?", options: ["Speaking up in a group", "Meeting new people", "Being the centre of attention", "Fear of being judged", "All social situations"] },
    { text: "How long have you been experiencing this?", options: ["Less than a year", "1–3 years", "3–5 years", "Most of my life"] },
    { text: "How much does it affect your daily life?", options: ["Mildly — I mostly manage", "Moderately — it holds me back", "Significantly — it affects most things"] },
    { text: "Have you worked on this before?", options: ["Not really", "I've tried some things on my own", "I've worked with a therapist or coach"] },
    { text: "What does success look like for you?", options: ["Feel calmer in social situations", "Speak up and be heard", "Make deeper connections", "Feel comfortable being myself"] },
  ],
  "Anxiety": [
    { text: "What does anxiety feel like for you most often?", options: ["Constant low-level worry", "Sudden intense waves", "Overthinking that won't stop", "Physical tension or restlessness"] },
    { text: "What tends to trigger it?", options: ["Work or performance pressure", "Relationships", "The future or uncertainty", "Social situations", "It can be anything"] },
    { text: "How does it affect your sleep?", options: ["Sleep is mostly fine", "I sometimes lie awake worrying", "Sleep is often disrupted", "I rarely sleep well"] },
    { text: "How long have you been dealing with this?", options: ["A few months", "About a year", "Several years", "As long as I can remember"] },
    { text: "What do you most want to change?", options: ["Quiet the mental noise", "Feel more in control", "React less intensely", "Just get through the day better"] },
  ],
  "Depression": [
    { text: "What's been hardest recently?", options: ["Low energy and motivation", "Feeling empty or flat", "Withdrawing from others", "A sense of hopelessness"] },
    { text: "How long have you been feeling this way?", options: ["A few weeks", "A few months", "Most of this year", "For a long time"] },
    { text: "What does your energy feel like most days?", options: ["Very low — hard to function", "Inconsistent — up and down", "Low but I push through", "Okay but emotionally flat"] },
    { text: "Have you sought support before?", options: ["Not yet", "I've tried some things", "Yes, in the past", "I'm currently getting support"] },
    { text: "What would feeling better look like?", options: ["More energy for things I love", "Finding joy in small moments", "A stable, consistent mood", "Just getting through each day"] },
  ],
  "Anger": [
    { text: "What usually triggers your anger?", options: ["Feeling unheard or dismissed", "Stress and pressure building up", "Unexpected changes or setbacks", "Specific people or situations"] },
    { text: "How do you typically express it?", options: ["I explode, then regret it", "I shut down and go cold", "I hold it in until I break", "It varies a lot"] },
    { text: "How quickly do you usually recover?", options: ["Within minutes", "A few hours", "It can take days", "It lingers for a long time"] },
    { text: "Has it affected important relationships?", options: ["Not really", "Sometimes, a little", "Yes, it's caused real damage"] },
    { text: "What do you most want to change?", options: ["React less intensely in the moment", "Understand what's really driving it", "Recover faster after flare-ups", "Communicate better when upset"] },
  ],
  "Confidence": [
    { text: "Where do you feel least confident?", options: ["In my career or at work", "In close relationships", "Socially with new people", "About my appearance", "It's everywhere"] },
    { text: "What holds you back the most?", options: ["Fear of failing", "Worrying what others think", "Comparing myself to others", "Not feeling good enough"] },
    { text: "How long have you felt this way?", options: ["Something recently changed", "A few years", "Most of my adult life", "Since I was young"] },
    { text: "What have you tried before?", options: ["Not much yet", "Self-help books or podcasts", "Journaling or reflection", "Coaching or therapy"] },
    { text: "What would more confidence give you?", options: ["Taking bigger risks and chances", "Speaking up and being heard", "Better, deeper relationships", "Feeling at home in my own skin"] },
  ],
  "Self-esteem": [
    { text: "What does low self-esteem feel like for you?", options: ["Constant self-criticism", "Feeling invisible or unimportant", "Assuming others don't like me", "Never feeling good enough"] },
    { text: "What triggers it most?", options: ["Comparisons to others", "Criticism or rejection", "Making mistakes", "Being around certain people"] },
    { text: "How long have you struggled with this?", options: ["Something recently changed", "A few years", "Most of my life", "I can't remember feeling different"] },
    { text: "How does it show up day-to-day?", options: ["I avoid putting myself out there", "I talk myself out of opportunities", "I struggle to accept compliments", "I apologise constantly"] },
    { text: "What do you hope to feel instead?", options: ["Secure in who I am", "Worthy of love and good things", "Comfortable in my own skin", "Proud of myself"] },
  ],
  "write-myself": [
    { text: "How long has this been affecting you?", options: ["A few months", "About a year", "Several years", "A long time"] },
    { text: "How much does it impact your daily life?", options: ["A little — I mostly cope", "Quite a bit", "Significantly — it's hard to ignore"] },
    { text: "Have you worked on this before?", options: ["Not really", "A little, on my own", "Yes, with professional support"] },
    { text: "What approach resonates most with you?", options: ["Reflection and journaling", "Learning and understanding", "Practical exercises", "Just getting started"] },
    { text: "What does success look like to you?", options: ["More clarity and self-awareness", "Feeling calmer and more grounded", "Stronger relationships", "A better sense of who I am"] },
  ],
};

const GOAL_PROMPTS: Record<string, string> = {
  "Social Anxiety": "How does social anxiety show up in your life?",
  "Anxiety":        "What does anxiety feel like for you day to day?",
  "Depression":     "How would you describe how you've been feeling?",
  "Anger":          "Tell us a bit about how anger shows up for you.",
  "Confidence":     "What made you decide to work on your confidence?",
  "Self-esteem":    "Tell us a bit about how you see yourself right now.",
  "write-myself":   "Describe what you'd like to work on.",
};

const GOAL_PREFILL: Record<string, string> = {
  "Social Anxiety": "I feel nervous in social situations and it stops me from fully connecting with others.",
  "Anxiety":        "I worry a lot and find it hard to switch off. It affects my sleep and my ability to be present.",
  "Depression":     "I've been feeling low, unmotivated, and disconnected from things I used to enjoy.",
  "Anger":          "I struggle to manage my reactions, and I know it's affecting the people around me.",
  "Confidence":     "I often doubt myself and hold back because I'm afraid of failing or being judged.",
  "Self-esteem":    "I struggle to feel good about myself and often feel like I'm not enough.",
  "write-myself":   "",
};

const DURATIONS = [{ label: "7 days", value: 7 }, { label: "14 days", value: 14 }, { label: "30 days", value: 30 }];
const FOCUS_AREAS: FocusArea[] = ["Social Anxiety", "Depression", "Anxiety", "Anger", "Confidence", "Self-esteem"];
const ONBOARDING_FLAG = "hasCompletedOnboarding";
const TOTAL_STEPS = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

function LeafIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12"/><path d="M12 12C7 10 4 6 5 2c4 0 9 3 7 10z"/><path d="M12 12C17 10 20 6 19 2c-4 0-9 3-7 10z"/>
    </svg>
  );
}

function LoadingScreen({ message = "Building your plan…", sub = "Personalizing your journey" }: { message?: string; sub?: string }) {
  return (
    <div className="fixed inset-0 flex justify-center" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-[390px] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-[20px] flex items-center justify-center" style={{ background: "var(--accent-nourish)" }}>
          <LeafIcon />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>{message}</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{sub}</p>
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

function QuestionSkeleton() {
  return (
    <div className="px-6 pt-12 pb-10 animate-pulse">
      <div className="h-3 w-24 rounded-full mb-4" style={{ background: "var(--border)" }} />
      <div className="h-6 w-full rounded-full mb-2" style={{ background: "var(--border)" }} />
      <div className="h-6 w-3/4 rounded-full mb-8" style={{ background: "var(--border)" }} />
      <div className="flex flex-wrap gap-2.5 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 rounded-full" style={{ background: "var(--border)", width: `${80 + i * 20}px` }} />
        ))}
      </div>
      <div className="h-14 rounded-2xl" style={{ background: "var(--border)" }} />
    </div>
  );
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? "60%" : "-60%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d > 0 ? "-30%" : "30%", opacity: 0 }),
};
const slideTx = { type: "tween" as const, ease: [0.32, 0, 0.18, 1] as const, duration: 0.28 };

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [focus, setFocus] = useState<LocalFocus | null>(null);
  const [goalText, setGoalText] = useState("");
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);

  useEffect(() => {
    try { setIsReturning(localStorage.getItem(ONBOARDING_FLAG) === "true"); } catch { /* ignore */ }
  }, []);

  const focusKey = focus ?? "write-myself";
  const fallbackQuestions = FALLBACK_QUESTIONS[focusKey] ?? FALLBACK_QUESTIONS["write-myself"];

  const getQuestion = (qi: number): Question | null => dynamicQuestions[qi] ?? null;

  const fetchQuestion = async (qi: number): Promise<Question> => {
    const previousQA = Array.from({ length: qi }, (_, i) => {
      const q = getQuestion(i);
      return { question: q?.text ?? "", answers: answers[i] ?? [] };
    });

    const res = await fetch("/api/onboarding/next-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focus: focusKey, goal: goalText, questionIndex: qi, previousQA }),
    });

    if (!res.ok) throw new Error("API error");
    return res.json();
  };

  const fetchAndAdvance = async (nextQI: number) => {
    setDir(1);
    setStep(s => s + 1);
    setQuestionLoading(true);
    try {
      const q = await fetchQuestion(nextQI);
      setDynamicQuestions(prev => { const next = [...prev]; next[nextQI] = q; return next; });
    } catch {
      setDynamicQuestions(prev => { const next = [...prev]; next[nextQI] = fallbackQuestions[nextQI]; return next; });
    } finally {
      setQuestionLoading(false);
    }
  };

  const advance = async () => {
    if (step === 0) {
      if (focus && focus !== "write-myself" && !goalText) setGoalText(GOAL_PREFILL[focus] ?? "");
      setDir(1);
      setStep(1);
      return;
    }
    if (step === 1) { await fetchAndAdvance(0); return; }
    if (step >= 2 && step <= 5) { await fetchAndAdvance(step - 1); return; }
    setDir(1);
    setStep(s => s + 1);
  };

  const goBack = () => { setDir(-1); setStep(s => s - 1); };

  const handleBuildPlan = async () => {
    setLoading(true);
    try { localStorage.setItem(ONBOARDING_FLAG, "true"); } catch { /* ignore */ }

    const questionsAndAnswers = Array.from({ length: 5 }, (_, i) => {
      const q = dynamicQuestions[i] ?? fallbackQuestions[i];
      return { question: q?.text ?? "", answers: answers[i] ?? [] };
    });

    try {
      const res = await fetch("/api/onboarding/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus: focusKey, goal: goalText, questionsAndAnswers, duration }),
      });

      if (res.ok) {
        const plan = await res.json();
        try {
          localStorage.setItem(AI_PLAN_KEY, JSON.stringify({
            ...plan,
            focusArea: focusKey,
            totalDays: duration,
            createdAt: new Date().toISOString(),
          }));
        } catch { /* ignore */ }
      }
    } catch { /* ignore — fall back to mock plan */ }

    router.push("/auth");
  };

  if (loading) return <LoadingScreen />;

  const renderStep = () => {
    // ── Step 0: Focus area ────────────────────────────────────────────────────
    if (step === 0) return (
      <div className="px-6 pt-12 pb-10">
        <div className="flex items-center gap-1.5 mb-3" style={{ color: "var(--green)" }}>
          <LeafIcon /><p className="text-sm font-medium">Welcome</p>
        </div>
        <h1 className="font-bold leading-[1.15] mb-3"
          style={{ fontSize: "clamp(28px, 8vw, 34px)", color: "var(--foreground)", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          What would you like to work on?
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--muted)" }}>
          Choose a focus area, or describe it in your own words.
        </p>
        <div className="flex flex-wrap gap-2 mb-10">
          {FOCUS_AREAS.map((area) => (
            <button key={area} type="button" onClick={() => setFocus(area)}
              style={{
                padding: "8px 16px", borderRadius: "9999px", fontSize: "14px", fontWeight: 500, cursor: "pointer",
                background: focus === area ? "#1C1C1E" : "var(--card)",
                color: focus === area ? "#fff" : "var(--foreground)",
                border: `1.5px solid ${focus === area ? "#1C1C1E" : "var(--border)"}`,
              }}>
              {area}
            </button>
          ))}
          <button type="button" onClick={() => setFocus("write-myself")}
            style={{
              padding: "8px 16px", borderRadius: "9999px", fontSize: "14px", fontWeight: 500, cursor: "pointer",
              background: focus === "write-myself" ? "#1C1C1E" : "var(--card)",
              color: focus === "write-myself" ? "#fff" : "var(--foreground)",
              border: `1.5px dashed ${focus === "write-myself" ? "#1C1C1E" : "var(--border)"}`,
            }}>
            ✏️ Write myself
          </button>
        </div>
        <button type="button" disabled={!focus} onClick={advance}
          style={{
            width: "100%", padding: "16px", borderRadius: "16px", fontSize: "16px", fontWeight: 600, border: "none",
            cursor: focus ? "pointer" : "not-allowed",
            background: focus ? "#1C1C1E" : "var(--border)",
            color: focus ? "#fff" : "var(--muted)",
          }}>
          Continue
        </button>
      </div>
    );

    // ── Step 1: Goal text ─────────────────────────────────────────────────────
    if (step === 1) {
      const canContinue = goalText.trim().length > 0;
      return (
        <div className="px-6 pt-12 pb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>
            {focus === "write-myself" ? "Your goal" : focus}
          </p>
          <h2 className="text-2xl font-bold mb-2"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", color: "var(--foreground)", lineHeight: 1.25 }}>
            {GOAL_PROMPTS[focusKey]}
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            There's no right answer — just what feels true for you.
          </p>
          <textarea
            className="w-full rounded-2xl px-4 py-4 text-[15px] leading-relaxed resize-none outline-none"
            style={{
              background: "var(--card)", color: "var(--foreground)",
              border: `1.5px solid ${canContinue ? "#1C1C1E" : "var(--border)"}`,
              minHeight: 140, fontFamily: "inherit", transition: "border-color 0.2s ease",
            }}
            placeholder={GOAL_PREFILL[focusKey] || "Write in your own words…"}
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            rows={5}
            autoFocus
          />
          <p className="text-xs mt-3 mb-6" style={{ color: "var(--muted)" }}>
            ✦ AI will use this to personalise your questions and plan
          </p>
          <button type="button" disabled={!canContinue} onClick={advance}
            style={{
              width: "100%", padding: "16px", borderRadius: "16px", fontSize: "16px", fontWeight: 600, border: "none",
              cursor: canContinue ? "pointer" : "not-allowed",
              background: canContinue ? "#1C1C1E" : "var(--border)",
              color: canContinue ? "#fff" : "var(--muted)",
            }}>
            Continue
          </button>
        </div>
      );
    }

    // ── Steps 2–6: Questions ──────────────────────────────────────────────────
    if (step >= 2 && step <= 6) {
      if (questionLoading) return <QuestionSkeleton />;

      const qi = step - 2;
      const q = dynamicQuestions[qi] ?? fallbackQuestions[qi];
      const selected = answers[qi] ?? [];
      const hasSelection = selected.length > 0;

      const toggle = (opt: string) => setAnswers(a => {
        const prev = a[qi] ?? [];
        return { ...a, [qi]: prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt] };
      });

      return (
        <div className="px-6 pt-12 pb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
            Question {qi + 1} of 5
          </p>
          <h2 className="text-xl font-bold mb-2"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", color: "var(--foreground)", lineHeight: 1.3 }}>
            {q.text}
          </h2>
          <p className="text-xs mb-6" style={{ color: "var(--muted)" }}>Select all that apply</p>
          <div className="flex flex-wrap gap-2.5 mb-8">
            {q.options.map((opt) => {
              const active = selected.includes(opt);
              return (
                <button key={opt} type="button" onClick={() => toggle(opt)}
                  className="text-left px-4 py-2.5 rounded-full text-sm font-medium"
                  style={{
                    background: active ? "#1C1C1E" : "var(--card)",
                    color: active ? "#fff" : "var(--foreground)",
                    border: `1.5px solid ${active ? "#1C1C1E" : "var(--border)"}`,
                    cursor: "pointer", transition: "background 0.15s ease, color 0.15s ease",
                  }}>
                  {opt}
                </button>
              );
            })}
          </div>
          <button type="button" disabled={!hasSelection} onClick={advance}
            style={{
              width: "100%", padding: "16px", borderRadius: "16px", fontSize: "16px", fontWeight: 600, border: "none",
              cursor: hasSelection ? "pointer" : "not-allowed",
              background: hasSelection ? "#1C1C1E" : "var(--border)",
              color: hasSelection ? "#fff" : "var(--muted)",
            }}>
            {step === 6 ? "Almost there →" : "Next"}
          </button>
        </div>
      );
    }

    // ── Step 7: Duration ──────────────────────────────────────────────────────
    if (step === 7) return (
      <div className="px-6 pt-12 pb-10">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Last step</p>
        <h2 className="text-2xl font-bold mb-2"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", color: "var(--foreground)" }}>
          How long should your plan be?
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>You can adjust this any time.</p>
        <div className="flex gap-2 mb-10">
          {DURATIONS.map((d) => (
            <button key={d.value} type="button" onClick={() => setDuration(d.value)}
              className="flex-1 py-4 rounded-2xl text-sm font-semibold"
              style={{
                background: duration === d.value ? "#1C1C1E" : "var(--card)",
                color: duration === d.value ? "#fff" : "var(--foreground)",
                border: `1.5px solid ${duration === d.value ? "#1C1C1E" : "var(--border)"}`,
                cursor: "pointer",
              }}>
              {d.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={handleBuildPlan}
          style={{ width: "100%", padding: "16px", borderRadius: "16px", fontSize: "16px", fontWeight: 600, border: "none", cursor: "pointer", background: "#1C1C1E", color: "#fff" }}>
          Build my plan →
        </button>
      </div>
    );

    return null;
  };

  return (
    <div className="flex justify-center min-h-screen" style={{ background: "var(--background)" }}>
      {isReturning && <BottomNav />}
      <div className="w-full max-w-[390px] min-h-screen flex flex-col relative"
        style={{ overflowX: "hidden", paddingBottom: isReturning ? 72 : 0 }}>

        {/* Plant — step 0 only */}
        {step === 0 && (
          <Image src="/plant.png" alt="" width={220} height={300} priority
            className="absolute pointer-events-none select-none"
            style={{ top: "-1rem", right: "-2rem", opacity: 0.6, zIndex: 0, objectFit: "contain", objectPosition: "top right" }} />
        )}

        {/* Progress bar + back */}
        <div className="flex-none px-5 pt-5 pb-2" style={{ position: "relative", zIndex: 2 }}>
          {step > 0 && (
            <button type="button" onClick={goBack}
              className="flex items-center gap-1 text-sm font-medium mb-3"
              style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
          )}
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div style={{
              height: "100%", borderRadius: "9999px", background: "#1C1C1E",
              width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>

        {/* Animated step content */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTx}
              style={{ position: "absolute", inset: 0, overflowY: "auto" }}
            >
              <div style={{ position: "relative", zIndex: 1, minHeight: "100%" }}>
                {renderStep()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
