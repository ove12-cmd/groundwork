"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "signup" | "login";

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.07-.5-2.05-.48-3.17 0-1.42.62-2.16.44-3.02-.38C2.79 15.19 3.51 7.7 9 7.44c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.32 3.1-2.48 3.95zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
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

function InputField({
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "name"}
        style={{
          background: "var(--card)",
          color: "var(--foreground)",
          border: "1.5px solid var(--border)",
          borderRadius: 14,
          padding: "13px 16px",
          fontSize: 15,
          fontFamily: "inherit",
          outline: "none",
          width: "100%",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#1C1C1E")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSignup = mode === "signup";

  const handleContinue = () => {
    router.push("/plan");
  };

  return (
    <div
      className="flex justify-center min-h-screen"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-[390px] flex flex-col px-6 pt-14 pb-10">

        {/* Mode toggle */}
        <div
          className="flex self-center mb-10 rounded-full p-1"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          {(["signup", "login"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                padding: "7px 22px",
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                background: mode === m ? "#1C1C1E" : "transparent",
                color: mode === m ? "#ffffff" : "var(--muted)",
                border: "none",
                cursor: "pointer",
                transition: "background 0.18s ease, color 0.18s ease",
              }}
            >
              {m === "signup" ? "Sign up" : "Log in"}
            </button>
          ))}
        </div>

        {/* Heading */}
        <h1
          className="text-3xl font-bold mb-2"
          style={{
            color: "var(--foreground)",
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            lineHeight: 1.2,
          }}
        >
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          {isSignup
            ? "Your plan is ready — let's save your progress."
            : "Sign in to continue your journey."}
        </p>

        {/* Social buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold"
            style={{
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1.5px solid var(--border)",
            }}
          >
            <AppleIcon />
            Continue with Apple
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold"
            style={{
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1.5px solid var(--border)",
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 mb-6">
          {isSignup && (
            <InputField
              label="Full name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={setName}
            />
          )}
          <InputField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
          />
          <InputField
            label="Password"
            type="password"
            placeholder={isSignup ? "Create a password" : "Your password"}
            value={password}
            onChange={setPassword}
          />
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl text-base font-semibold mb-5"
          style={{ background: "#1C1C1E", color: "#ffffff", border: "none" }}
        >
          Continue
        </button>

        {/* Switch mode link */}
        <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
          {isSignup ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <button
            type="button"
            onClick={() => setMode(isSignup ? "login" : "signup")}
            className="font-semibold"
            style={{ color: "var(--foreground)", background: "none", border: "none", cursor: "pointer" }}
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>

      </div>
    </div>
  );
}
