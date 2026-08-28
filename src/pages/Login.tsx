import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    const result = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === "signup") {
      setNotice("Account created — check your email to confirm, then sign in.");
      setMode("signin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-2 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
            style={{ background: `linear-gradient(135deg, var(--sidebar-from), var(--sidebar-to))` }}
          >
            <Sparkles size={18} />
          </div>
          <span className="font-semibold text-ink text-lg">Intelligent CRM</span>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-hairline bg-surface-1 p-6 flex flex-col gap-4"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div>
            <h1 className="text-lg font-semibold text-ink">
              {mode === "signin" ? "Sign in" : "Create an account"}
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              {mode === "signin" ? "Welcome back to the pipeline." : "Set up access to the team's pipeline."}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {error && (
            <p className="text-xs rounded-md px-3 py-2" style={{ background: "color-mix(in srgb, var(--status-critical) 10%, transparent)", color: "var(--status-critical)" }}>
              {error}
            </p>
          )}
          {notice && (
            <p className="text-xs rounded-md px-3 py-2" style={{ background: "color-mix(in srgb, var(--status-good) 12%, transparent)", color: "var(--success-text)" }}>
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
            className="text-xs text-ink-muted hover:text-ink-secondary"
          >
            {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
