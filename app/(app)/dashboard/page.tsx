"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, errorMessage } from "@/lib/api";
import { Campaign } from "@/lib/types";
import { useOrg } from "@/components/app/AppShell";
import { Button, Card, Chip, EmptyState, ErrorNote, Meter, Spinner } from "@/components/app/ui";

export default function DashboardPage() {
  const { org } = useOrg();
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Campaign[]>("/campaigns", { params: { limit: 50 } })
      .then(setCampaigns)
      .catch((err) => setError(errorMessage(err)));
  }, []);

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/onboarding">
          <Button>New campaign</Button>
        </Link>
      </div>

      {org && (
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <p className="text-sm text-white/45 mb-1">Current plan</p>
              <p className="text-xl font-bold capitalize">{org.plan}</p>
            </div>
            <div className="sm:w-80">
              <Meter used={org.sends_this_month} limit={org.monthly_send_limit} />
              <p className="text-xs text-white/35 mt-2">
                {org.sends_remaining.toLocaleString()} sends remaining ·{" "}
                <Link href="/settings/billing" className="text-[#00D4FF] hover:underline">
                  Upgrade
                </Link>
              </p>
            </div>
          </div>
        </Card>
      )}

      <ErrorNote message={error} />

      {campaigns === null && !error && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {campaigns && campaigns.length === 0 && (
        <Card>
          <EmptyState
            title="Create your first campaign"
            body="Tell PolloLabs who you are and what you sell, then watch it find leads and write your first batch of emails."
            action={
              <Link href="/onboarding">
                <Button>Create your first campaign</Button>
              </Link>
            }
          />
        </Card>
      )}

      {campaigns && campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <Link key={c.id} href={`/campaigns/${c.id}`}>
              <Card className="hover:border-[#00D4FF]/30 transition-colors cursor-pointer h-full">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-lg leading-snug">{c.name}</h3>
                  <Chip value={c.status} />
                </div>
                {c.persona_prompt && (
                  <p className="text-sm text-white/40 line-clamp-2">{c.persona_prompt}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
