"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ApiError, normalizeEmail } from "@/lib/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Card, ErrorNote, Input, Spinner } from "@/components/app/ui";

type State = "checking" | "verified" | "invalid";

function VerifyEmailForm() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState<State>("checking");

  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    api("/auth/verify", { json: { token }, noAuth: true })
      .then(() => setState("verified"))
      .catch(() => setState("invalid"));
  }, [token]);

  const resend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError(null);
    setResendMsg(null);
    setResending(true);
    try {
      await api("/auth/resend-verification", {
        json: { email: normalizeEmail(resendEmail) },
        noAuth: true,
      });
      setResendMsg("If that email needs verifying, we've sent a new link.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setResendError(err.message);
      } else {
        setResendMsg("If that email needs verifying, we've sent a new link.");
      }
    } finally {
      setResending(false);
    }
  };

  if (state === "checking") {
    return (
      <Card>
        <div className="flex items-center gap-3 py-4">
          <Spinner />
          <span className="text-sm text-white/60">Verifying your email…</span>
        </div>
      </Card>
    );
  }

  if (state === "verified") {
    return (
      <Card>
        <h1 className="text-xl font-bold mb-2">Email verified!</h1>
        <p className="text-sm text-white/55 mb-6">
          You&rsquo;re all set. You can now send campaigns from your account.
        </p>
        <Link href="/dashboard">
          <Button className="w-full py-3">Go to dashboard</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="text-xl font-bold mb-2">Link expired</h1>
      <p className="text-sm text-white/55 mb-6">
        This verification link is invalid or has expired. Enter your email and
        we&rsquo;ll send a new one.
      </p>
      {resendMsg ? (
        <p className="text-sm text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl px-4 py-3">
          {resendMsg}
        </p>
      ) : (
        <form onSubmit={resend} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
          />
          <ErrorNote message={resendError} />
          <Button type="submit" loading={resending} className="w-full py-3">
            Resend verification email
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <VerifyEmailForm />
      </Suspense>
    </AuthShell>
  );
}
