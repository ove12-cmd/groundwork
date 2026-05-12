"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AI_PLAN_KEY } from "@/lib/mock-data";

type Mode = "signup" | "login";


function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function InputField({
  label, type, placeholder, value, onChange,
}: {
  label: string; type: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type={isPassword ? (showPw ? "text" : "password") : type}
          placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={isPassword ? "current-password" : type === "email" ? "email" : "name"}
          style={{
            background: "var(--card)", color: "var(--foreground)",
            border: "1.5px solid var(--border)", borderRadius: 14,
            padding: isPassword ? "13px 44px 13px 16px" : "13px 16px",
            fontSize: 15, fontFamily: "inherit", outline: "none", width: "100%",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#1C1C1E")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => { setShowPw(v => !v); inputRef.current?.focus(); }}
            style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "var(--muted)",
              display: "flex", alignItems: "center", padding: 0,
            }}
            tabIndex={-1}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            <EyeIcon visible={showPw} />
          </button>
        )}
      </div>
    </div>
  );
}

async function savePendingPlan(supabase: ReturnType<typeof createClient>, userId: string) {
  try {
    const raw = localStorage.getItem(AI_PLAN_KEY);
    if (!raw) return;
    const plan = JSON.parse(raw);
    await supabase.from("plans").insert({
      user_id: userId,
      name: plan.planName ?? plan.focusArea ?? "My Plan",
      focus_area: plan.focusArea,
      summary: plan.summary,
      goal: plan.goal,
      total_days: plan.totalDays ?? 30,
      completed_days: 0,
      status: "active",
      plan_days: plan.days,
      habits: plan.habits,
      is_active: true,
    });
    localStorage.removeItem(AI_PLAN_KEY);
  } catch (err) {
    console.error("Failed to save pending plan:", err);
  }
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const isSignup = mode === "signup";
  const supabase = createClient();

  const handleContinue = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) { setError(error.message); return; }
        if (data.user) {
          if (name) {
            try { localStorage.setItem("groundwork-user-name", name); } catch { /* ignore */ }
            supabase.from("profiles").upsert({ id: data.user.id, name }).then(() => {});
          }
          await savePendingPlan(supabase, data.user.id);
          if (data.session) {
            router.push("/plan");
          } else {
            setCheckEmail(true);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(error.message); return; }
        if (data.user) {
          // Cache name from profile if not already stored
          const storedName = localStorage.getItem("groundwork-user-name");
          if (!storedName) {
            supabase.from("profiles").select("name").eq("id", data.user.id).maybeSingle()
              .then(({ data: p }) => { if (p?.name) { try { localStorage.setItem("groundwork-user-name", p.name); } catch { /* ignore */ } } });
          }
          await savePendingPlan(supabase, data.user.id);
          router.push("/plan");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  };

  const handleFacebook = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  };

  if (checkEmail) {
    return (
      <div className="flex justify-center min-h-screen" style={{ background: "var(--background)" }}>
        <div className="w-full max-w-[390px] flex flex-col items-center justify-center px-6 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "var(--card)" }}>
            ✉️
          </div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-playfair), serif" }}>
            Check your email
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back to log in.
          </p>
          <button type="button" onClick={() => { setCheckEmail(false); setMode("login"); }}
            className="text-sm font-semibold mt-2" style={{ color: "var(--foreground)", background: "none", border: "none", cursor: "pointer" }}>
            Back to log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-[390px] flex flex-col px-6 pt-14 pb-10">

        {/* Mode toggle */}
        <div className="flex self-center mb-10 rounded-full p-1" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {(["signup", "login"] as const).map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(null); }}
              style={{
                padding: "7px 22px", borderRadius: 9999, fontSize: 13, fontWeight: 600,
                background: mode === m ? "#1C1C1E" : "transparent",
                color: mode === m ? "#ffffff" : "var(--muted)",
                border: "none", cursor: "pointer", transition: "background 0.18s ease, color 0.18s ease",
              }}>
              {m === "signup" ? "Sign up" : "Log in"}
            </button>
          ))}
        </div>

        <h1 className="text-3xl font-bold mb-2"
          style={{ color: "var(--foreground)", fontFamily: "var(--font-playfair), 'Playfair Display', serif", lineHeight: 1.2 }}>
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          {isSignup ? "Your plan is ready — let's save your progress." : "Sign in to continue your journey."}
        </p>

        {/* Social buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <button type="button" onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: "var(--card)", color: "var(--foreground)", border: "1.5px solid var(--border)" }}>
            <GoogleIcon />
            Continue with Google
          </button>
          <button type="button" onClick={handleFacebook}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: "var(--card)", color: "var(--foreground)", border: "1.5px solid var(--border)" }}>
            <FacebookIcon />
            Continue with Facebook
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 mb-4">
          {isSignup && (
            <InputField label="Full name" type="text" placeholder="Your name" value={name} onChange={setName} />
          )}
          <InputField label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
          <InputField
            label="Password" type="password"
            placeholder={isSignup ? "Create a password (min 6 chars)" : "Your password"}
            value={password} onChange={setPassword}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm mb-4 px-1" style={{ color: "#c0392b" }}>{error}</p>
        )}

        {/* Primary CTA */}
        <button type="button" onClick={handleContinue} disabled={loading || !email || !password}
          className="w-full py-4 rounded-2xl text-base font-semibold mb-5"
          style={{
            background: loading || !email || !password ? "var(--border)" : "#1C1C1E",
            color: loading || !email || !password ? "var(--muted)" : "#ffffff",
            border: "none", cursor: loading || !email || !password ? "not-allowed" : "pointer",
          }}>
          {loading ? "Please wait…" : "Continue"}
        </button>

        <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
          {isSignup ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <button type="button" onClick={() => { setMode(isSignup ? "login" : "signup"); setError(null); }}
            className="font-semibold" style={{ color: "var(--foreground)", background: "none", border: "none", cursor: "pointer" }}>
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>

      </div>
    </div>
  );
}
