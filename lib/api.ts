"use client";

const TOKEN_KEY = "pollolabs_token";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Fired when the API returns 402 (monthly quota exhausted). AppShell listens and opens the upgrade modal. */
export const QUOTA_EVENT = "pollolabs:quota-exceeded";

interface RequestOptions {
  method?: string;
  /** JSON body */
  json?: unknown;
  /** application/x-www-form-urlencoded body (auth token endpoint) */
  form?: Record<string, string>;
  /** multipart body (file uploads) */
  formData?: FormData;
  /** query string params; null/undefined/"" values are dropped */
  params?: Record<string, string | number | null | undefined>;
  /** skip Authorization header (register/login) */
  noAuth?: boolean;
}

function extractDetail(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // FastAPI validation errors: [{loc, msg, type}]
    const msgs = detail
      .map((d) => (d && typeof d === "object" ? (d as { msg?: string }).msg : null))
      .filter(Boolean);
    if (msgs.length) return msgs.join(". ");
  }
  return null;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = new URL(API_BASE + path);
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v !== null && v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  } else if (opts.form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(opts.form).toString();
  } else if (opts.formData) {
    body = opts.formData; // browser sets multipart boundary
  }

  if (!opts.noAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: opts.method || (body !== undefined ? "POST" : "GET"),
      headers,
      body,
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  if (res.status === 401 && !opts.noAuth) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  if (res.status === 204) return null as T;

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const detail = extractDetail(payload);
    let message = detail || `Request failed (${res.status})`;
    if (res.status === 402) {
      message = detail || "You've used all your sends for this month.";
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(QUOTA_EVENT, { detail: message }));
      }
    } else if (res.status === 404 && !detail) {
      message = "Not found.";
    }
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}
