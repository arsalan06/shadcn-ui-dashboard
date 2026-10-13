"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

/**
 * The editorial login form: underlined fields rather than boxes, a pill
 * submit, and no card chrome of its own — the page supplies the frame.
 */
export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Whatever the service said, verbatim. The old UI replaced every
        // failure with one fixed "account has been blocked" string.
        setError(data.message ?? "Sign in failed.");
        return;
      }

      startTransition(() => {
        router.replace(next);
        router.refresh();
      });
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || isPending;

  const field =
    "w-full border-0 border-b-[1.5px] border-border bg-transparent py-[11px] text-sm " +
    "outline-none transition-colors placeholder:text-muted-foreground " +
    "focus:border-foreground disabled:opacity-60";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
      <div>
        <label htmlFor="username" className="sr-only">
          Username
        </label>
        <input
          id="username"
          name="username"
          placeholder="Username"
          autoComplete="username"
          autoFocus
          required
          disabled={busy}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          disabled={busy}
          className={field}
        />
      </div>

      {error ? (
        <p role="alert" className="text-xs leading-snug text-red-600">
          {error}
        </p>
      ) : null}

      <div className="mt-1 flex items-center gap-3.5">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-[13px]
                     font-semibold text-background transition-opacity hover:opacity-90
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground
                     disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
          {busy ? null : <ArrowRight className="size-3.5" aria-hidden />}
        </button>

        <a
          href="#"
          className="text-[12.5px] text-muted-foreground underline-offset-4 hover:underline"
        >
          Forgot password
        </a>
      </div>
    </form>
  );
}
