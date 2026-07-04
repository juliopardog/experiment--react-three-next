"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, errorMessage, normalizeEmail } from "@/lib/api";
import { TeamInvite, TeamMember, TeamSeats, UserRole } from "@/lib/types";
import { useOrg } from "@/components/app/AppShell";
import {
  Button,
  Card,
  Chip,
  ErrorNote,
  Input,
  Select,
  Spinner,
} from "@/components/app/ui";

export default function TeamPage() {
  const { user } = useOrg();
  const canManage = user?.role === "owner" || user?.role === "admin";

  const [seats, setSeats] = useState<TeamSeats | null>(null);
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [invites, setInvites] = useState<TeamInvite[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("member");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [s, m, i] = await Promise.all([
        api<TeamSeats>("/team/seats"),
        api<TeamMember[]>("/team/members"),
        api<TeamInvite[]>("/team/invites"),
      ]);
      setSeats(s);
      setMembers(m);
      setInvites(i.filter((inv) => inv.status === "pending"));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const setRowBusy = (id: string, v: boolean) => setBusy((b) => ({ ...b, [id]: v }));

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviting(true);
    try {
      await api("/team/invites", {
        json: { email: normalizeEmail(inviteEmail), role: inviteRole },
      });
      setInviteEmail("");
      setInviteRole("member");
      await loadAll();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        setInviteError(err.message || "You're out of seats on this plan. Upgrade to invite more people.");
      } else if (err instanceof ApiError && (err.status === 409 || err.status === 422)) {
        setInviteError(err.message);
      } else {
        setInviteError(errorMessage(err));
      }
    } finally {
      setInviting(false);
    }
  };

  const removeMember = async (m: TeamMember) => {
    if (!confirm(`Remove ${m.full_name || m.email} from the team?`)) return;
    setRowBusy(m.id, true);
    setError(null);
    try {
      await api(`/team/members/${m.id}`, { method: "DELETE" });
      await loadAll();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRowBusy(m.id, false);
    }
  };

  const revokeInvite = async (inv: TeamInvite) => {
    setRowBusy(inv.id, true);
    setError(null);
    try {
      await api(`/team/invites/${inv.id}`, { method: "DELETE" });
      await loadAll();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRowBusy(inv.id, false);
    }
  };

  const seatsFull = seats ? seats.seats_available <= 0 : false;

  return (
    <div className="pt-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Team</h1>
      <p className="text-white/50 text-sm mb-8 leading-relaxed">
        Everyone on your team shares campaigns, leads, and sends against the
        same plan.
      </p>

      {seats && (
        <Card className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/45 mb-1">Seats</p>
              <p className="text-xl font-bold">
                {seats.seats_used} of {seats.seat_limit} used
              </p>
            </div>
            {seatsFull && (
              <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/25 rounded-full px-3 py-1.5">
                Upgrade to add more seats
              </span>
            )}
          </div>
        </Card>
      )}

      <ErrorNote message={error} />

      {canManage && (
        <Card className="mb-6 mt-6">
          <h3 className="font-bold mb-4">Invite someone</h3>
          <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-3 items-start">
            <div className="flex-1 w-full">
              <Input
                type="email"
                placeholder="teammate@company.com"
                required
                disabled={seatsFull}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-36">
              <Select
                value={inviteRole}
                disabled={seatsFull}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <Button type="submit" loading={inviting} disabled={seatsFull}>
              Send invite
            </Button>
          </form>
          {inviteError && <p className="text-xs text-red-400 mt-3">{inviteError}</p>}
        </Card>
      )}

      <Card className="mb-6 p-0 overflow-hidden">
        <h3 className="font-bold px-5 py-4 border-b border-white/5">Members</h3>
        {members === null ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-white/35 uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  {canManage && <th className="px-5 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const isSelf = m.id === user?.id;
                  const isOwner = m.role === "owner";
                  return (
                    <tr key={m.id} className="border-t border-white/5">
                      <td className="px-5 py-3 text-white/80">{m.full_name || "—"}</td>
                      <td className="px-5 py-3 text-white/55">{m.email}</td>
                      <td className="px-5 py-3">
                        <Chip value={m.role} />
                      </td>
                      <td className="px-5 py-3">
                        {!m.email_verified ? (
                          <span className="text-xs text-amber-400">Unverified</span>
                        ) : !m.is_active ? (
                          <span className="text-xs text-white/35">Inactive</span>
                        ) : (
                          <span className="text-xs text-[#22c55e]">Active</span>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-5 py-3 text-right">
                          {!isSelf && !isOwner && (
                            <Button
                              variant="danger"
                              loading={busy[m.id]}
                              onClick={() => removeMember(m)}
                            >
                              Remove
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {canManage && (
        <Card className="p-0 overflow-hidden">
          <h3 className="font-bold px-5 py-4 border-b border-white/5">Pending invites</h3>
          {invites === null ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : invites.length === 0 ? (
            <p className="text-sm text-white/35 px-5 py-6">No pending invites.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-white/35 uppercase tracking-wider">
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Expires</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((inv) => (
                    <tr key={inv.id} className="border-t border-white/5">
                      <td className="px-5 py-3 text-white/80">{inv.email}</td>
                      <td className="px-5 py-3">
                        <Chip value={inv.role} />
                      </td>
                      <td className="px-5 py-3 text-white/45 text-xs">
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          variant="ghost"
                          loading={busy[inv.id]}
                          onClick={() => revokeInvite(inv)}
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
