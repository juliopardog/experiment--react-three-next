"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, errorMessage, setToken } from "@/lib/api";
import { TokenResponse } from "@/lib/types";
import { Button, Card, ErrorNote, Input } from "@/components/app/ui";

const PAID_PLANS = ["pro", "growth"];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await api("/auth/register", {
        json: { email, password, full_name: fullName, org_name: orgName },
        noAuth: true,
      });
      const token = await api<TokenResponse>("/auth/token", {
        form: { username: email, password },
        noAuth: true,
      });
      setToken(token.access_token);

      // Came from a paid pricing CTA → straight to checkout, then onboarding
      if (planParam && PAID_PLANS.includes(planParam)) {
        try {
          const { checkout_url } = await api<{ checkout_url: string }>("/billing/checkout", {
            json: {
              plan: planParam,
              success_url: `${window.location.origin}/onboarding`,
              cancel_url: `${window.location.origin}/onboarding`,
            },
          });
          window.location.href = checkout_url;
          return;
        } catch {
          // checkout hiccup shouldn't block a fresh signup — they can upgrade later
        }
      }
      router.replace("/onboarding");
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Card>
      <h1 className="text-xl font-bold mb-1">Create your account</h1>
      <p className="text-sm text-white/45 mb-6">
        Free plan — no credit card required.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input
          label="Full name"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Company name"
          autoComplete="organization"
          required
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          Create account
        </Button>
      </form>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/logo-icon.png" alt="PolloLabs" width={34} height={34} />
          <span className="text-2xl font-bold tracking-tight gradient-text">PolloLabs</span>
        </Link>

        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>

        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#00D4FF] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
