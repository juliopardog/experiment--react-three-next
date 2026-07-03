"use client";

import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { DnsRecord, SenderDomain } from "@/lib/types";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorNote,
  Input,
  Spinner,
} from "@/components/app/ui";

function parseDns(raw: string): DnsRecord[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs text-[#00D4FF] hover:underline whitespace-nowrap"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<SenderDomain[] | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<SenderDomain[]>("/domains");
      setDomains(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAdding(true);
    try {
      const created = await api<SenderDomain>("/domains", { json: { domain: newDomain } });
      setNewDomain("");
      await load();
      setExpanded(created.id); // show DNS records right away
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const verify = async (id: string) => {
    setBusy((b) => ({ ...b, [id]: true }));
    setError(null);
    try {
      await api(`/domains/${id}/verify`, { method: "POST" });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  const remove = async (d: SenderDomain) => {
    if (!confirm(`Remove ${d.domain}? Campaigns sending from it will fall back to the shared address.`))
      return;
    setBusy((b) => ({ ...b, [d.id]: true }));
    setError(null);
    try {
      await api(`/domains/${d.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(errorMessage(err));
      setBusy((b) => ({ ...b, [d.id]: false }));
    }
  };

  return (
    <div className="pt-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Sending domains</h1>
      <p className="text-white/50 text-sm mb-8 leading-relaxed">
        Verify your own domain so emails come from your address. Until a domain is
        verified, emails send from the PolloLabs shared address.
      </p>

      <Card className="mb-6">
        <form onSubmit={add} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="yourdomain.com"
              required
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
            />
          </div>
          <Button type="submit" loading={adding}>
            Add domain
          </Button>
        </form>
      </Card>

      <ErrorNote message={error} />

      {domains === null ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : domains.length === 0 ? (
        <Card>
          <EmptyState
            title="No domains yet"
            body="Add the domain you want to send from. You'll get DNS records to paste into your registrar."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-4 mt-2">
          {domains.map((d) => {
            const records = parseDns(d.dns_records);
            const open = expanded === d.id;
            return (
              <Card key={d.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{d.domain}</span>
                    <Chip value={d.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      loading={busy[d.id]}
                      onClick={() => verify(d.id)}
                    >
                      Check verification
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setExpanded(open ? null : d.id)}
                    >
                      {open ? "Hide DNS" : "DNS records"}
                    </Button>
                    <Button variant="danger" loading={busy[d.id]} onClick={() => remove(d)}>
                      Delete
                    </Button>
                  </div>
                </div>

                {open && (
                  <div className="mt-5">
                    <p className="text-sm text-white/50 mb-3">
                      Add these records at your registrar (GoDaddy, Namecheap, Cloudflare…),
                      then hit “Check verification”. DNS changes can take up to an hour to
                      propagate.
                    </p>
                    {records.length === 0 ? (
                      <p className="text-sm text-white/35">No DNS records returned.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-white/35 uppercase tracking-wider bg-white/5">
                              <th className="px-4 py-2.5 font-semibold">Type</th>
                              <th className="px-4 py-2.5 font-semibold">Name</th>
                              <th className="px-4 py-2.5 font-semibold">Value</th>
                              <th className="px-4 py-2.5"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {records.map((r, i) => (
                              <tr key={i} className="border-t border-white/5 align-top">
                                <td className="px-4 py-3 font-semibold text-white/80">{r.type}</td>
                                <td className="px-4 py-3 text-white/60 break-all">
                                  <div className="flex items-center gap-2">
                                    <span>{r.name}</span>
                                    <CopyButton text={r.name} />
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-white/60 break-all max-w-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs">{r.value}</span>
                                    <CopyButton text={r.value} />
                                  </div>
                                </td>
                                <td></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
