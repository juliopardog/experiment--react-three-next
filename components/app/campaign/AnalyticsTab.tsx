"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { CampaignAnalytics } from "@/lib/types";
import { Card, ErrorNote, Spinner, StatTile } from "@/components/app/ui";

const POLL_MS = 30000;

const pct = (f: number) => `${(f * 100).toFixed(1)}%`;

export default function AnalyticsTab({ campaignId }: { campaignId: string }) {
  const [data, setData] = useState<CampaignAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api<CampaignAnalytics>(`/analytics/campaigns/${campaignId}`)
        .then((d) => alive && setData(d))
        .catch((err) => alive && setError(errorMessage(err)));
    load();
    const t = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [campaignId]);

  if (error) return <ErrorNote message={error} />;
  if (!data)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );

  const funnel = [
    { label: "Leads", value: data.total_leads, color: "#7B2FFF" },
    { label: "Sent", value: data.emails_sent, color: "#00D4FF" },
    { label: "Opened", value: data.emails_opened, color: "#FF006E" },
    { label: "Clicked", value: data.emails_clicked, color: "#22c55e" },
  ];
  const funnelMax = Math.max(1, ...funnel.map((f) => f.value));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatTile label="Total leads" value={data.total_leads.toLocaleString()} />
        <StatTile label="Emails sent" value={data.emails_sent.toLocaleString()} accent="#00D4FF" />
        <StatTile label="Open rate" value={pct(data.open_rate)} accent="#FF006E" />
        <StatTile label="Click rate" value={pct(data.click_rate)} accent="#22c55e" />
        <StatTile label="Bounce rate" value={pct(data.bounce_rate)} accent="#f59e0b" />
        <StatTile label="Unsubscribed" value={data.unsubscribed.toLocaleString()} />
        <StatTile
          label="Drafts pending review"
          value={data.drafts_pending_review.toLocaleString()}
          accent="#7B2FFF"
        />
        <StatTile label="Drafts approved" value={data.drafts_approved.toLocaleString()} />
      </div>

      <Card>
        <h3 className="font-bold mb-5">Funnel</h3>
        <div className="flex flex-col gap-4">
          {funnel.map((f) => (
            <div key={f.label} className="flex items-center gap-4">
              <span className="w-16 text-xs text-white/45 uppercase tracking-wider font-semibold">
                {f.label}
              </span>
              <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-700"
                  style={{
                    width: `${(f.value / funnelMax) * 100}%`,
                    background: `linear-gradient(90deg, ${f.color}cc, ${f.color}66)`,
                    minWidth: f.value > 0 ? 8 : 0,
                  }}
                />
              </div>
              <span className="w-14 text-right text-sm font-semibold">{f.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/25 mt-5">Updates every 30 seconds.</p>
      </Card>
    </div>
  );
}
