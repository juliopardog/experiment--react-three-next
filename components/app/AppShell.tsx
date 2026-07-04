"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  api,
  clearToken,
  EMAIL_VERIFICATION_EVENT,
  errorMessage,
  getToken,
  QUOTA_EVENT,
} from "@/lib/api";
import { Organization, User } from "@/lib/types";
import { Button, Meter, Modal } from "@/components/app/ui";

interface OrgContextValue {
  org: Organization | null;
  refreshOrg: () => Promise<void>;
  user: User | null;
  refreshUser: () => Promise<void>;
  showUpgrade: (message?: string) => void;
}

const OrgContext = createContext<OrgContextValue>({
  org: null,
  refreshOrg: async () => {},
  user: null,
  refreshUser: async () => {},
  showUpgrade: () => {},
});

export function useOrg() {
  return useContext(OrgContext);
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings/team", label: "Team" },
  { href: "/settings/domains", label: "Domains" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings/organization", label: "Organization" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [org, setOrg] = useState<Organization | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authed, setAuthed] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState<string | undefined>();
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const refreshOrg = useCallback(async () => {
    try {
      const data = await api<Organization>("/organizations/me");
      setOrg(data);
    } catch {
      // 401 already redirects; other failures keep the last known org
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api<User>("/auth/me");
      setUser(data);
    } catch {
      // 401 already redirects; other failures keep the last known user
    }
  }, []);

  const showUpgrade = useCallback((message?: string) => {
    setUpgradeMsg(message);
    setUpgradeOpen(true);
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setAuthed(true);
    refreshOrg();
    refreshUser();
  }, [router, refreshOrg, refreshUser]);

  useEffect(() => {
    const onQuota = (e: Event) => {
      showUpgrade((e as CustomEvent).detail as string | undefined);
    };
    const onUnverified = () => {
      // Belt-and-suspenders: the banner renders off email_verified from
      // /auth/me, so re-sync first in case client state was stale, then
      // bring the banner into view so the user sees why the send failed.
      refreshUser();
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener(QUOTA_EVENT, onQuota);
    window.addEventListener(EMAIL_VERIFICATION_EVENT, onUnverified);
    return () => {
      window.removeEventListener(QUOTA_EVENT, onQuota);
      window.removeEventListener(EMAIL_VERIFICATION_EVENT, onUnverified);
    };
  }, [showUpgrade, refreshUser]);

  const logout = () => {
    clearToken();
    router.replace("/login");
  };

  const resendVerification = async () => {
    if (!user) return;
    setResending(true);
    setResendMsg(null);
    try {
      await api("/auth/resend-verification", { json: { email: user.email } });
      setResendMsg("Verification email sent — check your inbox.");
    } catch (err) {
      setResendMsg(errorMessage(err));
    } finally {
      setResending(false);
    }
  };

  if (!authed) return null;

  return (
    <OrgContext.Provider value={{ org, refreshOrg, user, refreshUser, showUpgrade }}>
      <div className="min-h-screen">
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-[#050508]/90 backdrop-blur-md border-b border-white/5">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
              <Image src="/logo-icon.png" alt="PolloLabs" width={28} height={28} />
              <span className="text-lg font-bold tracking-tight gradient-text hidden sm:inline">
                PolloLabs
              </span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-5 text-sm overflow-x-auto">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-2 py-1 whitespace-nowrap transition-colors ${
                    pathname.startsWith(l.href)
                      ? "text-white font-semibold"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {org && (
                <Link href="/settings/billing" title="Monthly sends — click to upgrade">
                  <Meter used={org.sends_this_month} limit={org.monthly_send_limit} compact />
                </Link>
              )}
              <button
                onClick={logout}
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </nav>

        {user && !user.email_verified && (
          <div
            ref={bannerRef}
            className="fixed top-[57px] left-0 right-0 z-40 px-6 py-2.5 flex flex-wrap items-center justify-center gap-3 text-sm"
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              borderBottom: "1px solid rgba(245, 158, 11, 0.25)",
            }}
          >
            <span className="text-amber-300">
              Verify your email to start sending.
            </span>
            {resendMsg ? (
              <span className="text-white/60 text-xs">{resendMsg}</span>
            ) : (
              <button
                onClick={resendVerification}
                disabled={resending}
                className="text-amber-300 font-semibold underline underline-offset-2 hover:text-amber-200 disabled:opacity-50"
              >
                {resending ? "Sending…" : "Resend link"}
              </button>
            )}
          </div>
        )}

        <main
          className={`pb-16 px-6 max-w-6xl mx-auto ${
            user && !user.email_verified ? "pt-32" : "pt-20"
          }`}
        >
          {children}
        </main>

        <Modal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          title="You've hit your monthly limit"
        >
          <p className="text-sm text-white/60 mb-6">
            {upgradeMsg ||
              "You've used all your sends for this month. Upgrade your plan to keep the replies coming."}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setUpgradeOpen(false);
                router.push("/settings/billing");
              }}
            >
              See plans
            </Button>
            <Button variant="secondary" onClick={() => setUpgradeOpen(false)}>
              Not now
            </Button>
          </div>
        </Modal>
      </div>
    </OrgContext.Provider>
  );
}
