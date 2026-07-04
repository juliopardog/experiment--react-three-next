"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, errorMessage, normalizeEmail, setToken } from "@/lib/api";
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
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms, Privacy Policy, and Acceptable Use Policy to continue.");
      return;
    }
    setLoading(true);
    try {
      const normalizedEmail = normalizeEmail(email);
      await api("/auth/register", {
        json: { email: normalizedEmail, password, full_name: fullName, org_name: orgName },
        noAuth: true,
      });
      const token = await api<TokenResponse>("/auth/token", {
        form: { username: normalizedEmail, password },
        noAuth: true,
      });
      setToken(token.access_token);

      // Came from a paid pricing CTA → straight to checkout, then onboarding
      if (planParam && PAID_PLANS.includes(planParam)) {
        try {
          const { checkout_url } = await api<{ checkout_url: string }>("/billing/checkout", {
            json: {
              plan: planParam,
              success_url: `${window.location.origin}/onboarding?welcome=1`,
              cancel_url: `${window.location.origin}/onboarding?welcome=1`,
            },
          });
          window.location.href = checkout_url;
          return;
        } catch {
          // checkout hiccup shouldn't block a fresh signup — they can upgrade later
        }
      }
      router.replace("/onboarding?welcome=1");
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
        <label className="flex items-start gap-2.5 text-xs text-white/45 leading-relaxed">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-[#00D4FF]"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="text-[#00D4FF] hover:underline">
              Terms of Service
            </Link>
            ,{" "}
            <Link href="/privacy" target="_blank" className="text-[#00D4FF] hover:underline">
              Privacy Policy
            </Link>
            , and{" "}
            <Link href="/acceptable-use" target="_blank" className="text-[#00D4FF] hover:underline">
              Acceptable Use Policy
            </Link>
            , including my responsibility for every email I send.
          </span>
        </label>
        <ErrorNote message={error} />
        <Button type="submit" loading={loading} disabled={!agreed} className="w-full py-3">
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
