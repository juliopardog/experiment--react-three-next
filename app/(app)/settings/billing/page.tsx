"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { useOrg } from "@/components/app/AppShell";
import { Button, Card, ErrorNote, Meter } from "@/components/app/ui";

/* UI name → API plan value: Starter = "pro", Growth = "growth" */
const PLANS = [
  {
    apiPlan: null,
    name: "Free",
    price: "$0",
    blurb: "50 emails/mo · 25 found leads/mo",
  },
  {
    apiPlan: "pro",
    name: "Starter",
    price: "$19/mo",
    blurb: "1,000 emails · 250 found leads · send from your own domain",
  },
  {
    apiPlan: "growth",
    name: "Growth",
    price: "$49/mo",
    blurb: "5,000 emails · 1,000 found leads · priority support",
  },
];

function BillingContent() {
  const { org, refreshOrg } = useOrg();
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const checkout = async (plan: string) => {
    setError(null);
    setBusy(plan);
    try {
      const { checkout_url } = await api<{ checkout_url: string }>("/billing/checkout", {
        json: {
          plan,
          success_url: `${window.location.origin}/settings/billing?success=1`,
          cancel_url: `${window.location.origin}/settings/billing`,
        },
      });
      window.location.href = checkout_url;
    } catch (err) {
      setError(errorMessage(err));
      setBusy(null);
    }
  };

  const portal = async () => {
    setError(null);
    setBusy("portal");
    try {
      const { portal_url } = await api<{ portal_url: string }>("/billing/portal", {
        json: { return_url: `${window.location.origin}/settings/billing` },
      });
      window.location.href = portal_url;
    } catch (err) {
      setError(errorMessage(err));
      setBusy(null);
    }
  };

  const currentPlan = org?.plan?.toLowerCase() || "free";

  return (
    <div className="pt-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Billing</h1>

      {success && (
        <p className="text-sm text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl px-4 py-3 mb-6">
          Payment confirmed — your new plan is active. {""}
          <button className="underline" onClick={() => refreshOrg()}>
            Refresh usage
          </button>
        </p>
      )}

      {org && (
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/45 mb-1">Current plan</p>
              <p className="text-2xl font-bold capitalize">{org.plan}</p>
            </div>
            <div className="sm:w-72">
              <Meter used={org.sends_this_month} limit={org.monthly_send_limit} />
            </div>
            <Button variant="secondary" loading={busy === "portal"} onClick={portal}>
              Manage subscription
            </Button>
          </div>
        </Card>
      )}

      <ErrorNote message={error} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {PLANS.map((p) => {
          const isCurrent =
            (p.apiPlan === null && currentPlan === "free") || p.apiPlan === currentPlan;
          return (
            <Card key={p.name} className={isCurrent ? "border-[#00D4FF]/40" : ""}>
              <h3 className="font-bold text-lg mb-1">{p.name}</h3>
              <p className="text-2xl font-bold mb-3">{p.price}</p>
              <p className="text-sm text-white/45 mb-5 leading-relaxed">{p.blurb}</p>
              {isCurrent ? (
                <span className="text-xs font-semibold text-[#00D4FF]">Current plan</span>
              ) : p.apiPlan ? (
                <Button loading={busy === p.apiPlan} onClick={() => checkout(p.apiPlan!)}>
                  Upgrade
                </Button>
              ) : (
                <span className="text-xs text-white/35">
                  Downgrade via “Manage subscription”
                </span>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}
