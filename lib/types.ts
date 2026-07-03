export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
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
}
