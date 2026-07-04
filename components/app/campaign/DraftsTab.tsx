"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/api";
import { Draft, DraftStatus } from "@/lib/types";
import { useOrg } from "@/components/app/AppShell";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorNote,
  Select,
  Spinner,
} from "@/components/app/ui";

const POLL_MS = 5000;
const MAX_POLLS = 60; // 5 min cap

interface DraftEdits {
  subject: string;
  body: string;
}

export default function DraftsTab({ campaignId }: { campaignId: string }) {
  const { refreshOrg, user } = useOrg();
  const canSend = user?.email_verified !== false;
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<DraftStatus>("pending_review");
  const [edits, setEdits] = useState<Record<string, DraftEdits>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [genInfo, setGenInfo] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);

  const loadDrafts = useCallback(
    async (status: DraftStatus = statusFilter) => {
      const data = await api<Draft[]>(`/campaigns/${campaignId}/drafts`, {
        params: { status, limit: 100 },
      });
      setDrafts(data);
      return data;
    },
    [campaignId, statusFilter]
  );

  useEffect(() => {
    setDrafts(null);
    loadDrafts().catch((err) => setError(errorMessage(err)));
  }, [loadDrafts]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    setGenerating(false);
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const generate = async () => {
    setError(null);
    setGenInfo(null);
    try {
      const res = await api<{ leads_queued: number }>(
        `/campaigns/${campaignId}/drafts/generate`
      );
      const queued = res.leads_queued;
      setGenerating(true);
      setGenInfo(`Writing ${queued} emails…`);
      setStatusFilter("pending_review");

      const startCount = drafts?.length ?? 0;
      let polls = 0;
      let unchanged = 0;
      let lastCount = startCount;

      pollRef.current = setInterval(async () => {
        polls++;
        try {
          const data = await loadDrafts("pending_review");
          const count = data.length;
          setGenInfo(`Writing emails… ${Math.max(0, count - startCount)} of ${queued} drafted`);
          unchanged = count === lastCount ? unchanged + 1 : 0;
          lastCount = count;
          const doneByCount = count - startCount >= queued;
          const stalled = unchanged >= 4 && count > startCount;
          if (doneByCount || stalled || polls >= MAX_POLLS) {
            stopPolling();
            setGenInfo(
              doneByCount
                ? `Done — ${queued} drafts ready for review.`
                : "Generation finished. Review the drafts below."
            );
          }
        } catch {
          // transient poll failure — keep trying
        }
      }, POLL_MS);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setGenInfo("No pending leads to write for. Find or add leads first.");
      } else {
        setError(errorMessage(err));
      }
    }
  };

  const getEdits = (d: Draft): DraftEdits =>
    edits[d.id] ?? { subject: d.subject, body: d.body };

  const setDraftBusy = (id: string, v: boolean) =>
    setBusy((b) => ({ ...b, [id]: v }));

  const approve = async (d: Draft): Promise<boolean> => {
    const e = getEdits(d);
    const changed = e.subject !== d.subject || e.body !== d.body;
    await api(`/campaigns/${campaignId}/drafts/${d.id}/approve`, {
      method: "PATCH",
      json: changed ? { subject: e.subject, body: e.body } : {},
    });
    return true;
  };

  const send = async (d: Draft) => {
    await api(`/campaigns/${campaignId}/drafts/${d.id}/send`, { method: "POST" });
  };

  const isUnverifiedEmailError = (err: unknown) =>
    err instanceof ApiError &&
    err.status === 403 &&
    err.message.toLowerCase().includes("verify your email");

  const runAction = async (d: Draft, action: "approve" | "reject" | "send" | "approve_send") => {
    setError(null);
    setNotes((n) => ({ ...n, [d.id]: "" }));
    setDraftBusy(d.id, true);
    try {
      if (action === "reject") {
        await api(`/campaigns/${campaignId}/drafts/${d.id}/reject`, { method: "PATCH" });
      } else if (action === "approve") {
        await approve(d);
      } else if (action === "send") {
        await send(d);
        refreshOrg();
      } else {
        await approve(d);
        await send(d);
        refreshOrg();
      }
      await loadDrafts();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        // upgrade modal opens via the global quota event
      } else if (isUnverifiedEmailError(err)) {
        // verification banner opens/scrolls into view via the global event
        setNotes((n) => ({ ...n, [d.id]: "Verify your email above to send." }));
      } else if (err instanceof ApiError && err.status === 409) {
        setNotes((n) => ({ ...n, [d.id]: err.message }));
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setDraftBusy(d.id, false);
    }
  };

  const bulkApproveSend = async () => {
    if (!drafts) return;
    const pending = drafts.filter((d) => d.status === "pending_review");
    if (pending.length === 0) return;
    setBulkBusy(true);
    setError(null);
    let sent = 0;
    let skipped = 0;
    try {
      for (let i = 0; i < pending.length; i++) {
        const d = pending[i];
        setBulkProgress(`Sending ${i + 1} of ${pending.length}…`);
        try {
          await approve(d);
          await send(d);
          sent++;
        } catch (err) {
          if (err instanceof ApiError && err.status === 402) {
            setBulkProgress(
              `Sent ${sent}. Stopped — monthly quota reached (${pending.length - i - 1} left).`
            );
            return;
          }
          if (isUnverifiedEmailError(err)) {
            setBulkProgress(
              `Sent ${sent}. Stopped — verify your email to keep sending (${pending.length - i - 1} left).`
            );
            return;
          }
          if (err instanceof ApiError && err.status === 409) {
            skipped++;
            setNotes((n) => ({ ...n, [d.id]: err.message }));
            continue;
          }
          throw err;
        }
      }
      setBulkProgress(
        `Sent ${sent} emails${skipped ? ` (${skipped} skipped)` : ""}.`
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      refreshOrg();
      await loadDrafts().catch(() => {});
      setBulkBusy(false);
    }
  };

  const pendingCount = drafts?.filter((d) => d.status === "pending_review").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold mb-1">Draft queue</h3>
            <p className="text-sm text-white/45">
              PolloLabs writes one unique email per lead. Nothing sends until you approve it.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={generate} disabled={generating}>
              {generating ? "Writing…" : "Generate drafts"}
            </Button>
            {pendingCount > 1 && (
              <span title={canSend ? undefined : "Verify your email to send"}>
                <Button
                  variant="secondary"
                  onClick={bulkApproveSend}
                  loading={bulkBusy}
                  disabled={!canSend}
                >
                  Approve &amp; send all ({pendingCount})
                </Button>
              </span>
            )}
          </div>
        </div>
        {(genInfo || bulkProgress) && (
          <div className="mt-4 flex items-center gap-3 text-sm text-white/60">
            {(generating || bulkBusy) && <Spinner size={16} />}
            <span>{bulkProgress || genInfo}</span>
          </div>
        )}
      </Card>

      <ErrorNote message={error} />

      <div className="flex items-center justify-between">
        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DraftStatus)}
          >
            <option value="pending_review">Pending review</option>
            <option value="approved">Approved</option>
            <option value="sent">Sent</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
        <span className="text-xs text-white/35">{drafts?.length ?? 0} drafts</span>
      </div>

      {drafts === null ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : drafts.length === 0 ? (
        <Card>
          <EmptyState
            title={
              statusFilter === "pending_review" ? "No drafts waiting" : "Nothing here yet"
            }
            body={
              statusFilter === "pending_review"
                ? "Hit “Generate drafts” and PolloLabs will write an email for every pending lead."
                : "Drafts will appear here as their status changes."
            }
          />
        </Card>
      ) : (
        drafts.map((d) => {
          const e = getEdits(d);
          const editable = d.status === "pending_review";
          return (
            <Card key={d.id}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-sm">
                  <span className="text-white/80 font-semibold">
                    {d.lead?.email || d.lead_id}
                  </span>
                  {d.lead?.company && (
                    <span className="text-white/40"> · {d.lead.company}</span>
                  )}
                </div>
                <Chip value={d.status} />
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <input
                  value={e.subject}
                  readOnly={!editable}
                  onChange={(ev) =>
                    setEdits((all) => ({ ...all, [d.id]: { ...e, subject: ev.target.value } }))
                  }
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#00D4FF]/60"
                  placeholder="Subject"
                />
                <textarea
                  value={e.body}
                  readOnly={!editable}
                  onChange={(ev) =>
                    setEdits((all) => ({ ...all, [d.id]: { ...e, body: ev.target.value } }))
                  }
                  rows={Math.min(14, Math.max(6, e.body.split("\n").length + 1))}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/85 leading-relaxed outline-none focus:border-[#00D4FF]/60 font-mono"
                />
              </div>

              {notes[d.id] && (
                <p className="text-xs text-amber-400 mb-3">{notes[d.id]}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {editable && (
                  <>
                    <span title={canSend ? undefined : "Verify your email to send"}>
                      <Button
                        loading={busy[d.id]}
                        disabled={!canSend}
                        onClick={() => runAction(d, "approve_send")}
                      >
                        Approve &amp; send
                      </Button>
                    </span>
                    <Button
                      variant="secondary"
                      loading={busy[d.id]}
                      onClick={() => runAction(d, "approve")}
                    >
                      Approve only
                    </Button>
                    <Button
                      variant="danger"
                      loading={busy[d.id]}
                      onClick={() => runAction(d, "reject")}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {d.status === "approved" && (
                  <span title={canSend ? undefined : "Verify your email to send"}>
                    <Button loading={busy[d.id]} disabled={!canSend} onClick={() => runAction(d, "send")}>
                      Send
                    </Button>
                  </span>
                )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
