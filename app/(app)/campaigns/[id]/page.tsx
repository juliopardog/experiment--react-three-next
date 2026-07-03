"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { Campaign } from "@/lib/types";
import { Chip, ErrorNote, Spinner } from "@/components/app/ui";
import LeadsTab from "@/components/app/campaign/LeadsTab";
import DraftsTab from "@/components/app/campaign/DraftsTab";
import AnalyticsTab from "@/components/app/campaign/AnalyticsTab";
import SettingsTab from "@/components/app/campaign/SettingsTab";

const TABS = ["Leads", "Drafts", "Analytics", "Settings"] as const;
type Tab = (typeof TABS)[number];

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Leads");

  const loadCampaign = useCallback(async () => {
    try {
      const data = await api<Campaign>(`/campaigns/${id}`);
      setCampaign(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [id]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  if (error) {
    return (
      <div className="pt-8 max-w-xl mx-auto">
        <ErrorNote message={error} />
        <Link href="/dashboard" className="text-sm text-[#00D4FF] hover:underline mt-4 inline-block">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="pt-2">
      <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition-colors">
        ← Dashboard
      </Link>

      <div className="flex items-center gap-4 mt-3 mb-6">
        <h1 className="text-3xl font-bold">{campaign.name}</h1>
        <Chip value={campaign.status} />
      </div>

      <div className="flex gap-1 border-b border-white/10 mb-8 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === t
                ? "text-white border-[#00D4FF]"
                : "text-white/45 border-transparent hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Leads" && <LeadsTab campaignId={campaign.id} />}
      {tab === "Drafts" && <DraftsTab campaignId={campaign.id} />}
      {tab === "Analytics" && <AnalyticsTab campaignId={campaign.id} />}
      {tab === "Settings" && (
        <SettingsTab campaign={campaign} onSaved={loadCampaign} />
      )}
    </div>
  );
}
