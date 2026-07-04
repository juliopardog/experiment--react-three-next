"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Card, ErrorNote, Input } from "@/components/app/ui";

function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      setInvalid(true);
      return;
    }
    setLoading(true);
    try {
      await api("/auth/reset", { json: { token, new_password: password }, noAuth: true });
      setDone(true);
    } catch (err) {
      const ae = err as { status?: number };
      if (ae.status === 400) {
        setInvalid(true);
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Card>
        <h1 className="text-xl font-bold mb-2">Password reset</h1>
        <p className="text-sm text-white/55 mb-6">
          Your password has been updated. Any other signed-in sessions have
          been logged out for your security.
        </p>
        <Link href="/login">
          <Button className="w-full py-3">Log in</Button>
        </Link>
      </Card>
    );
  }

  if (invalid) {
    return (
      <Card>
        <h1 className="text-xl font-bold mb-2">Link expired</h1>
        <p className="text-sm text-white/55 mb-6">
          This reset link is invalid or has expired. Request a new one below.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full py-3">Request a new link</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="text-xl font-bold mb-6">Set a new password</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <ErrorNote message={error} />
        <Button type="submit" loading={loading} className="w-full py-3">
          Reset password
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
