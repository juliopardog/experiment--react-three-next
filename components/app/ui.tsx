"use client";

import { ReactNode } from "react";

/* Shared UI primitives for the app surface. Same dark aesthetic as the
   marketing site: #050508 background, card-glass panels, cyan primary. */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card-glass rounded-2xl p-6 ${className}`}>{children}</div>;
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  loading,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#00D4FF] text-[#050508] hover:bg-[#00D4FF]/90",
    secondary: "border border-white/20 text-white/80 hover:bg-white/5 hover:border-white/30",
    ghost: "text-white/60 hover:text-white",
    danger: "border border-red-500/40 text-red-400 hover:bg-red-500/10",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  hint,
  ...props
}: {
  label?: string;
  error?: string | null;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-white/70 font-medium">{label}</label>}
      <input
        {...props}
        className={`bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#00D4FF]/60 transition-colors ${
          error ? "border-red-500/60" : "border-white/10"
        } ${props.className || ""}`}
      />
      {hint && !error && <p className="text-xs text-white/35">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  hint,
  ...props
}: {
  label?: string;
  error?: string | null;
  hint?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-white/70 font-medium">{label}</label>}
      <textarea
        {...props}
        className={`bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#00D4FF]/60 transition-colors min-h-[100px] ${
          error ? "border-red-500/60" : "border-white/10"
        } ${props.className || ""}`}
      />
      {hint && !error && <p className="text-xs text-white/35">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  children,
  ...props
}: { label?: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-white/70 font-medium">{label}</label>}
      <select
        {...props}
        className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00D4FF]/60 transition-colors [&>option]:bg-[#12121a] ${
          props.className || ""
        }`}
      >
        {children}
      </select>
    </div>
  );
}

export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-white/20 border-t-[#00D4FF]"
      style={{ width: size, height: size }}
    />
  );
}

const CHIP_COLORS: Record<string, string> = {
  // lead statuses
  pending: "#9ca3af",
  draft_generated: "#7B2FFF",
  sent: "#00D4FF",
  replied: "#22c55e",
  bounced: "#ef4444",
  unsubscribed: "#f59e0b",
  // draft statuses
  pending_review: "#7B2FFF",
  approved: "#00D4FF",
  rejected: "#9ca3af",
  // campaign statuses
  draft: "#9ca3af",
  active: "#22c55e",
  paused: "#f59e0b",
  done: "#e5e7eb",
  // domain statuses
  verified: "#22c55e",
  failed: "#ef4444",
  // sources
  manual: "#9ca3af",
  csv: "#00D4FF",
  leadgen: "#FF006E",
};

export function Chip({ value }: { value: string }) {
  const color = CHIP_COLORS[value] || "#9ca3af";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: color + "1a", color, border: `1px solid ${color}40` }}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

export function Meter({
  used,
  limit,
  compact = false,
}: {
  used: number;
  limit: number;
  compact?: boolean;
}) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const color = pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#00D4FF";
  return (
    <div className={compact ? "w-36" : "w-full"}>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/50">{compact ? "Sends" : "Emails sent this month"}</span>
        <span className="text-white/70 font-semibold">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(5,5,8,0.8)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="card-glass rounded-2xl p-8 max-w-md w-full"
        style={{ background: "rgba(18,18,26,0.95)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
      {message}
    </p>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-white/45 text-sm mb-6 max-w-sm mx-auto">{body}</p>
      {action}
    </div>
  );
}

export function StatTile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="card-glass rounded-2xl p-5">
      <p className="text-3xl font-bold mb-1" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      <p className="text-xs text-white/45 uppercase tracking-wider font-semibold">{label}</p>
    </div>
  );
}
