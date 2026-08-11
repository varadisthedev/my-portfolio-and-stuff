"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        const minutes = retryAfter ? Math.ceil(Number(retryAfter) / 60) : null;
        setError(minutes ? `Too many attempts. Try again in ${minutes} min.` : "Too many attempts. Try again later.");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xs rounded-lg border border-border bg-bg-panel p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
    >
      <div className="mb-5 flex items-center gap-2 text-text-dim">
        <Lock size={14} />
        <span className="text-xs tracking-widest">admin login</span>
      </div>

      <label className="mb-3 block text-xs text-text-dim">
        username
        <input
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-border-bright"
        />
      </label>

      <label className="mb-4 block text-xs text-text-dim">
        password
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-border-bright"
        />
      </label>

      {error ? <p className="mb-4 text-xs text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border border-border-bright bg-surface-raised py-2 text-sm text-accent transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "signing in…" : "sign in"}
      </button>
    </form>
  );
}
