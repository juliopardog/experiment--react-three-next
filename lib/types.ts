export type UserRole = "owner" | "admin" | "member";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string;
  email_verified: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  monthly_send_limit: number;
  sends_this_month: number;
  sends_remaining: number;
}

export type CampaignStatus = "draft" | "active" | "paused" | "done";

export interface Campaign {
  id: string;
  name: string;
  description?: string | null;
  status: CampaignStatus;
  persona_prompt?: string | null;
  subject_hint?: string | null;
  body_hint?: string | null;
  follow_up_days?: number | null;
  max_follow_ups?: number | null;
  from_email?: string | null;
  from_name?: string | null;
}

export type LeadStatus =
  | "pending"
  | "draft_generated"
  | "sent"
  | "replied"
  | "bounced"
  | "unsubscribed";

export interface Lead {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  title?: string | null;
  website?: string | null;
  source?: string | null;
  status: LeadStatus;
}

export type DraftStatus = "pending_review" | "approved" | "rejected" | "sent";

export interface Draft {
  id: string;
  lead_id: string;
  subject: string;
  body: string;
  status: DraftStatus;
  lead?: Lead | null;
}

export type SearchStatus = "queued" | "running" | "done" | "failed";

export interface LeadSearch {
  id: string;
  query: string;
  requested_count: number;
  found_count: number;
  status: SearchStatus;
  error?: string | null;
}

export type DomainStatus = "verified" | "pending" | "failed";

export interface SenderDomain {
  id: string;
  domain: string;
  status: DomainStatus;
  /** JSON string — parse before rendering */
  dns_records: string;
}

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
}

export interface CampaignAnalytics {
  campaign_id: string;
  total_leads: number;
  drafts_pending_review: number;
  drafts_approved: number;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  emails_bounced: number;
  unsubscribed: number;
  /** 0-1 fractions — display as percentages */
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface TeamSeats {
  plan: string;
  seat_limit: number;
  seats_used: number;
  seats_available: number;
}

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
}

export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";

export interface TeamInvite {
  id: string;
  email: string;
  role: UserRole;
  status: InviteStatus;
  expires_at: string;
}
