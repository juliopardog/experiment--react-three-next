"use client";

import { useState } from "react";
import Link from "next/link";
import { api, ApiError, errorMessage } from "@/lib/api";
import { Campaign } from "@/lib/types";
import { Button, Card, ErrorNote, Input, Select, Textarea } from "@/components/app/ui";

export default function SettingsTab({
  campaign,
  onSaved,
}: {
  campaign: Campaign;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: campaign.name || "",
    persona_prompt: campaign.persona_prompt || "",
    subject_hint: campaign.subject_hint || "",
    body_hint: campaign.body_hint || "",
    follow_up_days: campaign.follow_up_days ?? 3,
    max_follow_ups: campaign.max_follow_ups ?? 2,
    status: campaign.status,
    from_name: campaign.from_name || "",
    from_email: campaign.from_email || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [fromEmailError, setFromEmailError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFromEmailError(null);
    setSaving(true);
    try {
      await api(`/campaigns/${campaign.id}`, { method: "PATCH", json: form });
      setSaved(true);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && form.from_email) {
        setFromEmailError(
          `${err.message} — verify this domain first in Settings → Domains.`
        );
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-6 max-w-2xl">
      <Card>
        <h3 className="font-bold mb-5">Campaign</h3>
        <div className="flex flex-col gap-4">
          <Input label="Name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          <Textarea
            label="Who are you and what do you sell?"
            hint="The AI uses this to write every email."
            rows={5}
            value={form.persona_prompt}
            onChange={(e) => set("persona_prompt", e.target.value)}
          />
          <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="done">Done</option>
          </Select>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-1">Writing hints</h3>
        <p className="text-sm text-white/45 mb-5">
          Optional nudges for the AI — tone, angle, things to always mention.
        </p>
        <div className="flex flex-col gap-4">
          <Input
            label="Subject line hint"
            placeholder='e.g. "casual, mention their city"'
            value={form.subject_hint}
            onChange={(e) => set("subject_hint", e.target.value)}
          />
          <Textarea
            label="Body hint"
            placeholder='e.g. "keep it under 100 words, end with a soft question"'
            rows={3}
            value={form.body_hint}
            onChange={(e) => set("body_hint", e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-1">Follow-ups</h3>
        <p className="text-sm text-white/45 mb-5">
          Automatic bumps that cancel the moment someone replies.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Days between follow-ups"
            type="number"
            min={1}
            max={30}
            value={form.follow_up_days}
            onChange={(e) => set("follow_up_days", Number(e.target.value))}
          />
          <Input
            label="Max follow-ups"
            type="number"
            min={0}
            max={5}
            value={form.max_follow_ups}
            onChange={(e) => set("max_follow_ups", Number(e.target.value))}
          />
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-1">Sender</h3>
        <p className="text-sm text-white/45 mb-5">
          Until your domain is verified, emails send from the PolloLabs shared address.{" "}
          <Link href="/settings/domains" className="text-[#00D4FF] hover:underline">
            Manage domains
          </Link>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="From name"
            placeholder="Julio at PolloLabs"
            value={form.from_name}
            onChange={(e) => set("from_name", e.target.value)}
          />
          <Input
            label="From email"
            type="email"
            placeholder="julio@yourdomain.com"
            error={fromEmailError}
            value={form.from_email}
            onChange={(e) => {
              set("from_email", e.target.value);
              setFromEmailError(null);
            }}
          />
        </div>
      </Card>

      <ErrorNote message={error} />

      <div className="flex items-center gap-4">
        <Button type="submit" loading={saving} className="px-8 py-3">
          Save changes
        </Button>
        {saved && <span className="text-sm text-[#22c55e]">Saved.</span>}
      </div>
    </form>
  );
}
