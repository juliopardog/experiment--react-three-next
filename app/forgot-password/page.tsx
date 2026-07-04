"use client";

import { useState } from "react";
import Link from "next/link";
import { ApiError, api, normalizeEmail } from "@/lib/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Card, ErrorNote, Input } from "@/components/app/ui";

const GENERIC_SUCCESS =
  "If that email has an account, we've sent a link to reset your password.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api("/auth/forgot", { json: { email: normalizeEmail(email) }, noAuth: true });
      setSent(GENERIC_SUCCESS);
    } catch (err) {
      // No account enumeration: any response other than a real rate limit
      // or connectivity failure still shows the same generic message.
      if (err instanceof ApiError && err.status === 429) {
        setError(err.message);
      } else if (err instanceof ApiError && err.status === 0) {
        setError(err.message);
      } else {
        setSent(GENERIC_SUCCESS);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-[#00D4FF] hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <Card>
        <h1 className="text-xl font-bold mb-1">Reset your password</h1>
        <p className="text-sm text-white/45 mb-6">
          Enter the email on your account and we&rsquo;ll send you a reset link.
        </p>

        {sent ? (
          <p className="text-sm text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl px-4 py-3">
            {sent}
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <ErrorNote message={error} />
            <Button type="submit" loading={loading} className="w-full py-3">
              Send reset link
            </Button>
          </form>
        )}
      </Card>
    </AuthShell>
  );
}
