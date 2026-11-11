// First-party visitor analytics, stored in Supabase `page_views` and shown on
// /admin. Every page view is recorded without identifiers; visitor and session
// ids (and so unique-visitor counts) are only kept once the visitor accepts
// analytics cookies in the consent banner.

import { supabase } from "@/lib/supabase";

const CONSENT_KEY = "uw-analytics-consent";
const VISITOR_KEY = "uw-visitor-id";
const SESSION_KEY = "uw-session-id";
const UTM_KEY = "uw-utm";

/** "all" = analytics + marketing (ad tags), "analytics" = our own stats only. */
export type Consent = "all" | "analytics" | "denied" | null;

export function getConsent(): Consent {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    if (v === "granted") return "analytics"; // choice saved before marketing cookies existed
    return v === "all" || v === "analytics" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: "all" | "analytics" | "denied"): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
    if (value === "denied") {
      window.localStorage.removeItem(VISITOR_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(UTM_KEY);
    }
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event("uw:consent"));
}

function storedId(storage: Storage, key: string): string | null {
  try {
    let id = storage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      storage.setItem(key, id);
    }
    return id;
  } catch {
    return null;
  }
}

function deviceType(): string {
  const w = window.innerWidth;
  if (/iPad|Tablet/i.test(navigator.userAgent) || (w >= 600 && w < 1024 && "ontouchstart" in window)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(navigator.userAgent) || w < 600) return "mobile";
  return "desktop";
}

/** UTM tags from the landing URL, kept for the rest of the visit when consented. */
function utm(consented: boolean): { utm_source: string | null; utm_medium: string | null; utm_campaign: string | null } {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };
  if (!consented) return fromUrl;
  try {
    if (fromUrl.utm_source) {
      window.sessionStorage.setItem(UTM_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const saved = window.sessionStorage.getItem(UTM_KEY);
    return saved ? JSON.parse(saved) : fromUrl;
  } catch {
    return fromUrl;
  }
}

const clip = (s: string | null, n: number) => (s ? s.slice(0, n) : null);

let lastTracked = "";

export async function trackPageView(path: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (/^(localhost|127\.|\[::1\])/.test(window.location.hostname)) return;
  // Avoid double counts from re-renders on the same page.
  const key = `${path}|${Math.floor(Date.now() / 2000)}`;
  if (key === lastTracked) return;
  lastTracked = key;

  const choice = getConsent();
  const consented = choice === "all" || choice === "analytics";
  const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : null;
  const { data } = await supabase.auth.getSession();
  const tags = utm(consented);

  await supabase.from("page_views").insert({
    path: clip(path, 300) ?? "/",
    referrer: clip(ref, 500),
    utm_source: clip(tags.utm_source, 100),
    utm_medium: clip(tags.utm_medium, 100),
    utm_campaign: clip(tags.utm_campaign, 100),
    device: deviceType(),
    visitor_id: consented ? storedId(window.localStorage, VISITOR_KEY) : null,
    session_id: consented ? storedId(window.sessionStorage, SESSION_KEY) : null,
    user_id: data.session?.user.id ?? null,
  });
}
