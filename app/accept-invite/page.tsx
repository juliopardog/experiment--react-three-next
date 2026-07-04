"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError, errorMessage, setToken } from "@/lib/api";
import { TokenResponse } from "@/lib/types";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Card, ErrorNote, Input } from "@/components/app/ui";

type Problem = "invalid" | "existing_account" | "full" | null;

function AcceptInviteForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");

  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [problem, setProblem] = useState<Problem>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProblem(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      setProblem("invalid");
      return;
    }
    setLoading(true);
    try {
      const res = await api<TokenResponse>("/team/accept", {
        json: { token, password, full_name: fullName || undefined },
        noAuth: true,
      });
      setToken(res.access_token);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setProblem("invalid");
      } else if (err instanceof ApiError && err.status === 409) {
        setProblem("existing_account");
      } else if (err instanceof ApiError && err.status === 402) {
        setProblem("full");
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  if (problem === "invalid") {
    return (
      <Card>
        <h1 className="text-xl font-bold mb-2">Invitation not found</h1>
        <p className="text-sm text-white/55">
          This invitation is invalid or has expired. Ask whoever invited you
          to send a new one.
        </p>
      </Card>
    );
  }

  if (problem === "existing_account") {
    return (
      <Card>
        <h1 className="text-xl font-bold mb-2">Account already exists</h1>
        <p className="text-sm text-white/55 mb-6">
          That email already has an account — log in instead.
        </p>
        <Link href="/login">
          <Button className="w-full py-3">Log in</Button>
        </Link>
      </Card>
    );
  }

  if (problem === "full") {
    return (
      <Card>
        <h1 className="text-xl font-bold mb-2">This team is full</h1>
        <p className="text-sm text-white/55">
          The team you were invited to doesn&rsquo;t have a free seat right now.
          Ask an admin to upgrade the plan or free up a seat.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="text-xl font-bold mb-1">Join your team</h1>
      <p className="text-sm text-white/45 mb-6">Set a password to activate your account.</p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input
          label="Full name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Password"
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
          Join team
        </Button>
      </form>
    </Card>
  );
}

export default function AcceptInvitePage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <AcceptInviteForm />
      </Suspense>
    </AuthShell>
  );
}
