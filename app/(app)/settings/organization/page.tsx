"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { Organization } from "@/lib/types";
import { useOrg } from "@/components/app/AppShell";
import { Button, Card, ErrorNote, Input, Spinner } from "@/components/app/ui";

export default function OrganizationPage() {
  const { refreshOrg } = useOrg();
  const [org, setOrg] = useState<Organization | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<Organization>("/organizations/me")
      .then((o) => {
        setOrg(o);
        setName(o.name);
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api("/organizations/me", { method: "PATCH", json: { name } });
      setSaved(true);
      refreshOrg();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-4 max-w-xl">
      <h1 className="text-3xl font-bold mb-8">Organization</h1>

      {!org && !error ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <Card>
          <form onSubmit={save} className="flex flex-col gap-5">
            <Input
              label="Organization name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
            />
            <ErrorNote message={error} />
            <div className="flex items-center gap-4">
              <Button type="submit" loading={saving} className="self-start">
                Save
              </Button>
              {saved && <span className="text-sm text-[#22c55e]">Saved.</span>}
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
