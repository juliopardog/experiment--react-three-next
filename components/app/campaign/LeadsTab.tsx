"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { Lead, LeadSearch } from "@/lib/types";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorNote,
  Input,
  Select,
  Spinner,
} from "@/components/app/ui";

const PAGE_SIZE = 25;

const SEARCH_STAGES = [
  "Searching Google + OpenStreetMap…",
  "Crawling business websites…",
  "Verifying email addresses…",
];

const LEAD_STATUSES = [
  "pending",
  "draft_generated",
  "sent",
  "replied",
  "bounced",
  "unsubscribed",
];

export default function LeadsTab({ campaignId }: { campaignId: string }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // find-leads pipeline
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(25);
  const [search, setSearch] = useState<LeadSearch | null>(null);
  const [stageIdx, setStageIdx] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // csv upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  // manual add
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({
    email: "",
    first_name: "",
    last_name: "",
    company: "",
    title: "",
    website: "",
  });
  const [manualBusy, setManualBusy] = useState(false);

  const loadLeads = useCallback(async () => {
    try {
      const data = await api<Lead[]>(`/campaigns/${campaignId}/leads`, {
        params: { status: statusFilter, limit: PAGE_SIZE, offset },
      });
      setLeads(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [campaignId, statusFilter, offset]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const startFind = async () => {
    setError(null);
    try {
      const created = await api<LeadSearch>(`/campaigns/${campaignId}/leads/find`, {
        json: { query, max_results: maxResults },
      });
      setSearch(created);
      setStageIdx(0);

      let ticks = 0;
      pollRef.current = setInterval(async () => {
        ticks++;
        // rotate stage copy every ~3 polls so the pipeline feels alive
        setStageIdx(Math.min(Math.floor(ticks / 3), SEARCH_STAGES.length - 1));
        try {
          const searches = await api<LeadSearch[]>(
            `/campaigns/${campaignId}/leads/searches`
          );
          const current = searches.find((s) => s.id === created.id);
          if (current) {
            setSearch(current);
            if (current.status === "done" || current.status === "failed") {
              stopPolling();
              if (current.status === "done") loadLeads();
            }
          }
        } catch {
          // transient poll failure — keep trying until terminal status
        }
      }, 3000);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const searchRunning = search && (search.status === "queued" || search.status === "running");

  const uploadCsv = async (file: File) => {
    setError(null);
    setUploadResult(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api<{ imported: number; skipped: number }>(
        `/campaigns/${campaignId}/leads/upload`,
        { formData: fd }
      );
      setUploadResult(`Imported ${res.imported} leads (${res.skipped} skipped).`);
      loadLeads();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setManualBusy(true);
    try {
      await api(`/campaigns/${campaignId}/leads`, { json: manual });
      setManual({ email: "", first_name: "", last_name: "", company: "", title: "", website: "" });
      setManualOpen(false);
      loadLeads();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setManualBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Find leads — the primary action */}
      <Card>
        <h3 className="font-bold mb-1">Find leads</h3>
        <p className="text-sm text-white/45 mb-4">
          Describe a niche and a place. PolloLabs finds the businesses and verifies
          their email addresses — usually in about a minute.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder='e.g. "dentists in Austin, TX"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!!searchRunning}
            />
          </div>
          <div className="w-full sm:w-32">
            <Input
              type="number"
              min={1}
              max={100}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              disabled={!!searchRunning}
              title="Max results"
            />
          </div>
          <Button onClick={startFind} disabled={!query.trim() || !!searchRunning}>
            Find leads
          </Button>
        </div>

        {searchRunning && (
          <div className="mt-5 flex items-center gap-3 text-sm text-white/60">
            <Spinner size={16} />
            <span>{SEARCH_STAGES[stageIdx]}</span>
          </div>
        )}
        {search?.status === "done" && (
          <p className="mt-4 text-sm text-[#22c55e]">
            Found {search.found_count} leads for “{search.query}”.
          </p>
        )}
        {search?.status === "failed" && (
          <p className="mt-4 text-sm text-red-400">
            Search failed{search.error ? `: ${search.error}` : "."} Try a different query.
          </p>
        )}
      </Card>

      {/* Secondary sources */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadCsv(f);
          }}
        />
        <Button variant="secondary" onClick={() => fileRef.current?.click()} loading={uploading}>
          Upload CSV
        </Button>
        <Button variant="secondary" onClick={() => setManualOpen((v) => !v)}>
          Add lead manually
        </Button>
        <span className="text-xs text-white/30">CSV needs an “email” column.</span>
        {uploadResult && <span className="text-xs text-[#22c55e]">{uploadResult}</span>}
      </div>

      {manualOpen && (
        <Card>
          <form onSubmit={addManual} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              required
              value={manual.email}
              onChange={(e) => setManual({ ...manual, email: e.target.value })}
            />
            <Input
              label="Company"
              value={manual.company}
              onChange={(e) => setManual({ ...manual, company: e.target.value })}
            />
            <Input
              label="First name"
              value={manual.first_name}
              onChange={(e) => setManual({ ...manual, first_name: e.target.value })}
            />
            <Input
              label="Last name"
              value={manual.last_name}
              onChange={(e) => setManual({ ...manual, last_name: e.target.value })}
            />
            <Input
              label="Title"
              value={manual.title}
              onChange={(e) => setManual({ ...manual, title: e.target.value })}
            />
            <Input
              label="Website"
              value={manual.website}
              onChange={(e) => setManual({ ...manual, website: e.target.value })}
            />
            <div className="sm:col-span-2">
              <Button type="submit" loading={manualBusy}>
                Add lead
              </Button>
            </div>
          </form>
        </Card>
      )}

      <ErrorNote message={error} />

      {/* Lead table */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="font-bold">Leads</h3>
          <div className="w-44">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setOffset(0);
              }}
            >
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {leads === null ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            title={statusFilter ? "No leads with this status" : "No leads yet"}
            body={
              statusFilter
                ? "Try a different filter."
                : "Run a lead search above, upload a CSV, or add one manually."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-white/35 uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Company</th>
                  <th className="px-5 py-3 font-semibold">Source</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-white/5">
                    <td className="px-5 py-3 text-white/80">{l.email}</td>
                    <td className="px-5 py-3 text-white/55">{l.company || "—"}</td>
                    <td className="px-5 py-3">{l.source ? <Chip value={l.source} /> : "—"}</td>
                    <td className="px-5 py-3">
                      <Chip value={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-white/5">
          <Button
            variant="ghost"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            ← Previous
          </Button>
          <span className="text-xs text-white/35">
            {offset + 1}–{offset + (leads?.length || 0)}
          </span>
          <Button
            variant="ghost"
            disabled={!leads || leads.length < PAGE_SIZE}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Next →
          </Button>
        </div>
      </Card>
    </div>
  );
}
