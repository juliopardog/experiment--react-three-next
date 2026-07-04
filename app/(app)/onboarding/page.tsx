"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { Campaign } from "@/lib/types";
import { Button, Card, ErrorNote, Input, Textarea } from "@/components/app/ui";

function WelcomeNotice() {
  const welcome = useSearchParams().get("welcome") === "1";
  const [dismissed, setDismissed] = useState(false);
  if (!welcome || dismissed) return null;
  return (
    <div className="flex items-start justify-between gap-4 text-sm text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl px-4 py-3 mb-6">
      <span>Account created — check your email to verify your address.</span>
      <button
        onClick={() => setDismissed(true)}
        className="text-[#22c55e]/60 hover:text-[#22c55e] shrink-0"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const campaign = await api<Campaign>("/campaigns", {
        json: { name, persona_prompt: persona },
      });
      router.replace(`/campaigns/${campaign.id}`);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pt-8">
      <Suspense fallback={null}>
        <WelcomeNotice />
      </Suspense>

      <h1 className="text-3xl font-bold mb-2">Create your campaign</h1>
      <p className="text-white/50 text-sm mb-8 leading-relaxed">
        A campaign groups your leads, emails, and follow-ups around one offer.
        You can run several at once.
      </p>

      <Card>
        <form onSubmit={submit} className="flex flex-col gap-5">
          <Input
            label="Campaign name"
            placeholder="e.g. Austin dentists — spring offer"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            label="Who are you and what do you sell?"
            placeholder="e.g. I'm Julio, founder of a web design studio. We build modern websites for local clinics that bring in new patient bookings. Typical project is $2-4k, done in 3 weeks."
            hint="The AI uses this to write every email — the more specific you are about who you are, what you sell, and who it helps, the better each email reads."
            required
            rows={6}
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
          />
          <ErrorNote message={error} />
          <Button type="submit" loading={loading} className="self-start px-8 py-3">
            Create campaign
          </Button>
        </form>
      </Card>
    </div>
  );
}
