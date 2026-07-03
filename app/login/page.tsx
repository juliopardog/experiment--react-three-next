"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, errorMessage, setToken } from "@/lib/api";
import { Campaign, TokenResponse } from "@/lib/types";
import { Button, Card, ErrorNote, Input } from "@/components/app/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await api<TokenResponse>("/auth/token", {
        form: { username: email, password },
        noAuth: true,
      });
      setToken(token.access_token);
      // First login with no campaigns yet → onboarding
      const campaigns = await api<Campaign[]>("/campaigns", { params: { limit: 1 } });
      router.replace(campaigns.length === 0 ? "/onboarding" : "/dashboard");
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/logo-icon.png" alt="PolloLabs" width={34} height={34} />
          <span className="text-2xl font-bold tracking-tight gradient-text">PolloLabs</span>
        </Link>

        <Card>
          <h1 className="text-xl font-bold mb-6">Log in</h1>
          <form onSubmit={submit} className="flex flex-col gap-4">
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <ErrorNote message={error} />
            <Button type="submit" loading={loading} className="w-full py-3">
              Log in
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-white/40 mt-6">
          No account yet?{" "}
          <Link href="/signup" className="text-[#00D4FF] hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
